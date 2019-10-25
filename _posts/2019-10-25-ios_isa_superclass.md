---
layout: post
title:  "isa 和 superclass 指针"
date:   2019-10-25
categories: ios
---
### OC对象的分类
1. `instance` 
    实例对象，实例化之后的对象，存有对应类的成员变量，每个`instance`在内存中的地址都不一样
2. `class`
    类对象，存有类信息，在内存中只存了一个，类对象成员变量名和类型，还有关联的实例方法
3. `meta-class`
    元类对象，在内存中只存了一个，存有类方法
```c
 // 可以通过实例化 class 来 得到 instance
        NSObject *obj1 = [[NSObject alloc] init];
        NSObject *obj2 = [[NSObject alloc] init];
        NSObject *obj3 = [[NSObject alloc] init];
        
        // 获取 class 的三种方式
        Class class1 = [obj1 class];
        Class class2 = object_getClass(obj2);
        Class class3 = [NSObject class];
        
        // 使用 object_getClass 获取 class 的meta-class
        Class metaClass = object_getClass(class1);
        Class metaClass2 = object_getClass(metaClass);
        
        
        NSLog(@"Objects -> \n%p,\n%p,\n%p", obj1, obj2, obj3);
        /**
         Objects ->
         0x1005b0de0,
         0x1005ae040,
         0x1005add00
         */
        
        // class 的 isa 指向 meta-class
        NSLog(@"Classes -> \n%p,\n%p,\n%p,\n%d", class1, class2, class3, class_isMetaClass(class3));
        /**
         Classes ->
         0x7fff91d97118,
         0x7fff91d97118,
         0x7fff91d97118,
         0
         */
        
        // meta-class 的isa指向meta-class
        NSLog(@"Meta Classes -> \n%p\n%p, \n is metaclass %d", metaClass, metaClass2, class_isMetaClass(metaClass));
        /**
          Meta Class ->
         0x7fff91d970f0,
         0x7fff91d970f0,
         is metaclass 1
         */
```
`OC` 的 `class` 对象其实是个结构体，`isa` 是一个指向类本身的指针，`instance`的`isa`指向`class`, `class` 的`isa`指向 `meta-class`，`meta-class`的`isa`指向`meta-class`
```c
typedef struct objc_class *Class;
struct objc_class {
    Class _Nonnull isa;
    Class _Nullable super_class;
    const char * _Nonnull name;
    long version;
    long info;
    long instance_size;
    struct objc_ivar_list * _Nullable ivars;
    struct objc_method_list * _Nullable * _Nullable methodLists;
    struct objc_cache * _Nonnull cache;
    struct objc_protocol_list * _Nullable protocols;
}
```

![](/resource/isaSuperclass/isaclass.png)
reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)