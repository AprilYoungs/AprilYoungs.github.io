---
layout: post
title:  "关联对象(association)"
date:   2019-11-11
categories: ios
---
iOS 的`category`无法添加属性, 但是可以通过`runtime`的关联对象相关方法实现`category`有成员变量的效果。

`runtime`方法
```cpp
// 添加关联对象
void objc_setAssociatedObject(_Nonnull object, const void * _Nonnull key, id  _Nullable value, objc_AssociationPolicy policy);
// 获取关联对象
id objc_getAssociatedObject(id  _Nonnull object, const void * _Nonnull key);
// 移除某个对象关联的所有对象
void objc_removeAssociatedObjects(id  _Nonnull object);
```

#### 使用方法
如下，可以`category`添加属性, 然后在`set`和`get`方法中调用`runtime`的api来关联属性
```cpp
@interface AYPerson (test)
@property(nonatomic, assign) int age;
@end

@implementation AYPerson (test)
- (void)setAge:(int)age
{
    objc_setAssociatedObject(self, @selector(age), @(age), OBJC_ASSOCIATION_ASSIGN);
}

- (int)age
{
    return [objc_getAssociatedObject(self, @selector(age)) intValue];
}
@end
```
#### key的设置方式
1. `static void *MyKey = &MyKey;`
```cpp
static void *MyKey = &MyKey;
objc_setAssociatedObject(obj, MyKey, value, OBJC_ASSOCIATION_RETAIN_NONATOMIC)
objc_getAssociatedObject(obj, MyKey)
```
这里使用 `static`关键字作用是让变量只能在当前文件内使用。
2. `static char MyKey`
```cpp
static char MyKey;
objc_setAssociatedObject(obj, &MyKey, value, OBJC_ASSOCIATION_RETAIN_NONATOMIC)
objc_getAssociatedObject(obj, &MyKey)
```

3. 使用属性名作为key
```cpp
objc_setAssociatedObject(obj, @"property", value, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
objc_getAssociatedObject(obj, @"property");
```

4. 使用get方法的@selecor作为key
```cpp
objc_setAssociatedObject(obj, @selector(getter), value, OBJC_ASSOCIATION_RETAIN_NONATOMIC)
objc_getAssociatedObject(obj, @selector(getter))
```

#### objc_AssociationPolicy
objc_AssociationPolicy|对应的修饰符
----|----
OBJC_ASSOCIATION_ASSIGN|`assign`
OBJC_ASSOCIATION_RETAIN_NONATOMIC|`strong, nonatomic`
OBJC_ASSOCIATION_COPY_NONATOMIC|`copy, nonatomic`
OBJC_ASSOCIATION_RETAIN|`strong, atomic`
OBJC_ASSOCIATION_COPY|`copy, atomic`

#### 关联对象的原理
实现关联对象技术的核心对象有:
`AssociationsManager`
`AssociationsHashMap`
`ObjectAssociationMap`
`ObjcAssociation`
```cpp
class AssociationsManager {
    // associative references: object pointer -> PtrPtrHashMap.
    static AssociationsHashMap *_map;
}
class AssociationsHashMap : public unordered_map<disguised_ptr_t, ObjectAssociationMap *>
class ObjectAssociationMap : public std::map<void *, ObjcAssociation>
class ObjcAssociation {
uintptr_t _policy;
id _value;
}
```
![](/resource/association/association.png)
##### objc 代码分析
`objc_setAssociatedObject` 添加关联对象
```cpp
void objc_setAssociatedObject(id object, const void *key, id value, objc_AssociationPolicy policy) {
    _object_set_associative_reference(object, (void *)key, value, policy);
}

void _object_set_associative_reference(id object, void *key, id value, uintptr_t policy) {
    // This code used to work when nil was passed for object and key. Some code
    // probably relies on that to not crash. Check and handle it explicitly.
    // rdar://problem/44094390
    if (!object && !value) return;
    
    assert(object);
    
    if (object->getIsa()->forbidsAssociatedObjects())
        _objc_fatal("objc_setAssociatedObject called on instance (%p) of class %s which does not allow associated objects", object, object_getClassName(object));
    
    // retain the new value (if any) outside the lock.
    ObjcAssociation old_association(0, nil);
    id new_value = value ? acquireValue(value, policy) : nil;
    {
        AssociationsManager manager;
        AssociationsHashMap &associations(manager.associations());
        // 获取object偏移后的值
        disguised_ptr_t disguised_object = DISGUISE(object);
        if (new_value) {
            // break any existing association.
            AssociationsHashMap::iterator i = associations.find(disguised_object);
            // 查看 associations 里边是否有这个object
            if (i != associations.end()) {
                // secondary table exists
                ObjectAssociationMap *refs = i->second;
                ObjectAssociationMap::iterator j = refs->find(key);
                // 查看 是否已经关联了这个键值
                if (j != refs->end()) {
                    old_association = j->second;
                    j->second = ObjcAssociation(policy, new_value);
                } else {
                    (*refs)[key] = ObjcAssociation(policy, new_value);
                }
            } else {
                // create the new association (first time).
                ObjectAssociationMap *refs = new ObjectAssociationMap;
                associations[disguised_object] = refs;
                (*refs)[key] = ObjcAssociation(policy, new_value);
                object->setHasAssociatedObjects();
            }
        } else {
            // 关联的值为 nil 时，移除键值对
            // setting the association to nil breaks the association.
            AssociationsHashMap::iterator i = associations.find(disguised_object);
            if (i !=  associations.end()) {
                ObjectAssociationMap *refs = i->second;
                ObjectAssociationMap::iterator j = refs->find(key);
                if (j != refs->end()) {
                    old_association = j->second;
                    refs->erase(j);
                }
            }
        }
    }
    // release the old value (outside of the lock).
    if (old_association.hasValue()) ReleaseValue()(old_association);
}
```
`objc_getAssociatedObject` 获取关联对象
```cpp
id objc_getAssociatedObject(id object, const void *key) {
    return _object_get_associative_reference(object, (void *)key);
}
id _object_get_associative_reference(id object, void *key) {
    id value = nil;
    uintptr_t policy = OBJC_ASSOCIATION_ASSIGN;
    {
        AssociationsManager manager;
        AssociationsHashMap &associations(manager.associations());
        disguised_ptr_t disguised_object = DISGUISE(object);
        AssociationsHashMap::iterator i = associations.find(disguised_object);
        if (i != associations.end()) {
            ObjectAssociationMap *refs = i->second;
            ObjectAssociationMap::iterator j = refs->find(key);
            if (j != refs->end()) {
                ObjcAssociation &entry = j->second;
                value = entry.value();
                policy = entry.policy();
                if (policy & OBJC_ASSOCIATION_GETTER_RETAIN) {
                    objc_retain(value);
                }
            }
        }
    }
    if (value && (policy & OBJC_ASSOCIATION_GETTER_AUTORELEASE)) {
        objc_autorelease(value);
    }
    return value;
}
```
`objc_removeAssociatedObjects` 移除关联对象
```cpp
void objc_removeAssociatedObjects(id object) 
{
    if (object && object->hasAssociatedObjects()) {
        _object_remove_assocations(object);
    }
}

void _object_remove_assocations(id object) {
    vector< ObjcAssociation,ObjcAllocator<ObjcAssociation> > elements;
    {
        AssociationsManager manager;
        AssociationsHashMap &associations(manager.associations());
        if (associations.size() == 0) return;
        disguised_ptr_t disguised_object = DISGUISE(object);
        AssociationsHashMap::iterator i = associations.find(disguised_object);
        // 查看这个对象时候有关联对象，如果有，把这个对象的所有关联对象都添加到一个数组中，
        //从 AssociationsHashMap 中移除并释放对象
        if (i != associations.end()) {
            // copy all of the associations that need to be removed.
            ObjectAssociationMap *refs = i->second;
            for (ObjectAssociationMap::iterator j = refs->begin(), end = refs->end(); j != end; ++j) {
                elements.push_back(j->second);
            }
            // remove the secondary table.
            delete refs;
            associations.erase(i);
        }
    }
    // 移除并释放 对象关联的所有对象
    // the calls to releaseValue() happen outside of the lock.
    for_each(elements.begin(), elements.end(), ReleaseValue());
}
```

reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)