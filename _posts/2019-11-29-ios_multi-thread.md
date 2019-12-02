---
layout: post
title:  "多线程"
date:   2019-11-29
categories: ios
---

### iOS 中常见多线程方案
<div class="center">
<image src="/resource/Threads/threads_type.png" style="width: 700px;"/>
</div>


### GCD
#### GCD中有2个用来执行任务的函数
    * 用同步的方式执行任务
    dispatch_sync(dispatch_queue_t queue, dispatch_block_t block);
    queue：队列
    block：任务
    * 用异步的方式执行任务
    dispatch_async(dispatch_queue_t queue, dispatch_block_t block);

[GCD源码](https://github.com/apple/swift-corelibs-libdispatch)

#### GCD的队列
* 并发队列（Concurrent Dispatch Queue）
> 可以让多个任务并发（同时）执行（自动开启多个线程同时执行任务）
并发功能只有在异步（dispatch_async）函数下才有效

* 串行队列（Serial Dispatch Queue）
> 让任务一个接着一个地执行（一个任务执行完毕后，再执行下一个任务）

队列不等同于线程，队列用来存储待执行的任务，串行只能一个一个按顺序取，并行可以抓取

#### 容易混淆的术语
有4个术语比较容易混淆：同步、异步、并发、串行

* 同步和异步主要影响：能不能开启新的线程
    * 同步：在当前线程中执行任务，不具备开启新线程的能力
    * 异步：在新的线程中执行任务，具备开启新线程的能力

* 并发和串行主要影响：任务的执行方式
    * 并发：多个任务并发（同时）执行
    * 串行：一个任务执行完毕后，再执行下一个任务

#### 各种队列的执行效果
<div class="center">
<image src="/resource/Threads/thread_relation.png" style="width: 600px;"/>
</div>

#### 队列组的使用
可以通过gcd的队列组实现以下功能
* 异步并发执行任务1、任务2
* 等任务1、任务2都执行完毕后，再回到主线程执行任务3

```objectivec
// 不使用队列组的实现，比较凌乱
dispatch_async(dispatch_get_global_queue(0, 0), ^{
    dispatch_sync(dispatch_get_global_queue(0, 0), ^{
        dispatch_async(dispatch_get_global_queue(0, 0), ^{
            for (int i=0; i < 10; i++)
            {
                NSLog(@"Misson: 1, %@", [NSThread currentThread]);
            }
        });
        
        dispatch_async(dispatch_get_global_queue(0, 0), ^{
            for (int i=0; i < 10; i++)
            {
                NSLog(@"Misson: 2, %@", [NSThread currentThread]);
            }
        });
    });
    
    dispatch_async(dispatch_get_main_queue(), ^{
        for (int i=0; i < 10; i++)
        {
            NSLog(@"Misson: 3, %@", [NSThread currentThread]);
        }
     });
});

// 使用队列组
dispatch_group_t group = dispatch_group_create();
dispatch_queue_t queue = dispatch_queue_create(0,DISPATCH_QUEUE_CONCURRENT);

// 异步并发执行加到group中的block代码
dispatch_group_async(group, queue, ^{
    for (int i=0; i < 10; i++)
    {
        NSLog(@"Misson: 1, %@", [NSThread currentThread]);
    }
});

dispatch_group_async(group, queue, ^{
    for (int i=0; i < 10; i++)
    {
        NSLog(@"Misson: 2, %@", [NSThread currentThread]);
    }
});


// 等group中的所有任务执行完之后通知执行下面的代码，也是async的
dispatch_group_notify(group, dispatch_get_main_queue(), ^{
    for (int i=0; i < 10; i++)
    {
        NSLog(@"Misson: 3, %@", [NSThread currentThread]);
    }
});
```

### 多线程的安全隐患
* 资源共享
    * 1块资源可能被多个线程共享，也就是多个线程可能会访问同一块资源
    * 比如多个线程访问同一个对象，同一个变量，同一个文件
* 当多个线程访问同一块资源时，很容易引发数据错乱和数据安全问题

#### 案例
* 多线程安全隐患示例1 – 存钱取钱
<div class="center">
<image src="/resource/Threads/threadsafe1.png" style="width: 600px;"/>
</div>

* 多线程安全隐患示例2 - 卖票
<div class="center">
<image src="/resource/Threads/threadsafe2.png" style="width: 600px;"/>
</div>

#### 多线程安全隐患分析
<div class="center">
<image src="/resource/Threads/threadsafe3.png" style="width: 600px;"/>
</div>

#### 解决方案
使用线程同步技术（同步，就是协同步调，按预定的先后次序进行）
常见的线程同步技术是： 加锁

<div class="center">
<image src="/resource/Threads/threadsafe4.png" style="width: 600px;"/>
</div>

### iOS中的线程同步方案
* OSSpinLock
* os_unfair_lock
* pthread_mutex
* dispatch_semaphore
* dispatch_queue(DISPATCH_QUEUE_SERIAL)
* NSLock
* NSRecursiveLock
* NSCondition
* NSConditionLock
* @synchronized

#### OSSpinLock
* `OSSpinLock`叫做”自旋锁”，等待锁的线程会处于忙等（busy-wait）状态，一直占用着CPU资源
* 目前已经不再安全，可能会出现优先级反转问题
* 如果等待锁的线程优先级较高，它会一直占用着CPU资源，优先级低的线程就无法释放锁
> 比如说现在有 `thread 1`优先级较高，`thread 2`优先级较低，但是`thread 2`先访问某个变量并加锁了，这个时候再切换到`thread 1`，它也需要访问这个变量，但是这个变量已经加锁了，`thread 1`就会进入 忙等状态，而`thread 1`的优先级比较高，所以需要等到`thread 1`的任务执行完之后才会切换到`thread 2`，但是`thread 2`不解锁`thread 1`就无法进行下去，所以会卡死
* 需要导入头文件`#import <libkern/OSAtomic.h>`
```cpp
// 初始化
static OSSpinLock lock = OS_SPINLOCK_INIT;
// 尝试加锁（如果不需要等待，就加锁并返回true，需要等待就不加锁并返回false）
// 可以避免线程卡死，如果需要等待就不执行操作
BOOL result = OSSpinLockTry(&lock);
// 加锁
OSSpinLockLock(&lock);
// 解锁
OSSpinLockUnlock(&lock);
```
不过 `OSSpinLock`在**iOS 10** 已经开始弃用了, 推荐使用`os_unfair_lock`

#### os_unfair_lock
* os_unfair_lock用于取代不安全的OSSpinLock ，从iOS10开始才支持
* 从底层调用看，等待os_unfair_lock锁的线程会处于休眠状态，并非忙等
* 需要导入头文件`#import <os/lock.h>`
```cpp
// 初始化
static os_unfair_lock lock = OS_UNFAIR_LOCK_INIT;
// 尝试加锁
BOOL result = os_unfair_lock_trylock(&lock);
// 加锁
os_unfair_lock_lock(&lock);
// 解锁
os_unfair_lock_unlock(&lock);
```

#### pthread_mutex
* mutex叫做”互斥锁”，等待锁的线程会处于休眠状态
* 需要导入头文件#import <pthread.h>
```cpp
    // 初始化锁的属性
    pthread_mutexattr_t attr;
    pthread_mutexattr_init(&attr);
    /*
     #define PTHREAD_MUTEX_NORMAL        0
     #define PTHREAD_MUTEX_ERRORCHECK    1
     #define PTHREAD_MUTEX_RECURSIVE        2
     #define PTHREAD_MUTEX_DEFAULT        PTHREAD_MUTEX_NORMAL
     */
    pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_NORMAL);
    
    // 初始化锁
    pthread_mutex_t mutex;
    pthread_mutex_init(&mutex, &attr);
    
    // 销毁相关资源
    pthread_mutexattr_destroy(&attr);
    pthread_mutex_destroy(&mutex);
```
普通的锁如果对同一段代码重复加锁，会陷入锁死状态，比如下面这样
```cpp
- (void)otherTest1
{
    pthread_mutex_lock(&_mutex);
    NSLog(@"%s", __func__);
    static int count = 0;
    if (count < 10)
    {
        count++;
        [self otherTest1];
    }
    pthread_mutex_unlock(&_mutex);
}
```
**递归锁**: 同一个线程中可以重复加锁的锁，设置以下mutex的属性即可
```cpp
// 初始化锁的属性
pthread_mutexattr_t attr;
pthread_mutexattr_init(&attr);
// 递归锁
pthread_mutexattr_settype(&attr, PTHREAD_MUTEX_RECURSIVE);
// 初始化锁
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, &attr);
```

**条件锁**：某件事发生需要满足一个条件之后才能继续执行，可以使用条件锁
> 比如卖东西和生产东西，当东西售罄之后，需要等待生产好商品才能继续销售商品。
```cpp
// 初始化条件， NULL代表默认属性
pthread_cond_init(&_cond, NULL);
// 解锁，并进入条件等待，等收到信号并且可以重新加锁才会继续执行
pthread_cond_wait(&_cond, &_mutex);
// 激活一个等待该条件的线程
pthread_cond_signal(&_cond);
// 激活所有等待该条件的线程
pthread_cond_broadcast(&_cond);
// 销毁资源
pthread_cond_destroy(&_cond);
```

#### 自旋锁 & 互斥锁
**自旋锁**是高级锁，一旦发现已经被锁了就会进入`while`循环，占有cpu资源，直到可以重新上锁
**互斥锁**是低级锁，一旦发现已经被锁了就会进入睡眠状态，等待可以重新上锁再唤醒
`OSSpinLock`是**自旋锁**，`os_unfair_lock，pthread_mutex`是**互斥锁**

可以在即将加锁的代码中打断点，查看加锁不成功的汇编来验证
**OSSpinLock**
<div class="center">
<image src="/resource/Threads/osspinlock1.png" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/Threads/osspinlock2.png" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/Threads/osspinlock3.png" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/Threads/osspinlock4.png" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/Threads/osspinlock5.png" style="width: 500px;"/>
</div>
上面的代码进入while循环

**os_unfair_lock**
<div class="center">
<image src="/resource/Threads/unfairlock1.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock2.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock3.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock4.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock5.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock6.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock7.png" style="width: 500px;"/>
</div>
<div class="center">
<image src="/resource/Threads/unfairlock8.png" style="width: 500px;"/>
</div>

最后调用`callsys`进入睡眠等待状态。
`pthread_mutex`也是类似的情况

#### NSLock、NSRecursiveLock
`NSLock`是对`mutex`普通锁的封装
`NSRecursiveLock`是对`mutex`递归锁的封装，API跟`NSLock`基本一致
```objectivec
@protocol NSLocking
- (void)lock;
- (void)unlock;
@end

@interface NSLock : NSObject <NSLocking> {
- (BOOL)tryLock;
- (BOOL)lockBeforeDate:(NSDate *)limit;

@interface NSRecursiveLock : NSObject <NSLocking> {
- (BOOL)tryLock;
- (BOOL)lockBeforeDate:(NSDate *)limit;
```
#### NSCondition
`NSCondition`是对`mutex`和`cond`的封装
```objectivec
@interface NSCondition : NSObject <NSLocking> {
- (void)wait;
- (BOOL)waitUntilDate:(NSDate *)limit;
- (void)signal;
- (void)broadcast;
```

#### NSConditionLock
`NSConditionLock`是对`NSCondition`的进一步封装，可以设置具体的条件值
```objectivec
@interface NSConditionLock : NSObject <NSLocking> {
- (instancetype)initWithCondition:(NSInteger)condition;
@property (readonly) NSInteger condition;
- (void)lockWhenCondition:(NSInteger)condition;
- (BOOL)tryLock;
- (BOOL)tryLockWhenCondition:(NSInteger)condition;
- (void)unlockWithCondition:(NSInteger)condition;
- (BOOL)lockBeforeDate:(NSDate *)limit;
- (BOOL)lockWhenCondition:(NSInteger)condition beforeDate:(NSDate *)limit;
```
比如下面这样
```objectivec
- (void)otherTest1
{
    [[[NSThread alloc] initWithTarget:self selector:@selector(__three) object:nil] start];
    
    [[[NSThread alloc] initWithTarget:self selector:@selector(__two) object:nil] start];
    
    [[[NSThread alloc] initWithTarget:self selector:@selector(__one) object:nil] start];
}

- (void)__one
{
    [self.conditionLock lockWhenCondition:1];
    sleep(1);
    NSLog(@"%s", __func__);
    [self.conditionLock unlockWithCondition:2];
}

- (void)__two
{
    [self.conditionLock lockWhenCondition:2];
    sleep(1);
    NSLog(@"%s", __func__);
    [self.conditionLock unlockWithCondition:3];
}

- (void)__three
{
    [self.conditionLock lockWhenCondition:3];
    sleep(1);
    NSLog(@"%s", __func__);
    [self.conditionLock unlockWithCondition:4];
}
```
可以设置线程依赖，不管按什么顺序调用，方法会按照`__one,__two,__three`的顺序执行。

#### dispatch_queue
直接使用GCD的串行队列，也是可以实现线程同步的
```objectivec
// 创建串行队列
dispatch_queue_t queue = dispatch_queue_create("theQueue", DISPATCH_QUEUE_SERIAL);
// 把要保证线程安全的任务丢到队列中去执行
dispatch_sync(queue, ^{
    // 任务
});
```

#### dispatch_semaphore
**semaphore**叫做”信号量”
信号量的初始值，可以用来控制线程并发访问的最大数量
信号量的初始值为1，代表同时只允许1条线程访问资源，保证线程同步
```objectivec
// 设置信号量的初始值，用来控制最大并发量，这里最大并发量是5
dispatch_semaphore_t semaphore = dispatch_semaphore_create(5);
// 设置为1, 保证没有只有一个线程可以访问
dispatch_semaphore_t singleSemaphore = dispatch_semaphore_create(1);
// 如果信号量的值<=0, 当前线程就会进入休眠等待(直到信号量的值>0)
// 如果信号量的值>0,就减1，然后往下执行后面的代码
dispatch_semaphore_wait(singleSemaphore, DISPATCH_TIME_FOREVER);
需要保证线程同步的代码 ...
// 让信号量的值加1
dispatch_semaphore_signal(singleSemaphore);
```

#### @synchronized
`@synchronized`是对`os_unfair_recursive_lock`递归锁的封装(旧的版本是对`mutex`递归锁的封装）
源码查看：objc4中的`objc-sync.mm`文件
`@synchronized(obj)`内部会生成obj对应的递归锁，然后进行加锁、解锁操作

在调用`@synchronized`处打断点
<div class="center">
<image src="/resource/Threads/synchronized0.png" style="width: 400px;"/>
</div>

查看汇编代码，可以看到在同步开始处调用了`objc_sync_enter`,在结束处调用了 `objc_sync_exit`
<div class="center">
<image src="/resource/Threads/synchronized.png" style="width: 900px;"/>
</div>

查看[objc4](https://opensource.apple.com/tarballs/objc4/)源码
```objectivec
// Begin synchronizing on 'obj'. 
// Allocates recursive mutex associated with 'obj' if needed.
// Returns OBJC_SYNC_SUCCESS once lock is acquired.  
int objc_sync_enter(id obj)
{
    int result = OBJC_SYNC_SUCCESS;

    if (obj) {
        SyncData* data = id2data(obj, ACQUIRE);
        assert(data);
        data->mutex.lock();
    } else {
        // @synchronized(nil) does nothing
        if (DebugNilSync) {
            _objc_inform("NIL SYNC DEBUG: @synchronized(nil); set a breakpoint on objc_sync_nil to debug");
        }
        objc_sync_nil();
    }

    return result;
}

// End synchronizing on 'obj'. 
// Returns OBJC_SYNC_SUCCESS or OBJC_SYNC_NOT_OWNING_THREAD_ERROR
int objc_sync_exit(id obj)
{
    int result = OBJC_SYNC_SUCCESS;
    
    if (obj) {
        SyncData* data = id2data(obj, RELEASE); 
        if (!data) {
            result = OBJC_SYNC_NOT_OWNING_THREAD_ERROR;
        } else {
            bool okay = data->mutex.tryUnlock();
            if (!okay) {
                result = OBJC_SYNC_NOT_OWNING_THREAD_ERROR;
            }
        }
    } else {
        // @synchronized(nil) does nothing
    }
	

    return result;
}

typedef struct alignas(CacheLineSize) SyncData {
    struct SyncData* nextData;
    DisguisedPtr<objc_object> object;
    int32_t threadCount;  // number of THREADS using this block
    recursive_mutex_t mutex;
} SyncData;

using recursive_mutex_t = recursive_mutex_tt<LOCKDEBUG>;

template <bool Debug>
class recursive_mutex_tt : nocopy_t {
    os_unfair_recursive_lock mLock;

  public:
    constexpr recursive_mutex_tt() : mLock(OS_UNFAIR_RECURSIVE_LOCK_INIT) {
        lockdebug_remember_recursive_mutex(this);
    }

    constexpr recursive_mutex_tt(const fork_unsafe_lock_t unsafe)
        : mLock(OS_UNFAIR_RECURSIVE_LOCK_INIT)
    { }

    void lock()
    {
        lockdebug_recursive_mutex_lock(this);
        os_unfair_recursive_lock_lock(&mLock);
    }

    void unlock()
    {
        lockdebug_recursive_mutex_unlock(this);

        os_unfair_recursive_lock_unlock(&mLock);
    }

    void forceReset()
    {
        lockdebug_recursive_mutex_unlock(this);

        bzero(&mLock, sizeof(mLock));
        mLock = os_unfair_recursive_lock OS_UNFAIR_RECURSIVE_LOCK_INIT;
    }

    bool tryUnlock()
    {
        if (os_unfair_recursive_lock_tryunlock4objc(&mLock)) {
            lockdebug_recursive_mutex_unlock(this);
            return true;
        }
        return false;
    }

    void assertLocked() {
        lockdebug_recursive_mutex_assert_locked(this);
    }

    void assertUnlocked() {
        lockdebug_recursive_mutex_assert_unlocked(this);
    }
};
```
一进入`objc_sync_enter`根据传进去的obj地址生成一个锁，并把它存在一个哈希表中，再用这个锁进行加锁
解锁的时候`objc_sync_exit`根据原来传进的obj地址查找对应的锁，并移除哈希表中的键值对，再用这个锁来解锁

#### Atomic
```cpp
id objc_getProperty(id self, SEL _cmd, ptrdiff_t offset, BOOL atomic) {
    if (offset == 0) {
        return object_getClass(self);
    }

    // Retain release world
    id *slot = (id*) ((char*)self + offset);
    if (!atomic) return *slot;
        
    // Atomic retain release world
    spinlock_t& slotlock = PropertyLocks[slot];
    slotlock.lock();
    id value = objc_retain(*slot);
    slotlock.unlock();
    
    // for performance, we (safely) issue the autorelease OUTSIDE of the spinlock.
    return objc_autoreleaseReturnValue(value);
}


static inline void reallySetProperty(id self, SEL _cmd, id newValue, ptrdiff_t offset, bool atomic, bool copy, bool mutableCopy) __attribute__((always_inline));

static inline void reallySetProperty(id self, SEL _cmd, id newValue, ptrdiff_t offset, bool atomic, bool copy, bool mutableCopy)
{
    if (offset == 0) {
        object_setClass(self, newValue);
        return;
    }

    id oldValue;
    id *slot = (id*) ((char*)self + offset);

    if (copy) {
        newValue = [newValue copyWithZone:nil];
    } else if (mutableCopy) {
        newValue = [newValue mutableCopyWithZone:nil];
    } else {
        if (*slot == newValue) return;
        newValue = objc_retain(newValue);
    }

    if (!atomic) {
        oldValue = *slot;
        *slot = newValue;
    } else {
        spinlock_t& slotlock = PropertyLocks[slot];
        slotlock.lock();
        oldValue = *slot;
        *slot = newValue;        
        slotlock.unlock();
    }

    objc_release(oldValue);
}
```


## GNUstep
GNUstep是GNU计划的项目之一，它将Cocoa的OC库重新开源实现了一遍

源码地址：http://www.gnustep.org/resources/downloads.php

<div class="center">
<image src="/resource/Threads/GNUstep.png" style="width: 600px;"/>
</div>

虽然GNUstep不是苹果官方源码，但还是具有一定的参考价值
