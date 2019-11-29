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

### Block
* block的原理是怎样的？本质是什么？
> 封装了函数调用以及调用环境的OC对象

* __block的作用是什么？有什么使用注意点？
> 让block可以修改捕获的对象。 需要注意循环引用的问题, 可以`__block __weak`一起使用。

* block的属性修饰词为什么是copy？使用block有哪些使用注意？
> block一旦没有进行copy操作，就不会在堆上，不能持有捕获的对象, 当需要使用捕获的对象时，可能捕获的对象已经释放了。
使用注意：循环引用问题

* block在修改NSMutableArray，需不需要添加__block？
> 不需要，对 NSMutableArray 数组的增删改，都不会修复NSMutableArray变量的地址，只有想给NSMutableArray变量重新赋值才需要使用 __block

### runtime
* 讲一下 OC 的消息机制
> OC中的方法调用其实都是转成了objc_msgSend函数的调用，给receiver（方法调用者）发送了一条消息（selector方法名）
objc_msgSend底层有3大阶段
消息发送（当前类、父类中查找）、动态方法解析、消息转发

* 消息转发机制流程
> [看图](/blog/2019/11/18/ios_runtime)

* 什么是Runtime？平时项目中有用过么？
> OC是一门动态性比较强的编程语言，允许很多操作推迟到程序运行时再进行<br>
OC的动态性就是由Runtime来支撑和实现的，Runtime是一套C语言的API，封装了很多动态性相关的函数<br>
平时编写的OC代码，底层都是转换成了Runtime API进行调用<br><br>
> 具体应用<br>
利用关联对象（AssociatedObject）给分类添加属性<br>
遍历类的所有成员变量（修改textfield的占位文字颜色、字典转模型、自动归档解档）<br>
交换方法实现（交换系统的方法）<br>
利用消息转发机制解决方法找不到的异常问题<br>
......

* 写出如下程序的打印结果 `isMemberOfClass`,`isKindOfClass`

```objectivec
@interface AYPerson : NSObject
@end
@implementation AYPerson
@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        BOOL res1 = [NSObject isKindOfClass:[NSObject class]];
        BOOL res3 = [NSObject isMemberOfClass:[NSObject class]];
        BOOL res2 = [AYPerson isKindOfClass:[AYPerson class]];
        BOOL res4 = [AYPerson isMemberOfClass:[AYPerson class]];
        
        NSLog(@"%d %d %d %d", res1, res2, res3, res4);
        
        NSObject *obj = [[NSObject alloc] init];
        AYPerson *per = [[AYPerson alloc] init];
        BOOL res5 = [obj isKindOfClass:[NSObject class]];
        BOOL res6 = [obj isMemberOfClass:[NSObject class]];
        BOOL res7 = [per isKindOfClass:[AYPerson class]];
        BOOL res8 = [per isMemberOfClass:[AYPerson class]];
        
        NSLog(@"%d %d %d %d", res5, res6, res7, res8);
    }
    return 0;
}
```
> 1 0 0 0 <br> 1 1 1 1<br>
上面这道题考察的是对 `isMemberOfClass`,`isKindOfClass` 运行机制的理解, 前者判断是否是对应类，后者判断是否是对应类的子类，这里需要注意的是使用实例对象调用的结果和使用类对象调用的结果有不同， 使用类对象调用的结果是判断meta-class，而实例对象判断的是class.

查看[apple objc4](https://opensource.apple.com/tarballs/objc4/)可以找到对应的方法实现
```objectivec
+ (BOOL)isMemberOfClass:(Class)cls {
    // 获取meta-class
    return object_getClass((id)self) == cls;
}

- (BOOL)isMemberOfClass:(Class)cls {
    // 获取class
    return [self class] == cls;
}

+ (BOOL)isKindOfClass:(Class)cls {
    // 获取meta-class，并依次判断是否有一个superclass是相同的
    for (Class tcls = object_getClass((id)self); tcls; tcls = tcls->superclass) {
        if (tcls == cls) return YES;
    }
    return NO;
}

- (BOOL)isKindOfClass:(Class)cls {
    // 获取class，并依次判断是否有一个superclass是相同的
    for (Class tcls = [self class]; tcls; tcls = tcls->superclass) {
        if (tcls == cls) return YES;
    }
    return NO;
}
```
上面的题有一点需要注意
`BOOL res1 = [NSObject isKindOfClass:[NSObject class]]; res1 == true`<br>因为`NSObject`比较特殊，`NSOject`的`metaclass`的`superClass`指向`NSOject`, 因为这个特殊性，所以`NSObject`的类方法找不到时会去调用`NSObject`同名的实例方法

* 以下代码能不能执行，如果可以，打印结果是什么？

```objectivec
@interface AYPerson : NSObject
@property(nonatomic, strong) NSString *name;
- (void)print;
@end
@implementation AYPerson
- (void)print
{
    NSLog(@"my name is %@", self.name);
}
@end

@interface ViewController ()
@end

@implementation ViewController
- (void)viewDidLoad {
    [super viewDidLoad];    
    id cls = [AYPerson class];
    void *obj = &cls;
    
    [(__bridge id)obj print];
}
@end
```

> my name is <ViewController: 0x7fbcc47036c0> 

> 这段代码可以执行成功，分两个点来解释，1. 为什么可以正常调用实例方法？ <br>2. 为什么打印出来是  `<ViewController: 0x7fbcc47036c0>`?

> 1. 为什么可以正常调用实例方法？
<div class="center">
<image src="/resource/interview/getInstance.png" style="width: 500px;"/>
</div>

正常的创建一个
`AYPerson *person = [[AYPerson alloc] init];` 这个`person`是一个由`isa`指针和`_name`组成的结构体，然后`person`指针指向`isa`，`isa`指向`[AYPerson class]`.
而上面的`obj`指向`cls`, `cls`指向`[AYPerson class]`, 所以`obj`和`person`都存有指向`[AYPerson class]`的指针, 因此obj可以正常调用`print`方法。

> 2. 为什么打印出来是 `<ViewController>`?<br>
`person`的`self.name`在运行时会去找内存中跟`isa`挨着的下一块内存地址上面的值。而跟`cls`挨着的是前面定义的变量。

这里讲一下大端下端存储的问题，运行如下代码
```objectivec
int a = 2;
int b = 4;
int c = 8;
NSLog(@"\n%p\n%p\n%p", &a, &b, &c);
/*
0x7ffee3d4313c
0x7ffee3d43138
0x7ffee3d43134
*/

struct {
    int a;
    int b;
}test;

test.a = 10;
test.b = 20;
NSLog(@"\nstruct a: %p\nstruct b:
%p", &(test.a), &(test.b));
/*
struct a: 0x7ffee3d43128
struct b: 0x7ffee3d4312c
*/
```
可以看出前面定义的变量会存在栈中的高位，从大到小，而结构体中的变量在栈中的地址根据定义的顺序升位，从小到大。

下面解释为什么跟`obj`挨着的下一块内存地址上面的值是`<ViewController: 0x7fbcc47036c0> `
<div class="center">
<image src="/resource/interview/getInstance2.png" style="width: 500px;"/>
</div>

在创建`cls`的代码出打一个断点，查看汇编代码
<div class="center">
<image src="/resource/interview/getInstance3.png" style="width: 500px;"/>
</div>

可以看到在创建`cls`之前调用了 `objc_msgSendSuper2`
<div class="center">
<image src="/resource/interview/getInstance4.png" style="width: 650px;"/>
</div>

查看[apple objc4](https://opensource.apple.com/tarballs/objc4/)源码

<div class="center">
<image src="/resource/interview/getInstance5.png" style="width: 500px;"/>
</div>

从汇编的实现的注释中可以看出，传进去了两个参数，`real receiver, class`, 然后会再通过`class`获取`superclass`。
方法的声明如下， 需要传入一个`objc_super`的结构体。
```cpp
#if __OBJC2__
// objc_msgSendSuper2() takes the current search class, not its superclass.
OBJC_EXPORT id _Nullable
objc_msgSendSuper2(struct objc_super * _Nonnull super, SEL _Nonnull op, ...)
```
所以可以推测调用`[super viewDidLoad]; `会生成一个这样的结构体
```cpp
struct objc_super super = {self, [self class]};
```
因此`obj`挨这的下一块内存地址上面的值是<ViewController: 0x7fbcc47036c0>

可以使用`lldb`调试验证上面从源码理解是否准确
<div class="center">
<image src="/resource/interview/getInstance6.png" style="width: 700px;"/>
</div>

和前面分析的结论一致

### Runloop
* 讲讲 RunLoop，项目中有用到吗？
> 1. 解决NSTimer在界面滑动时停止工作的问题 <br> 2. 控制线程的生命周期 

* runloop内部实现逻辑？
> iOS程序启动时会在主线程创建一个`runloop`，并运行，`runloop`进入某个模式之后会处理`sources，timer，block, port, GCD 的 main queue`, 然后进入休眠，有唤醒事件时会被唤醒处理相应事件，处理完之后判断是否退出，满足条件则退出，不然就一直循环下去。当`runloop`没有`timer`,`sources`或者`port`时，`runloop`处理完事件就会退出。

* runloop和线程的关系？
> 一个线程里边只能有一个`runloop`，主线程开启主`runloop`，其他线程创建的时候没有`runloop`，调用`CFRunLoopGetCurrent()`时会创建一个`runloop`

* timer 与 runloop 的关系？
> `runloop`里边可以添加多个`timer`，把`timer`添加到`runloop`的指定`mode`中，当`runloop`在对应模式中运行时，会处理当前模式下对应的`timers`.

* 程序中添加每3秒响应一次的NSTimer，当拖动tableview时timer可能无法响应要怎么解决？
> 一般创建的`timer`会被添加到`default mode`中，而拖动`tableview`时`runloop`会进入`tracking mode`，导致拖动期间`timer`不计时，可以通过把timer添加到`common modes` 来解决这个问题，`common mode` 包含`default mode` 和 `tracking mode`


`runloop` 是怎么响应用户操作的， 具体流程是什么样的？
> iOS程序启动时会在主线程启动一个`runloop`，让程序保持运行状态，当有交互事件发生时，会触发`runloop`的`source0`事件，`source0`再调用`Application`的响应方法，`applicaiton`根据响应链的流程把事件传递到对应方法中，如果没有实现响应方法，程序就什么都不处理。

* 说说`runLoop`的几种状态
>   kCFRunLoopEntry = (1UL << 0),   //进入runloop
    kCFRunLoopBeforeTimers = (1UL << 1), //即将进入timer
    kCFRunLoopBeforeSources = (1UL << 2), //即将进入Sources
    kCFRunLoopBeforeWaiting = (1UL << 5), //即将进入等待
    kCFRunLoopAfterWaiting = (1UL << 6),  //等待结束
    kCFRunLoopExit = (1UL << 7),  //退出runloop

* runloop的mode作用是什么？
> 常用的有`default`和`tracking`, 不同的`mode`中存有不同的`source, timer, port`, 所以`runloop`在不同的`mode`中会处理不同的事件, 把不同的事件隔离开来，程序运行就会比较流畅。

### 多线程
* 以下面的代码在主线程执行的会产生死锁吗？
```objectivec
NSLog(@"misson: 1");       
dispatch_sync(dispatch_get_main_queue(), ^{
    NSLog(@"misson: 2, %@", [NSThread currentThread]);
});
NSLog(@"misson: 3");
```
> 会<br>1. 主线程的串行队列，意味着需要等misson3执行完之后才能执行misson2<br>2. sync同步执行，需要执行完代码块里边的任务才能执行misson3<br>(1,2)冲突，线程卡死了

* 如下代码运行结果是什么？ 为什么
```objectivec
dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
dispatch_async(queue, ^{
    NSLog(@"1");
    [self performSelector:@selector(test) withObject:nil afterDelay:0.0];
//        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:2]];
        
    NSLog(@"3");
});
```
> 1, 3<br>查看注释<br>This method sets up a timer to perform the aSelector message on the current thread’s run loop. The timer is configured to run in the default mode (NSDefaultRunLoopMode).<br>
`performSelector:withObject:afterDelay:`不会执行，因为它使用添加到`runloop`的`timer`来执行，子线程的`runloop`没有运行起来，可以通过启动`runloop`来让`performSelector:withObject:afterDelay:`正常执行。
