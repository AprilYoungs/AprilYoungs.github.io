---
layout: post
title:  "Runloop"
date:   2019-11-26
categories: ios
---

iOS 程序启动时会创建一个`runloop`这样才能响应app的各种交互事件。

iOS 有两套runloop相关的框架
`Foundation: NSRunLoop`
`Core Foundation: CFRunLoopRef`

<div class="center">
<image src="/resource/runloop/relations.png" style="width: 200px;"/>
</div>

可以通过如下方式获取runloop
```objectivec
    // 获取 runloop对象
    // foundation
    NSRunLoop *mloop = [NSRunLoop mainRunLoop];
    NSRunLoop *loop = [NSRunLoop currentRunLoop];
    
    // core foundation
    CFRunLoopRef cloop = CFRunLoopGetCurrent();
    CFRunLoopRef cmloop = CFRunLoopGetMain();
```

### runloop 与 线程的关系
* 每条线程都有唯一的一个与之对应的`RunLoop`对象

* RunLoop保存在一个全局的`Dictionary`里，线程作为`key，RunLoop`作为`value`

* 线程刚创建时并没有`RunLoop`对象，`RunLoop`会在第一次获取它时创建

* 没有待办事件时，`RunLoop`会在线程结束时销毁

* 主线程的`RunLoop`已经自动获取（创建），子线程默认没有开启`RunLoop`

查看`CFRunLoopGetCurrent`源码
```c
CFRunLoopRef CFRunLoopGetCurrent(void) {
    CHECK_FOR_FORK();
    CFRunLoopRef rl = (CFRunLoopRef)_CFGetTSD(__CFTSDKeyRunLoop);
    if (rl) return rl;
    return _CFRunLoopGet0(pthread_self());
}

// should only be called by Foundation
// t==0 is a synonym for "main thread" that always works
CF_EXPORT CFRunLoopRef _CFRunLoopGet0(pthread_t t) {
    if (pthread_equal(t, kNilPthreadT)) {
	    t = pthread_main_thread_np();
    }
    // 如果还没有创建存runloop的全局字典，先创建一个
    // 并创建主线程的runloop
    __CFLock(&loopsLock);
    if (!__CFRunLoops) {
        __CFUnlock(&loopsLock);
	    CFMutableDictionaryRef dict = CFDictionaryCreateMutable(kCFAllocatorSystemDefault, 0, NULL, &kCFTypeDictionaryValueCallBacks);
	    CFRunLoopRef mainLoop = __CFRunLoopCreate(pthread_main_thread_np());
	    CFDictionarySetValue(dict, pthreadPointer(pthread_main_thread_np()), mainLoop);
	if (!OSAtomicCompareAndSwapPtrBarrier(NULL, dict, (void * volatile *)&__CFRunLoops)) {
	    CFRelease(dict);
	}
	CFRelease(mainLoop);
        __CFLock(&loopsLock);
    }
    // 查找有没有对应线程的runloop
    // 没有就创建一个，并添加到用来存runloops的全局字典中
    CFRunLoopRef loop = (CFRunLoopRef)CFDictionaryGetValue(__CFRunLoops, pthreadPointer(t));
    __CFUnlock(&loopsLock);
    if (!loop) {
	CFRunLoopRef newLoop = __CFRunLoopCreate(t);
        __CFLock(&loopsLock);
	loop = (CFRunLoopRef)CFDictionaryGetValue(__CFRunLoops, pthreadPointer(t));
	if (!loop) {
	    CFDictionarySetValue(__CFRunLoops, pthreadPointer(t), newLoop);
	    loop = newLoop;
	}
        // don't release run loops inside the loopsLock, because CFRunLoopDeallocate may end up taking it
        __CFUnlock(&loopsLock);
	CFRelease(newLoop);
    }
    if (pthread_equal(t, pthread_self())) {
        _CFSetTSD(__CFTSDKeyRunLoop, (void *)loop, NULL);
        if (0 == _CFGetTSD(__CFTSDKeyRunLoopCntr)) {
            _CFSetTSD(__CFTSDKeyRunLoopCntr, (void *)(PTHREAD_DESTRUCTOR_ITERATIONS-1), (void (*)(void *))__CFFinalizeRunLoop);
        }
    }
    return loop;
}
```
上面的代码验证前面三点

#### runloop 相关的类
`Core Foundation`中关于RunLoop的5个类
* CFRunLoopRef
* CFRunLoopModeRef
* CFRunLoopSourceRef
* CFRunLoopTimerRef
* CFRunLoopObserverRef

<div class="center">
<image src="/resource/runloop/runloopStructs.png" style="width: 350px;"/>
</div>

```c
typedef struct __CFRunLoopMode *CFRunLoopModeRef;
typedef struct __CFRunLoop * CFRunLoopRef;
typedef struct __CFRunLoopSource * CFRunLoopSourceRef;
typedef struct __CFRunLoopObserver * CFRunLoopObserverRef;
typedef struct __CFRunLoopTimer * CFRunLoopTimerRef;

struct __CFRunLoop {
    pthread_t _pthread;
    CFMutableSetRef _commonModes;
    CFMutableSetRef _commonModeItems;
    CFRunLoopModeRef _currentMode;
    CFMutableSetRef _modes;
//次要的属性
    CFRuntimeBase _base;
    pthread_mutex_t _lock;			/* locked for accessing mode list */
    __CFPort _wakeUpPort;			// used for CFRunLoopWakeUp 
    Boolean _unused;
    volatile _per_run_data *_perRunData;              // reset for runs of the run loop
    uint32_t _winthread;
    struct _block_item *_blocks_head;
    struct _block_item *_blocks_tail;
    CFAbsoluteTime _runTime;
    CFAbsoluteTime _sleepTime;
    CFTypeRef _counterpart;
};

struct __CFRunLoopSource {
    CFRuntimeBase _base;
    uint32_t _bits;
    pthread_mutex_t _lock;
    CFIndex _order;			/* immutable */
    CFMutableBagRef _runLoops;
    union {
	CFRunLoopSourceContext version0;	/* immutable, except invalidation */
        CFRunLoopSourceContext1 version1;	/* immutable, except invalidation */
    } _context;
};

struct __CFRunLoopObserver {
    CFRuntimeBase _base;
    pthread_mutex_t _lock;
    CFRunLoopRef _runLoop;
    CFIndex _rlCount;
    CFOptionFlags _activities;		/* immutable */
    CFIndex _order;			/* immutable */
    CFRunLoopObserverCallBack _callout;	/* immutable */
    CFRunLoopObserverContext _context;	/* immutable, except invalidation */
};

struct __CFRunLoopTimer {
    CFRuntimeBase _base;
    uint16_t _bits;
    pthread_mutex_t _lock;
    CFRunLoopRef _runLoop;
    CFMutableSetRef _rlModes;
    CFAbsoluteTime _nextFireDate;
    CFTimeInterval _interval;		/* immutable */
    CFTimeInterval _tolerance;          /* mutable */
    uint64_t _fireTSR;			/* TSR units */
    CFIndex _order;			/* immutable */
    CFRunLoopTimerCallBack _callout;	/* immutable */
    CFRunLoopTimerContext _context;	/* immutable, except invalidation */
};

struct __CFRunLoopMode {
    CFStringRef _name;
    Boolean _stopped;
    char _padding[3];
    CFMutableSetRef _sources0;
    CFMutableSetRef _sources1;
    CFMutableArrayRef _observers;
    CFMutableArrayRef _timers;
    CFMutableDictionaryRef _portToV1SourceMap;
    CFRuntimeBase _base;
    pthread_mutex_t _lock;	/* must have the run loop locked before locking this */
    __CFPortSet _portSet;
    CFIndex _observerMask;
#if USE_DISPATCH_SOURCE_FOR_TIMERS
    dispatch_source_t _timerSource;
    dispatch_queue_t _queue;
    Boolean _timerFired; // set to true by the source when a timer has fired
    Boolean _dispatchTimerArmed;
#endif
#if USE_MK_TIMER_TOO
    mach_port_t _timerPort;
    Boolean _mkTimerArmed;
#endif
#if DEPLOYMENT_TARGET_WINDOWS
    DWORD _msgQMask;
    void (*_msgPump)(void);
#endif
    uint64_t _timerSoftDeadline; /* TSR */
    uint64_t _timerHardDeadline; /* TSR */
};
```

#### CFRunLoopModeRef
* `CFRunLoopModeRef`代表`RunLoop`的运行模式

* 一个`RunLoop`包含若干个`Mode`，每个`Mode`又包含若干个`Source0/Source1/Timer/Observer`

* `RunLoop`启动时只能选择其中一个`Mode`，作为`currentMode`

* 如果需要切换`Mode`，只能退出当前`Loop`，再重新选择一个`Mode`进入

* 不同组的`Source0/Source1/Timer/Observer`能分隔开来，互不影响

* 如果`Mode`里没有任何`Source0/Source1/Timer/Observer`，
`RunLoop`会立马退出
    * 不同的`mode`用来处理不同的事件，比如上班的`mode`做上班的事，下班的`mode`做下班的事
* 常见的2种`Mode`
    * `kCFRunLoopDefaultMode`
    `（NSDefaultRunLoopMode）`：App的默认Mode，通常主线程是在这个`Mode`下运行
    * `UITrackingRunLoopMode`：界面跟踪 `Mode`，用于 `ScrollView` 追踪触摸滑动，保证界面滑动时不受其他 `Mode` 影响

#### CFRunLoopObserverRef
`runloop`的不同状态
```cpp
/* Run Loop Observer Activities */
typedef CF_OPTIONS(CFOptionFlags, CFRunLoopActivity) {
    kCFRunLoopEntry = (1UL << 0),   //进入runloop
    kCFRunLoopBeforeTimers = (1UL << 1), //即将进入timer
    kCFRunLoopBeforeSources = (1UL << 2), //即将进入Sources
    kCFRunLoopBeforeWaiting = (1UL << 5), //即将进入等待
    kCFRunLoopAfterWaiting = (1UL << 6),  //等待结束
    kCFRunLoopExit = (1UL << 7),  //退出runloop
    kCFRunLoopAllActivities = 0x0FFFFFFFU 
};
```

添加`observer`来监听`Runloop`的状态
```objectivec
// observer状态回调
void runLoopObserverCallBack(CFRunLoopObserverRef observer, CFRunLoopActivity activity, void *info)
{
    // 打印当前的mode
    CFRunLoopMode mode = CFRunLoopCopyCurrentMode(CFRunLoopGetCurrent());
    NSLog(@"----mode: %@", mode);
    CFRelease(mode);
    
//    NSLog(@"runLoopObserverCallBack->%@, %@", observer, info);
    switch (activity) {
        case kCFRunLoopEntry:
            NSLog(@"kCFRunLoopEntry");
            break;
        case kCFRunLoopBeforeTimers:
            NSLog(@"kCFRunLoopBeforeTimers");
        break;
        case kCFRunLoopBeforeSources:
            NSLog(@"kCFRunLoopBeforeSources");
        break;
        case kCFRunLoopBeforeWaiting:
            NSLog(@"kCFRunLoopBeforeWaiting");
        break;
        case kCFRunLoopAfterWaiting:
            NSLog(@"kCFRunLoopAfterWaiting");
        break;
        case kCFRunLoopExit:
            NSLog(@"kCFRunLoopExit");
        break;
        case kCFRunLoopAllActivities:
            NSLog(@"kCFRunLoopAllActivities");
        break;
    }
}
{
// 创建观察者
    // 使用函数来响应事件
    CFRunLoopObserverRef observer
    = CFRunLoopObserverCreate(kCFAllocatorDefault,
                              /*CFAllocatorRef allocator*/
                               kCFRunLoopEntry |
                              kCFRunLoopBeforeTimers |
                              kCFRunLoopBeforeSources |
                              kCFRunLoopBeforeWaiting |
                              kCFRunLoopAfterWaiting |
                              kCFRunLoopExit |
                              kCFRunLoopAllActivities,
                              /*CFOptionFlags activities*/
                              true,
                              /*Boolean repeats*/
                              0,
                              /*CFIndex order*/
                              &runLoopObserverCallBack,
                              /*CFRunLoopObserverCallBack callout*/
                              nil
                              /*CFRunLoopObserverContext *context*/
                              );
                                                            
    
    // 使用 block 来响应事件
    CFRunLoopObserverRef observer1
    = CFRunLoopObserverCreateWithHandler(kCFAllocatorDefault,
                                         kCFRunLoopEntry |
                                         kCFRunLoopBeforeTimers |
                                         kCFRunLoopBeforeSources |
                                         kCFRunLoopBeforeWaiting |
                                         kCFRunLoopAfterWaiting |
                                         kCFRunLoopExit |
                                         kCFRunLoopAllActivities,
                                         true,
                                         0,
                                         ^(CFRunLoopObserverRef observer,
                                           CFRunLoopActivity activity) {
                                            
                                            // 监听mode切换
                                            switch (activity) {
                                                case kCFRunLoopEntry:
                                                {
                                                    CFRunLoopMode mode = CFRunLoopCopyCurrentMode(CFRunLoopGetCurrent());
                                                                                        
                                                    NSLog(@"----mode: %@", mode);
                                                    CFRelease(mode);
                                                    NSLog(@"kCFRunLoopEntry");
                                                }
                                                    break;
                                                case kCFRunLoopExit:
                                                {
                                                    CFRunLoopMode mode = CFRunLoopCopyCurrentMode(CFRunLoopGetCurrent());
                                                                                        
                                                    NSLog(@"----mode: %@", mode);
                                                    CFRelease(mode);
                                                    NSLog(@"kCFRunLoopExit");
                                                }
                                                break;
                                                case kCFRunLoopAllActivities:
                                                    NSLog(@"kCFRunLoopAllActivities");
                                                break;
                                                default:
                                                    break;
                                            }
        
                                        });
    
    // 添加runloop观察者
    CFRunLoopAddObserver(CFRunLoopGetMain(), observer1, kCFRunLoopCommonModes);
    
    CFRelease(observer);
    CFRelease(observer1);
}
```

### RunLoop 的运行逻辑
<div class="center">
<image src="/resource/runloop/runloopFlow.png" style="width: 600px;"/>
</div>
<div class="center">
<image src="/resource/runloop/runloopFlow2.png" style="width: 800px;"/>
</div>

#### Runloop源码跟读 
创建一个控制器，并在
```cpp
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    NSLog(@"");
}
```
中打一个断点，进入`lldb`调试模式，使用`bt`查看方法调用的栈
```cpp
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x000000010264236d MyRunloop`-[ViewController touchesBegan:withEvent:](self=0x00007fa496c04f40, _cmd="touchesBegan:withEvent:", touches=1 element, event=0x0000600002914280) at ViewController.m:154:5
    frame #1: 0x00007fff4787c885 UIKitCore`forwardTouchMethod + 340
    frame #2: 0x00007fff4787c720 UIKitCore`-[UIResponder touchesBegan:withEvent:] + 49
    frame #3: 0x00007fff4788b93c UIKitCore`-[UIWindow _sendTouchesForEvent:] + 1867
    frame #4: 0x00007fff4788d524 UIKitCore`-[UIWindow sendEvent:] + 4596
    frame #5: 0x00007fff47868427 UIKitCore`-[UIApplication sendEvent:] + 356
    frame #6: 0x00007fff478e987e UIKitCore`__dispatchPreprocessedEventFromEventQueue + 6847
    frame #7: 0x00007fff478ec344 UIKitCore`__handleEventQueueInternal + 5980
    frame #8: 0x00007fff23bb2221 CoreFoundation`__CFRUNLOOP_IS_CALLING_OUT_TO_A_SOURCE0_PERFORM_FUNCTION__ + 17
    frame #9: 0x00007fff23bb214c CoreFoundation`__CFRunLoopDoSource0 + 76
    frame #10: 0x00007fff23bb1924 CoreFoundation`__CFRunLoopDoSources0 + 180
    frame #11: 0x00007fff23bac62f CoreFoundation`__CFRunLoopRun + 1263
    frame #12: 0x00007fff23babe16 CoreFoundation`CFRunLoopRunSpecific + 438
    frame #13: 0x00007fff38438bb0 GraphicsServices`GSEventRunModal + 65
    frame #14: 0x00007fff4784fb48 UIKitCore`UIApplicationMain + 1621
    frame #15: 0x0000000102642704 MyRunloop`main(argc=1, argv=0x00007ffeed5bcd38) at main.m:18:12
    frame #16: 0x00007fff51a1dc25 libdyld.dylib`start + 1
    frame #17: 0x00007fff51a1dc25 libdyld.dylib`start + 1
```
可以看到进入`runloop`的第一个函数是`CFRunLoopRunSpecific`,下面查看源码
```cpp
//循环进入runloop，使用CFRunLoopStop只能停止当前runloop，然后又会重新进入
void CFRunLoopRun(void) {	/* DOES CALLOUT */
    int32_t result;
    do {
        result = CFRunLoopRunSpecific(CFRunLoopGetCurrent(), kCFRunLoopDefaultMode, 1.0e10, false);
        CHECK_FOR_FORK();
    } while (kCFRunLoopRunStopped != result && kCFRunLoopRunFinished != result);
}

SInt32 CFRunLoopRunInMode(CFStringRef modeName, CFTimeInterval seconds, Boolean returnAfterSourceHandled) {     /* DOES CALLOUT */
    CHECK_FOR_FORK();
    return CFRunLoopRunSpecific(CFRunLoopGetCurrent(), modeName, seconds, returnAfterSourceHandled);
}

// 让runloop进入指定的mode
SInt32 CFRunLoopRunSpecific(CFRunLoopRef rl, CFStringRef modeName, CFTimeInterval seconds, Boolean returnAfterSourceHandled) {     /* DOES CALLOUT */
    int32_t result = kCFRunLoopRunFinished;
    // 通知Observer: 进入runloop
	__CFRunLoopDoObservers(rl, currentMode, kCFRunLoopEntry);
    // 具体要做的事情
	result = __CFRunLoopRun(rl, currentMode, seconds, returnAfterSourceHandled, previousMode);
    // 通知observer: 退出runloop
    __CFRunLoopDoObservers(rl, currentMode, kCFRunLoopExit);
    return result;
}

// 下面的代码删掉了源码中比较复杂的逻辑，只保留关键的方法调用，方便理解runloop的运行流程
/* rl, rlm are locked on entrance and exit */
static int32_t __CFRunLoopRun(CFRunLoopRef rl, CFRunLoopModeRef rlm, CFTimeInterval seconds, Boolean stopAfterHandle, CFRunLoopModeRef previousMode) {

    int32_t retVal = 0;
    do {
        // 通知Observers: 即将处理Timers
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeTimers);
        // 通知Observers: 即将处理Source
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeSources);

        // 处理block
        __CFRunLoopDoBlocks(rl, rlm);

        // 处理source0
        if (__CFRunLoopDoSources0(rl, rlm, stopAfterHandle)) {
            // 处理block
            __CFRunLoopDoBlocks(rl, rlm);
        }

        Boolean poll = sourceHandledThisLoop || (0ULL == timeout_context->termTSR);

        // 判断有无Source1
        if (__CFRunLoopServiceMachPort(dispatchPort, &msg, sizeof(msg_buffer), &livePort, 0, &voucherState, NULL)) {
            // 如果有Source1， 就跳转到handle_msg
            goto handle_msg;
        }
        
        didDispatchPortLastTime = false;
        
        // 通知Observers: 即将休眠
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopBeforeWaiting);
        __CFRunLoopSetSleeping(rl);
        // do not do any user callouts after this point (after notifying of sleeping)

        // Must push the local-to-this-activation ports in on every loop
        // iteration, as this mode could be run re-entrantly and we don't
        // want these ports to get serviced.


        // 等待别的消息来唤醒当前线程
        __CFRunLoopServiceMachPort(waitSet, &msg, sizeof(msg_buffer), &livePort, poll ? 0 : TIMEOUT_INFINITY, &voucherState, &voucherCopy);
            
            
        // user callouts now OK again
        __CFRunLoopUnsetSleeping(rl);
        
        // 通知Observers: 休眠结束
        __CFRunLoopDoObservers(rl, rlm, kCFRunLoopAfterWaiting);

    handle_msg:;
        if (被timer唤醒) {
            // 处理timers
            __CFRunLoopDoTimers(rl, rlm, mach_absolute_time());
        }
        else if (被GCD唤醒) {
            // 处理gcd相关的事情
            __CFRUNLOOP_IS_SERVICING_THE_MAIN_DISPATCH_QUEUE__(msg);
        } else {
            // 处理Source1
            __CFRunLoopDoSource1(rl, rlm, rls, msg, msg->msgh_size, &reply) || sourceHandledThisLoop;  
        } 
        // 处理 Blocks
        __CFRunLoopDoBlocks(rl, rlm);
        // 设置返回值
        if (sourceHandledThisLoop && stopAfterHandle) {
            retVal = kCFRunLoopRunHandledSource;
            } else if (timeout_context->termTSR < mach_absolute_time()) {
                retVal = kCFRunLoopRunTimedOut;
        } else if (__CFRunLoopIsStopped(rl)) {
                __CFRunLoopUnsetStopped(rl);
            retVal = kCFRunLoopRunStopped;
        } else if (rlm->_stopped) {
            rlm->_stopped = false;
            retVal = kCFRunLoopRunStopped;
        } else if (__CFRunLoopModeIsEmpty(rl, rlm, previousMode)) {
            retVal = kCFRunLoopRunFinished;
        }
    } while (0 == retVal);
    return retVal;
}
```

**关于runloop的休眠**:调用了系统内核的函数，让当前线程彻底休眠，只会占用少量的资源。当有触发事件发生时才会被唤醒。

### Runloop 的应用
* 解决NSTimer在滑动时停止工作的问题

> 使用如下方法创建的timer会加入到当前runloop的default mode中

```objectivec
/// Creates and returns a new NSTimer object initialized with the
// specified block object and schedules it on the current run loop 
// in the default mode.
[NSTimer scheduledTimerWithTimeInterval:1 repeats:YES block:^(NSTimer * _Nonnull timer) {
        static int a = 0;
        CFRunLoopMode mode =  CFRunLoopCopyCurrentMode(CFRunLoopGetCurrent());
        NSLog(@"%@:%d", mode, a++);
        CFRelease(mode);
}];
```
> 当界面滚动会进入tracking mode，这个时候timer会暂停, 可以使用下面的方法，添加到通用模式`NSRunLoopCommonModes = UITrackingRunLoopMode | NSDefaultRunLoopMode`<br>
<span style="color:#a33">注意：</span>NSRunLoopCommonModes 还可能包含其他模式，可以手动添加 `CFRunLoopAddCommonMode(<CFRunLoopRef rl>, CFRunLoopMode mode)`

```objectivec
NSTimer *timer = [NSTimer timerWithTimeInterval:1 repeats:YES block:^(NSTimer * _Nonnull timer) {
            static int a = 0;
            CFRunLoopMode mode =  CFRunLoopCopyCurrentMode(CFRunLoopGetCurrent());
            NSLog(@"%@:%d", mode, a++);
            CFRelease(mode);
    }];
    
//NSRunLoopCommonModes = UITrackingRunLoopMode | NSDefaultRunLoopMode
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];
```

* 控制线程生命周期(线程保活)

> 新建一个线程

```objectivec
NSThread *thread = [[NSThread alloc] initWithTarget:self selector:@selector(test) object:nil];
[thread start];
```

> 线程执行完一个任务之后就会被回收，下次还需要处理任务时又需要重新创建一个新的线程，这样子比较消耗资源，所有在不需要并发的情况可以考虑让线程保活，使用同一个线程处理不同时间点需要处理的事务

```objectivec
self.stopRunloop = false;
__weak typeof(self) weakSelf = self;
// 如果不开启一个运行中的runloop，线程执行完一个事件时候就关闭
AYThread *thread = [[AYThread alloc] initWithBlock:^{
    NSLog(@"%s, %@", __func__, [NSThread currentThread]);
    
    // 线程保活，添加Port 或者 Timer，不然执行完这个函数线程就释放了.即使被强引用
    [[NSRunLoop currentRunLoop] addPort:[[NSPort alloc] init] forMode:NSDefaultRunLoopMode];
    
    //        static int count = 0;
    //        NSTimer *timer = [NSTimer timerWithTimeInterval:1 repeats:YES block:^(NSTimer * _Nonnull timer) {
    //            NSLog(@"%d", count++);
    //        }];
    //        [[NSRunLoop currentRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];
    
    
    // 查看官方注释, 使用这种方法只要有source, runloop永远不会结束
    // [[NSRunLoop currentRunLoop] run];
    
    
    // 重复启动runloop让线程保活
    while (weakSelf && !weakSelf.isStopRunloop)
    {
        // 处理完一个事件之后，这个runloop就结束了，
        // 会进入while循环再次开启runloop等待事件
        NSLog(@"runloop run");
        [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate distantFuture]];
    }
}];
    
[thread start];
self.thread = thread;
```
> 让方法在这个线程上执行

```objectivec
// waitUntilDone:NO 直接继续执行下面的代码
// waitUntilDone:YES 等Selector执行完成后再执行后面的代码
// 使用同一个线程，处理串行任务
[self performSelector:@selector(test) onThread:self.thread withObject:nil waitUntilDone:NO];
```

> 在必要的时候停止这个线程的runloop，这样线程才能被释放

```objectivec
- (void)dealloc
{
    [self removeThread];
    NSLog(@"%s", __func__);
}

- (void)stopRunloop
{   
    // 进入子线程中，停止当前runloop
    CFRunLoopStop(CFRunLoopGetCurrent());
}

- (void)removeThread
{
    NSLog(@"%s", __func__);
    if (self.thread != nil)
    {
        self.stopRunloop = true;
        [self performSelector:@selector(stopRunloop) onThread:self.thread withObject:nil waitUntilDone:YES];
        self.thread = nil;
    }
}
```
[线程保活的demo](https://github.com/AprilYoungs/MJ_course/tree/master/ReviewPrepare/09-RunLoop/AYPermanetThread)

reference: [apple core foundation source](https://opensource.apple.com/tarballs/CF/)