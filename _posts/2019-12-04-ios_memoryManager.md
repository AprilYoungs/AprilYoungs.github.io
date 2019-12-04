---
layout: post
title:  "内存管理"
date:   2019-12-04
categories: ios
---

### NSTimer & CADisplayLink
不管是`NSTimer`还是`CADisplayLink`都依赖于`RunLoop`，如果`RunLoop`的任务过于繁重，可能会导致`NSTimer`不准时

这个两个定时器使用时需要注意循环引用的问题
```objectivec

@interface ViewController ()
@property(nonatomic, strong) CADisplayLink *link;
@property(nonatomic, strong) NSTimer *timer;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.link = [CADisplayLink displayLinkWithTarget:self selector:@selector(linkTest)];
    [self.link addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];

    self.timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(linkTest) userInfo:nil repeats:YES];
}

- (void)linkTest
{
    NSLog(@"%s", __func__);
}

- (void)dealloc
{
#warning 因为runloop里边还存有timer，所以这里必须注销 timer 或者link
    [self.link invalidate];
    self.link = nil;
    [self.timer invalidate];
    self.timer = nil;
    
    NSLog(@"%s", __func__);
}
@end
```
使用上面的方法会造成循环引用，`ViewController`持有`timer`，`timer`持有`target（ViewController）`不会进入`dealloc`

<div class="center">
<image src="/resource/memoryManager/timer-retain.png" style="width: 700px;"/>
</div>

```objectivec
@interface AYProxy : NSProxy
+ (instancetype)proxyWithTarget:(id)target;
@end

@interface AYProxy ()
@property(nonatomic, weak) id target;
@end

@implementation AYProxy
+ (instancetype)proxyWithTarget:(id)target
{
    // NSProxy 对象不需要调用init方法，分配内存之后可以直接应用
    AYProxy *proxy = [AYProxy alloc];
    proxy.target = target;
    
    return proxy;
}

//// 生成方法签名
- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel
{
    return [self.target methodSignatureForSelector:sel];
}

// 消息转发
- (void)forwardInvocation:(NSInvocation *)invocation
{
    [invocation invokeWithTarget:self.target];
}
@end
```
定义一个`AYProxy`，让它继承`NSProxy`,内部使用弱引用的`target`，并实现消息转发的方法，这样可以使用它的来接收在作为`timer`的`target`，使用的时候，调用如下方法
```objectivec
- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.link = [CADisplayLink displayLinkWithTarget:[AYProxy proxyWithTarget:self] selector:@selector(linkTest)];
    [self.link addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];

    
    self.timer = [NSTimer scheduledTimerWithTimeInterval:1 target:[AYProxy proxyWithTarget:self] selector:@selector(linkTest) userInfo:nil repeats:YES];
}
````
这样可以解除循环引用问题
<div class="center">
<image src="/resource/memoryManager/timer-retain-weak.png" style="width: 700px;"/>
</div>


dealloc的时候如果不释放timer会出现如下的错误
```objectivec
- (void)dealloc
{
#warning 因为runloop里边还存有timer，所以这里必须注销 timer 或者link
    // [self.link invalidate];
    // self.link = nil;
    // [self.timer invalidate];
    // self.timer = nil;
    
    NSLog(@"%s", __func__);
}
```
<div class="center">
<image src="/resource/memoryManager/timer.png" style="width: 700px;"/>
</div>

<div class="center">
<image src="/resource/memoryManager/displaylink.png" style="width: 700px;"/>
</div>

`timer`的任务会在`runloop`的`dotimers`中执行，displayLink的任务会在runloop的`dosource1`中执行

### NSProxy
```objectivec
@interface NSProxy <NSObject> {
    Class	isa;
}
+ (id)alloc;
+ (id)allocWithZone:(nullable NSZone *)zone NS_AUTOMATED_REFCOUNT_UNAVAILABLE;
+ (Class)class;

- (void)forwardInvocation:(NSInvocation *)invocation;
- (nullable NSMethodSignature *)methodSignatureForSelector:(SEL)sel NS_SWIFT_UNAVAILABLE("NSInvocation and related APIs not available");
- (void)dealloc;
- (void)finalize;
@property (readonly, copy) NSString *description;
@property (readonly, copy) NSString *debugDescription;
+ (BOOL)respondsToSelector:(SEL)aSelector;

- (BOOL)allowsWeakReference API_UNAVAILABLE(macos, ios, watchos, tvos);
- (BOOL)retainWeakReference API_UNAVAILABLE(macos, ios, watchos, tvos);

// - (id)forwardingTargetForSelector:(SEL)aSelector;

@end
```
`NSProxy` 不继承 `NSObject`，是专门用来做消息转发的类，继承了`NSProxy`的类不会走`NSObject`的消息发送流程，会跳过消息动态解析的过程，直接进入消息转发

```objectivec
[[AYProxy proxyWithTarget:self] isKindOfClass:[ViewController class]];
```
上面的代码返回是`true`,因为`AYProxy`所有方法都会进入消息转发，跟直接调用`ViewController`的方法的结果是一样的。

#### GCD timer
GCD 的 timer 不需要添加到 `runloop`, 相对来说会比较准，而且也不用担心界面活动时timer会停止。

```objectivec
{
/// 让timer在这个队列中处理事件，使用主队列，timer里边的事件会在主线程处理
    dispatch_queue_t queue = dispatch_get_main_queue();
    // 开始时间，当前时间往后延迟的秒数
    NSTimeInterval start = 2;
    // 定时器的时间间隔
    NSTimeInterval interval = 0.5;
    
    // 创建一个source，存储timer信息
    dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
    // 设置timer参数，最后一个参数是能够容忍的误差，这里设定为时间间隔的十分之一
    dispatch_source_set_timer(timer, DISPATCH_TIME_NOW+start, interval * NSEC_PER_SEC, interval*0.1);
    
    // 设置定时到回调
    dispatch_source_set_event_handler(timer, ^{
        NSLog(@"%s,%@", __func__, [NSThread currentThread]);
    });

    // 也可以使用函数作为回调, 需要传入c语言的函数指针
    dispatch_source_set_event_handler_f(timer, timerEvent);
    
    # warning event_handler 只能有一个

    // 开启定时器
    dispatch_resume(timer);
    
    // 需要持有timer，不然创建之后被释放会失效
    self.timer = timer;
    
    // 关闭定时器，关闭之后将不能重新开启
    dispatch_cancel(self.timer);
}

void timerEvent()
{
   NSLog(@"%s,%@", __func__, [NSThread currentThread]);
}
```

### iOS程序的内存布局

<div class="center">
<image src="/resource/memoryManager/memoryLayout.png" style="width: 200px;"/>
</div>

程序启动之后，会把程序的`mach-o`文件加在到内存中, 从保留段到__DATA段是`mach-o`加载出来的。下面那些是程序运行起来后产生的内存。

* 保留段：用来存放空指针的，代码中的安全区，另外还存有mach-o文件的信息
* 代码段：编译之后的代码
* 数据段
    * 字符串常量：比如NSString *str = @"123"
    * 已初始化数据：已初始化的全局变量、静态变量等
    * 未初始化数据：未初始化的全局变量、静态变量等
* 栈：函数调用开销，比如局部变量。分配的内存空间地址越来越小
* 堆：通过alloc、malloc、calloc等动态分配的空间，分配的内存空间地址越来越大
