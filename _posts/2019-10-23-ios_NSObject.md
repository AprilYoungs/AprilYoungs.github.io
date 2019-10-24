---
layout: post
title:  "Object-C 对象的本质"
date:   2019-10-11
categories: ios
---

OC的类是使用C/C++的结构体来实现的
可以在`terminal`中运行如下代码, 把OC代码转换成c++代码，方便研究
```c
xcrun -sdk iphoneos clang -arch arm64 -rewrite-objc objcFile.m -o objcFile_arm64.cpp
```

### NSObject 

#### 一个NSObject对象占用多少内存？
* 系统分配了16个字节给`NSObject`对象（通过`malloc_size`函数获得）
```c
// 获取指针指向地址占用内存的空间 16
NSLog(@"Malloc size -> %zd", malloc_size((__bridge void *)obj));
```
* 但`NSObject`对象内部只使用了8个字节的空间（64bit环境下，可以通过`class_getInstanceSize`函数获得）
```c
 NSObject *obj = [[NSObject alloc] init];
        // 获取实例占有内存的空间 8
 NSLog(@"NSOject instance size -> %zu", class_getInstanceSize([NSObject class]));
```

查看源码，可以看到OC对象的最小占用空间是 16 bit，不足 16 bit 时补足到 16 bit.
![](/resource/nsobject/alloc_size.png)

### 对象继承
定义一个`People`类继承`NSObject`
```c
@interface People : NSObject
{
    @public
    int _age;
    int _version;
}

@property(nonatomic, assign) NSInteger height;
@end
@implementation People
@end
```
上面的类转化成C代码如下
```c
struct NSObject_IMPL {
	Class isa;
};

struct People_IMPL {
	struct NSObject_IMPL NSObject_IVARS;
	int _age;
	int _version;
	NSInteger _height;
};

// @property(nonatomic, assign) NSInteger height;
/* @end */
// @implementation People

static NSInteger _I_People_height(People * self, SEL _cmd) { return (*(NSInteger *)((char *)self + OBJC_IVAR_$_People$_height)); }
static void _I_People_setHeight_(People * self, SEL _cmd, NSInteger height) { (*(NSInteger *)((char *)self + OBJC_IVAR_$_People$_height)) = height; }
// @end
```
`People`的机构体里边有当前类声明的属性，还有来之父类结构体 `NSObject_IMPL`，存到了一个属性 `NSObject_IVARS` 中，而 `People`的 `set`,`get`方法都定义为静态函数，跟 `People` 关联起来
`People` 占用的内存大小，Class（8）+ int（4）+ int（4）+ NSInteger(8) = 24,从结构体的计算方式可以得出这个结果
```c
class_getInstanceSize([People class]) -> 24
```
但是实际分配的内存是 32
```c
People *p = [[People alloc] init];
malloc_size((__bridge void *)p) -> 32
```
这个因为OC的内存分配机制导致的, OC类的实际内存大小都是 16 的倍数

### sizeof, class_getInstanceSize, malloc_size 的比较
```c
sizeof(p) -> 8
class_getInstanceSize([People class]) -> 24
malloc_size((__bridge void *)p) -> 32
```
`sizeof` 获取变量类型的空间，这里 `p`是8位的指针 
`class_getInstanceSize` 获取实例变量实际使用的空间 
`malloc_size` 获取变量在内存中实际分配到的空间

### OC对象的分类
1. instance 
    实例对象，实例化之后的对象，存有对应类的成员变量，每个`instance`在内存中的地址都不一样
2. class
    类对象，存有类信息，在内存中只存了一个，类对象成员对象名和类型，还有关联的实例方法
3. meta-class
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

reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)