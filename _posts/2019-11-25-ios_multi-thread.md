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