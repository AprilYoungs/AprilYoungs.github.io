---
layout: post
title:  "内存管理"
date:   2019-12-04
categories: ios
---

### NSTimer & CADisplayLink
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