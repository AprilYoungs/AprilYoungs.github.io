---
layout: post
title:  "iOS-Interview"
date:   2019-11-11
categories: ios
---

#### 面向对象
* 一个NSObject对象占用多少内存？
>系统分配了16个字节给NSObject对象（通过malloc_size函数获得）
但NSObject对象内部只使用了8个字节的空间（64bit环境下，可以通过class_getInstanceSize函数获得）
OC对象有内存对齐机制，OC对象占用的空间是16byte的倍数

* 对象的isa指针指向哪里？
>instance对象的isa指向class对象
class对象的isa指向meta-class对象
meta-class对象的isa指向基类的meta-class对象

* OC的类信息存放在哪里？
>对象方法、属性、成员变量、协议信息，存放在class对象中
类方法，存放在meta-class对象中
成员变量的具体值，存放在instance对象

#### KVO
* iOS用什么方式实现对一个对象的KVO？(KVO的本质是什么？)
>利用RuntimeAPI动态生成一个子类，并且让`instance`对象的`isa`指向这个全新的子类`NSKVONotifying_XXX`
当修改`instance`对象的属性时，会调用`Foundation`的`_NSSetXXXValueAndNotify`函数<br>
`_NSSetXXXValueAndNotify`的实现伪代码如下
`willChangeValueForKey:`
父类原来的setter
`didChangeValueForKey:`<br>
内部会触发监听器（Oberser）的监听方法`(observeValueForKeyPath:ofObject:change:context:）`

* 如何手动触发KVO？
> 手动调用`willChangeValueForKey:`和`didChangeValueForKey:`

* 直接修改成员变量会触发KVO么？
>不会触发KVO

#### KVC
* 通过KVC修改属性会触发KVO么？
>会触发KVO

* KVC的赋值和取值过程是怎样的？原理是什么？
>![](/resource/kvc/kvcset.png)
setValue方法的调用顺序如上图
![](/resource/kvc/kvcget.png)
valueForKey方法的调用顺序如上图

#### Category
* Category的使用场合是什么？
> 1. 给系统类添加一些使用的方法，比如给`UIImageView`添加加载网络图片的方法，给`NSString`添加`md5`的方法
> 2. 重写系统类方法，添加分类后，会优先调用重写的方法
* Category的实现原理
> Category编译之后的底层结构是`struct category_t`，里面存储着分类的对象方法、类方法、属性、协议信息
在程序运行的时候，runtime会将Category的数据，合并到类信息中（类对象、元类对象中）

* Category和Class Extension的区别是什么？
> Class Extension在编译的时候，它的数据就已经包含在类信息中
Category是在运行时，才会将数据合并到类信息中

* Category中有load方法吗？load方法是什么时候调用的？load 方法能继承吗？
>有load方法
load方法在runtime加载类、分类的时候调用
load方法可以继承，但是一般情况下不会主动去调用load方法，都是让系统自动调用

* load、initialize方法的区别什么？它们在category中的调用的顺序？以及出现继承时他们之间的调用过程？
> 程序启动时会调用所有类和分类的`load`方法，`initialize`方法在第一次给类发送消息时调用。
`load`方法调用时，先调用类的`load`方法，如果有父类先调用父类的`load`方法，按编译顺序调用，然后再调用分类的`load`发方法，按编译顺序调用。
`initialize`的调用顺序，分类的`initialize`方法，当前类的，父类的。
系统自动调用`load`方法时会调用每个类和分类自己的`load`方法，主动调用`load`方法时会按照继承的顺序，子类的分类-》子类-》父类的分类-》父类。
`initialize`继承调用顺序，子类的分类-》子类-》父类的分类-》父类。

* Category能否添加成员变量？如果可以，如何给Category添加成员变量？
>不能直接给Category添加成员变量，但是可以通过runtime给分类绑定变量，实现Category有成员变量的效果

* block的原理是怎样的？本质是什么？
> 封装了函数调用以及调用环境的OC对象

* __block的作用是什么？有什么使用注意点？
> 让block可以修改捕获的对象。 需要注意循环引用的问题, 可以`__block __weak`一起使用。

* block的属性修饰词为什么是copy？使用block有哪些使用注意？
> block一旦没有进行copy操作，就不会在堆上，不能持有捕获的对象, 当需要使用捕获的对象时，可能捕获的对象已经释放了。
使用注意：循环引用问题

* block在修改NSMutableArray，需不需要添加__block？
> 不需要，对 NSMutableArray 数组的增删改，都不会修复NSMutableArray变量的地址，只有想给NSMutableArray变量重新赋值才需要使用 __block
