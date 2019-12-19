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
定义一个`AYProxy`，让它继承`NSProxy`,内部使用弱引用的`target`，并实现消息转发的方法，这样可以使用它来作为`timer`的`target`，使用的时候，调用如下方法
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

代码验证
```objectivec
int b1;
float b2;

int a1 = 0;
float a2 = 120;

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        
        NSString *str1 = @"1123";
        NSString *str2 = @"afgfffdfffffffff";
        
        int c1 = 23;
        int c2 = 234;
        
        NSObject *object1 = [[NSObject alloc] init];
        NSObject *object2 = [[NSObject alloc] init];
        
        NSLog(@"字符串常量");
        NSLog(@"str1->%p", str1);
        NSLog(@"str2->%p", str2);
        
        NSLog(@"已初始化全局数据");
        NSLog(@"a1->%p", &a1);
        NSLog(@"a2->%p", &a2);
        
        NSLog(@"未初始化全局数据");
        NSLog(@"b1->%p", &b1);
        NSLog(@"b2->%p", &b2);
        
        
        NSLog(@"堆");
        NSLog(@"object1->%p", object1);
        NSLog(@"object2->%p", object2);
        
        NSLog(@"栈");
        NSLog(@"c1->%p", &c1);
        NSLog(@"c2->%p", &c2);
        
        
        
    }
    return 0;
}
/**
字符串常量
str1->0x100001018
str2->0x100001038
已初始化全局数据
a1->0x100002044
a2->0x100002040
未初始化全局数据
b1->0x100002048
b2->0x10000204c
堆
object1->0x1006020a0
object2->0x100602ed0
栈
c1->0x7ffeefbff49c
c2->0x7ffeefbff498
 */
```

### Tagged Pointer

从64bit开始，iOS引入了`Tagged Pointer`技术，用于优化`NSNumber`、`NSDate`、`NSString`等小对象的存储

在没有使用`Tagged Pointer`之前， `NSNumber`等对象需要动态分配内存、维护引用计数等，`NSNumber`指针存储的是堆中`NSNumber`对象的地址值

使用`Tagged Pointer`之后，`NSNumber`指针里面存储的数据变成了：Tag + Data，也就是将数据直接存储在了指针中

当指针不够存储数据时，才会使用动态分配内存的方式来存储数据

```objectivec
NSNumber *num1 = @10;
NSNumber *num2 = @11;
NSNumber *num3 = @12;
NSNumber *num4 = @184523374875933234;
NSLog(@"num1-(%@)->%p", [num1 class], num1);
NSLog(@"num2-(%@)->%p", [num2 class], num2);
NSLog(@"num3-(%@)->%p", [num3 class], num3);
NSLog(@"num4-(%@)->%p", [num4 class], num4);
/**
 num1, num2, num3 是tagged Pointer
 num4, 是正常的对象
num1-(__NSCFNumber)->0x5236f0387428a1e5
num2-(__NSCFNumber)->0x5236f0387428a0e5
num3-(__NSCFNumber)->0x5236f0387428a7e5
num4-(__NSCFNumber)->0x10186c570
*/

NSString *str1 = @"123asdfghjkl";
NSString *str2 = [NSString stringWithFormat:@"abc"];
NSString *str3 = [NSStrinstringWithFormat:@"abcasdfghjkllfgzcv"];

NSLog(@"str1->(%@)->%p", [str1 class], str1);
NSLog(@"str2->(%@)->%p", [str2 class], str2);
NSLog(@"str3->(%@)->%p", [str3 class], str3);

/**
 不同方式创建的NSString
str1->(__NSCFConstantString)->0x1000020d8

// NSString 的 tagged pointer 类型
str2->(NSTaggedPointerString)->0x1d9a38f64f7be7d9

str3->(__NSCFString)->0x1020004a0
 */
```

`objc_msgSend`能识别`Tagged Pointer`，比如`NSNumber`的`intValue`方法，直接从指针提取数据，节省了以前的调用开销

如何判断一个指针是否为Tagged Pointer？
* iOS平台，最高有效位是1（第64bit）
* Mac平台，最低有效位是1


### OC对象的内存管理
* 在iOS中，使用引用计数来管理OC对象的内存

* 一个新创建的OC对象引用计数默认是1，当引用计数减为0，OC对象就会销毁，释放其占用的内存空间

* 调用retain会让OC对象的引用计数+1，调用release会让OC对象的引用计数-1

* 内存管理的经验总结
    * 当调用alloc、new、copy、mutableCopy方法返回了一个对象，在不需要这个对象时，要调用release或者autorelease来释放它
    * 想拥有某个对象，就让它的引用计数+1；不想再拥有某个对象，就让它的引用计数-1

* 对象的引用计数会存在`NSObject`的`isa`指针中，
<div class="center">
<image src="/resource/runtime/isaunion.png" style="width: 400px;"/>
</div>
每个位都代表不同的意思，有一个位来表示是否有弱指针，还有19位用来存引用计数，不够存的时候会存附表

#### OC 对象的释放过程（delloc）
查看[objc4 源码](https://opensource.apple.com/tarballs/objc4/)
* NSObject.mm 

```objectivec
// Replaced by NSZombies
- (void)dealloc {
    _objc_rootDealloc(self);
}

void
_objc_rootDealloc(id obj)
{
    assert(obj);

    obj->rootDealloc();
}

inline void
objc_object::rootDealloc()
{
    // 如果是TaggedPointer，没有引用，直接返回
    if (isTaggedPointer()) return;  // fixme necessary?

    if (fastpath(isa.nonpointer  &&  
                 !isa.weakly_referenced  &&  
                 !isa.has_assoc  &&  
                 !isa.has_cxx_dtor  &&  
                 !isa.has_sidetable_rc))
    {
        assert(!sidetable_present());
        free(this);
    } 
    else {
        object_dispose((id)this);
    }
}

/***********************************************************************
* object_dispose
* fixme
* Locking: none
**********************************************************************/
id 
object_dispose(id obj)
{
    if (!obj) return nil;
    
    objc_destructInstance(obj);    
    free(obj);

    return nil;
}
```
关键逻辑在这一段
```objectivec
/***********************************************************************
* objc_destructInstance
* Destroys an instance without freeing memory. 
* Calls C++ destructors.
* Calls ARC ivar cleanup.
* Removes associative references.
* Returns `obj`. Does nothing if `obj` is nil.
**********************************************************************/
void *objc_destructInstance(id obj) 
{
    if (obj) {
        // Read all of the flags at once for performance.
        bool cxx = obj->hasCxxDtor();
        bool assoc = obj->hasAssociatedObjects();

        // This order is important.
        // 调用 C++ 析构函数
        if (cxx) object_cxxDestruct(obj);
        // 移除关联对象
        if (assoc) _object_remove_assocations(obj);
        // 移除ivar，还有弱引用
        obj->clearDeallocating();
    }

    return obj;
}

inline void 
objc_object::clearDeallocating()
{
    if (slowpath(!isa.nonpointer)) {
        // Slow path for raw pointer isa.
        sidetable_clearDeallocating();
    }
    else if (slowpath(isa.weakly_referenced  ||  isa.has_sidetable_rc)) {
        // Slow path for non-pointer isa with weak refs and/or side table data.
        clearDeallocating_slow();
    }

    assert(!sidetable_present());
}


// 清除附表，并开始清理弱引用
void 
objc_object::sidetable_clearDeallocating()
{
    SideTable& table = SideTables()[this];

    // clear any weak table items
    // clear extra retain count and deallocating bit
    // (fixme warn or abort if extra retain count == 0 ?)
    table.lock();
    RefcountMap::iterator it = table.refcnts.find(this);
    if (it != table.refcnts.end()) {
        if (it->second & SIDE_TABLE_WEAKLY_REFERENCED) {
            weak_clear_no_lock(&table.weak_table, (id)this);
        }
        table.refcnts.erase(it);
    }
    table.unlock();
}

/** 
 * Called by dealloc; nils out all weak pointers that point to the 
 * provided object so that they can no longer be used.
 * 
 * @param weak_table 
 * @param referent The object being deallocated. 
 */
void 
weak_clear_no_lock(weak_table_t *weak_table, id referent_id) 
// 把所有weak引用置为nil
```

#### copy的使用
<div class="center">
<image src="/resource/memoryManager/copy.png" style="width: 600px;"/>
</div>

自定义类使用`copy`属性需要注意一下，比如
```objectivec
@interface AYPerson : NSObject<NSCopying>
@property(nonatomic, copy) NSMutableString *name;
@property(nonatomic, copy) NSMutableArray *list;
@end
```
这种定义方式会导致`name`和`list`的实际类型为`NSString`,`NSArray`,因为它们的set方法会这样实现
```objectivec
-(void)setName:(NSMutableString *)name
{
    if (_name != name)
    {
        [_name release];
        _name = [name copy];
    }
}
- (void)setList:(NSMutableArray *)list
{
    if (_list != list)
    {
        [_list release];
        _list = [list copy];
    }
}
```
所以可变数据类型应该用strong修饰，正确的姿势是这样的
```objectivec
@interface AYPerson : NSObject<NSCopying>
@property(nonatomic, strong) NSMutableString *name;
@property(nonatomic, strong) NSMutableArray *list;
@end
```

`NSString, NSArray, NSDictionary`不希望得到的数据被意外修改的时候，建议用`copy`修饰，可以保证数据是独享的
比如`UILabel`的`text`就是这样声明的
<div class="center">
<image src="/resource/memoryManager/copy2.png" style="width: 600px;"/>
</div>

### autorelease原理
```objectivec
 @autoreleasepool {
    NSObject *obj = [[[NSObject alloc] init] autorelease];
}
```
在自动释放池里边的对象，只要调用了`autorelease`在超出作用域的时候都会自动释放。

`@autoreleasepool`到底做了什么？
有两种方式可以窥探
* 创建一个`cmdline`项目, 并在中间打一个断点
<div class="center">
<image src="/resource/memoryManager/autoreleasepool1.png" style="width: 500px;"/>
</div>

查看汇编代码
<div class="center">
<image src="/resource/memoryManager/autoreleasepool2.png" style="width: 500px;"/>
</div>

可以看到打印 `@"hello world"`的前后分别调用了 `objc_autoreleasePoolPush` 和 `objc_autoreleasePoolPop`
<div class="center">
<image src="/resource/memoryManager/autoreleasepool3.png" style="width: 500px;"/>
</div>

* 第二种方法, 把OC代码编译成 cpp 代码
在`terminal` 中运行如下命令，把上面的代码编译出一个`main.cpp`文件<br>
`$ xcrun -sdk iphoneos clang -arch arm64 -rewrite-objc main.m`

截取关键代码如下
```cpp
struct __AtAutoreleasePool {
  __AtAutoreleasePool() {atautoreleasepoolobj = objc_autoreleasePoolPush();}
  ~__AtAutoreleasePool() {objc_autoreleasePoolPop(atautoreleasepoolobj);}
  void * atautoreleasepoolobj;
};

int main(int argc, const char * argv[]) {
    /* @autoreleasepool */ { __AtAutoreleasePool __autoreleasepool; 

        NSLog((NSString *)&__NSConstantStringImpl__var_folders_h7_s2yhr_2526d_0tv661_8qbdr0000gn_T_main_1940b1_mi_0);
    }
    return 0;
}
```
在声明`@autoreleasepool`处实际上定义了一个 `__AtAutoreleasePool`结构体，创建的时候会调用cpp结构体的构建函数，内部调用了`objc_autoreleasePoolPush`并返回一个指针`void * atautoreleasepoolobj`，在即将出作用域的时候，这个结构体会调用析构函数
```cpp
 ~__AtAutoreleasePool() {objc_autoreleasePoolPop(atautoreleasepoolobj);}
```
内部调用了`objc_autoreleasePoolPop(atautoreleasepoolobj)`,跟前面查看汇编看到的结果是一样的。

---

接下来查看[objc4 源码](https://opensource.apple.com/tarballs/objc4/)`NSObject.mm`，研究一下这两个函数都干了什么。

```cpp
void *
objc_autoreleasePoolPush(void)
{
    return AutoreleasePoolPage::push();
}

void
objc_autoreleasePoolPop(void *ctxt)
{
    AutoreleasePoolPage::pop(ctxt);
}

class AutoreleasePoolPage 
{
    magic_t const magic;
    id *next;
    pthread_t const thread;
    AutoreleasePoolPage * const parent;
    AutoreleasePoolPage *child;
    uint32_t const depth;
    uint32_t hiwat;
}
```
源码过于复杂在这里就不粘贴太多了，有兴趣的可以去读源码，下面说一下结论

* 每个AutoreleasePoolPage对象占用4096字节内存，除了用来存放它内部的成员变量，剩下的空间用来存放autorelease对象的地址
* 所有的AutoreleasePoolPage对象通过双向链表的形式连接在一起

<div class="center">
<image src="/resource/memoryManager/autoreleasepool4.png" style="width: 800px;"/>
</div>

* 调用`push`方法会将一个`POOL_BOUNDARY`入栈，并且返回其存放的内存地址

* 调用`pop`方法时传入一个`POOL_BOUNDARY`的内存地址，会从最后一个入栈的对象开始发送`release`消息，直到遇到这个`POOL_BOUNDARY`

* `id *next`指向了下一个能存放`autorelease`对象地址的区域  

另外补充一个tip:
```cpp
// 导出 私有方法，打印 autoreleasePool 状态
extern void
_objc_autoreleasePoolPrint(void);
```
> 可以打印出当前自动释放池中有多少待释放的对象，使用这个方式的时候需要把编译模式改成MRC,并把调用autorelease方法
```cpp
NSObject *obj = [[[NSObject alloc] init] autorelease];
```

#### Runloop中的Autorelease

iOS在主线程的`Runloop`中注册了2个Observer
* 第1个Observer监听了`kCFRunLoopEntry`事件，会调用`objc_autoreleasePoolPush()`
* 第2个Observer
    * 监听了`kCFRunLoopBeforeWaiting`事件，会调用`objc_autoreleasePoolPop()`、
    `objc_autoreleasePoolPush()`
    * 监听了`kCFRunLoopBeforeExit`事件，会调用`objc_autoreleasePoolPop()`

打印 [NSRunLoop mainRunLoop], 可以找到这样这两个observer
```cpp
 typedef CF_OPTIONS(CFOptionFlags, CFRunLoopActivity) {
     kCFRunLoopEntry = (1UL << 0), 1
     kCFRunLoopBeforeTimers = (1UL << 1), 2
     kCFRunLoopBeforeSources = (1UL << 2), 4
     kCFRunLoopBeforeWaiting = (1UL << 5), 32
     kCFRunLoopAfterWaiting = (1UL << 6),  64
     kCFRunLoopExit = (1UL << 7), 128
     kCFRunLoopAllActivities = 0x0FFFFFFFU
 };

 
 activities = 0x1 -> kCFRunLoopEntry
 "<CFRunLoopObserver 0x600003134500 [0x7fff80615350]>{valid = Yes, activities = 0x1, repeats = Yes, order = -2147483647, callout = _wrapRunLoopWithAutoreleasePoolHandler (0x7fff47848c8c), context = <CFArray 0x600000e26190 [0x7fff80615350]>{type = mutable-small, count = 1, values = (\n\t0 : <0x7fd973802048>\n)}}",
 
 activities = 0xa0 -> kCFRunLoopBeforeWaiting | kCFRunLoopExit
 "<CFRunLoopObserver 0x6000031345a0 [0x7fff80615350]>{valid = Yes, activities = 0xa0, repeats = Yes, order = 2147483647, callout = _wrapRunLoopWithAutoreleasePoolHandler (0x7fff47848c8c), context = <CFArray 0x600000e26190 [0x7fff80615350]>{type = mutable-small, count = 1, values = (\n\t0 : <0x7fd973802048>\n)}}"
```

所以iOS中的OC对象，如果放到了自动释放池，会在每个runloop开始休眠之前，或者runloop退出的时候释放。
