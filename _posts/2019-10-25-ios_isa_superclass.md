---
layout: post
title:  "isa 和 superclass 指针"
date:   2019-10-25
categories: ios
---
### OC对象的分类
1. `instance` 
    实例对象, 实例化之后的对象, 每个`instance`在内存中的地址都不一样, `instance`对象在内存中存储的信息包括:`isa`指针, 其他成员变量
2. `class`
    类对象, 存有类信息, 在内存中只存了一份, `class`对象在内存中存储的信息主要包括: `isa指针`, `superclass指针`, 类的属性信息(@property), 类的对象方法信息(instance method), 类的协议信息(protocol), 类的成员变量信息(ivar)
    <br><img src="/resource/isaSuperclass/class.png" style="width:200px">

3. `meta-class`
    元类对象, 在内存中只存了一份, meta-class对象和class对象的内存结构是一样的, 但是用途不一样, 在内存中存储的信息主要包括:`isa指针`, `superclass指针`, 类的类方法信息(class method)
    <br><img src="/resource/isaSuperclass/meta_class.png" style="width:200px">

instance & class & meta-class 以及类继承之间的关系
![](/resource/isaSuperclass/isaclass.png)


### isa指针指向
如上图, `OC`的实例 `instance`的`isa` 是一个指向类本身的指针, `instance`的`isa`指向`class`,  `class` 的`isa`指向 `meta-class`, `meta-class`的`isa`指向`NSObject`的`meta-class`
![](/resource/isaSuperclass/isa.png)
代码验证
```c
@interface People : NSObject
@property(nonatomic,  assign) int age;
@end

@implementation People
@end

  // 可以通过实例化 class 来 得到 instance
        People *p1 = [[People alloc] init];
        People *p2 = [[People alloc] init];
        People *p3 = [[People alloc] init];
        NSObject *objc4 = [[NSObject alloc] init];
        
        NSLog(@"Objects -> \n%p, \n%p, \n%p, \n%p",  p1,  p2,  p3,  objc4);
        /**
         Objects ->
         0x102000040,  p1
         0x1020000a0,  p2
         0x1020000b0,  p3
         0x1020000c0 objc4
         */
        
        
        // 获取 class 的三种方式
        Class class1 = [p1 class];
        Class class2 = object_getClass(p2);
        Class class3 = [People class];
        Class class4 = [NSObject class];
        
        NSLog(@"Classes -> \n%p, \n%p, \n%p, \n%p, \n%d",  class1,  class2,  class3,  class4,  class_isMetaClass(class3));
        /**
         Classes ->
         0x100004660,    People
         0x100004660,    People
         0x100004660,    People
         0x7fff980f7118,  NSObject
         0  class_isMetaClass
         */
        
        
        // 使用 object_getClass 获取 class 的meta-class
        // class 的 isa 指向 metaClass
        Class metaClass = object_getClass(class1);
        Class metaClass2 = object_getClass(class4);
        
        NSLog(@"Meta Classes -> \n%p\n%p, \n is metaclass %d",  metaClass,  metaClass2,  class_isMetaClass(metaClass));
        /**
         Meta Classes ->
         0x100004658
         0x7fff980f70f0, 
          is metaclass 1
         */
        
        
        //  任何类的 metaClass 的 isa 都指向 NSObject 的 metaClass
        Class metaOfmetaClass1 = object_getClass(metaClass);
        Class metaOfmetaClass2 = object_getClass(metaClass2);
        
        NSLog(@"MetaOfmetaClass -> \n%p, \n%p",  metaOfmetaClass1,  metaOfmetaClass2);
        /**
         MetaOfmetaClass ->
         0x7fff980f70f0, 
         0x7fff980f70f0
         */
```

### superClass指针指向
`class`的`superclass`
![](/resource/isaSuperclass/superclass.png)
`meta-class`的`superclass`
![](/resource/isaSuperclass/meta_superclass.png)

下面代码验证上图右上角中`rootClass(meta)` 的 `superclass` 指向 `rootClass`
```c
@interface NSObject(Catagory)
- (void)test;
+ (void)test;
@end

@implementation NSObject(Catagory)
- (void)test
{
    NSLog(@"-instanceMethod-> %p",  self);
}
@end

@interface People
- (void)test;
+ (void)test;
@end

@implementation People
- (void)test
{
    NSLog(@"-People-instanceMethod-> %p",  self);
}
@end

int main(int argc,  const char * argv[]) {
    @autoreleasepool {
        // insert code here...
        NSObject *obj = [[NSObject alloc] init];
        
        [obj test];
        [NSObject test]; 
        /**
         -instanceMethod-> 0x1005b82b0  
         NSObject 没有实现类方法时会调用同名 实例方法
         -instanceMethod-> 0x7fff980f7118
         */
        
        People *p = [[People alloc] init];
        [p test];
        [People test];
        /**
         -People-instanceMethod-> 0x100540110
         People 没有实现类方法时, 会一步步的找superclass的类方法, 如果都没有, 最后会调用 NSObject 同名实例方法, 还是没有就崩溃啦
         -instanceMethod-> 0x100002180
         */

    }
    return 0;
}
```
reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)