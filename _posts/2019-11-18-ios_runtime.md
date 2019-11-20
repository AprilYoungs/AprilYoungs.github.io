---
layout: post
title:  "Runtime"
date:   2019-11-18
categories: ios
---
[验证代码demo](https://github.com/AprilYoungs/MJ_course/tree/master/ReviewPrepare/08-Runtime课件/MYRuntime)
### isa 

要想学习Runtime，首先要了解它底层的一些常用数据结构，比如isa指针

在arm64架构之前，isa就是一个普通的指针，存储着Class、Meta-Class对象的内存地址

从arm64架构开始，对isa进行了优化，变成了一个共用体`（union）`结构，还使用位域来存储更多的信息
<div class="center">
<image src="/resource/runtime/isaunion.png" style="width: 500px;"/>
</div>

上面用到了C语言中的位域
C语言中节省存储空间的一种策略，定义结构体中变量占用空间的大小。
<div class="center">
<image src="/resource/runtime/weiyu.png" style="width:800px"/>
</div>
[c 位域 (c bit field)](https://www.runoob.com/cprogramming/c-bit-fields.html)

* nonpointer
> 0，代表普通的指针，存储着Class、Meta-Class对象的内存地址
1，代表优化过，使用位域存储更多的信息

* has_assoc
> 是否有设置过关联对象，如果没有，释放时会更快

* has_cxx_dtor
> 是否有C++的析构函数（.cxx_destruct），如果没有，释放时会更快

* shiftcls
> 存储着Class、Meta-Class对象的内存地址信息

* magic
> 用于在调试时分辨对象是否未完成初始化

* weakly_referenced
> 是否有被弱引用指向过，如果没有，释放时会更快

* deallocating
> 对象是否正在释放

* extra_rc
> 里面存储的值是引用计数器减1

* has_sidetable_rc
> 引用计数器是否过大无法存储在isa中
如果为1，那么引用计数会存储在一个叫SideTable的类的属性中

下面用一个简单的demo来验证上面的字段
<div class="center">
<image src="/resource/runtime/isa.png" style="width:600px"/>
</div>

因为在XCode无法直接打印 `isa`, 可以通过在断点中添加指令 `p/x person->isa` 来打印类的 `isa`
```lldb
(Class) $0 = 0x001d800100002131 AYPerson
2019-11-19 11:15:58.240585+0800 KnowIsa[10886:626291] original 0x1007adcf0
(Class) $1 = 0x003d800100002131 AYPerson
2019-11-19 11:15:58.293954+0800 KnowIsa[10886:626291] weak reference 0x1007adcf0
(Class) $2 = 0x013d800100002131 AYPerson
2019-11-19 11:15:58.340914+0800 KnowIsa[10886:626291] add reference 0x1007adcf0
(Class) $3 = 0x013d800100002133 AYPerson
2019-11-19 11:15:58.387407+0800 KnowIsa[10886:626291] set associated 0x1007adcf0
```
类的 `class` 地址没有变，但是 `isa` 值一直在变。 打开计算器
<div class="center">
<image src="/resource/runtime/isa2.png" style="width:400px"/>
</div>

查看对应位的值，可以观察到进行相应的操作之后，对应位置的值确实变了, 这里使用的是模拟器，需要使用 `__x86_64__` 的对照表

<div class="center">
<image src="/resource/runtime/isa3.png" style="width:500px"/>
</div>

### Class 的结构
<div class="center">
<image src="/resource/runtime/class1.png" style="width:900px"/>
</div>
#### class_rw_t

`class_rw_t` 里面的`methods、properties、protocols`是二维数组，是可读可写的，包含了类的初始内容 和 分类的内容
<div class="center">
<image src="/resource/runtime/class2.png" style="width:800px"/>
</div>

#### class_ro_t

`class_ro_t`里面的`baseMethodList、baseProtocols、ivars、baseProperties`是一维数组，是只读的，包含了类的初始内容
<div class="center">
<image src="/resource/runtime/class3.png" style="width:600px"/>
</div>

#### method_t

```cpp
struct method_t {
    SEL name;  // 函数名
    const char *types;  // 编码（返回值类型，参数类型）
    IMP imp;    // 指向函数的指针（函数地址）
};
```
* `IMP` 代表函数的具体实现
`typedef id _Nullable (*IMP)(id _Nonnull, SEL _Nonnull, ...); `

* `SEL` 代表方法\函数名，一般叫做选择器，底层结构跟`char *`类似
> 可以通过`@selector()`和`sel_registerName()`获得
<br>可以通过`sel_getName()`和 `NSStringFromSelector()`转成字符串
<br>不同类中相同名字的方法，所对应的方法选择器是相同的

```cpp
/// An opaque type that represents a method selector.
typedef struct objc_selector *SEL;

// 获取SEL值的两种方法，同名的选择器都指向相同的地址
NSLog(@"%s, %p", sel_registerName("init"),sel_registerName("init"));
NSLog(@"%s, %p", @selector(init), @selector(init));

// 获取SEL 名
NSLog(@"%@", NSStringFromSelector(@selector(init)));
NSLog(@"%s", sel_getName(@selector(init)));
```

`types`包含了函数返回值、参数编码的字符串
<table>
    <tr>
        <th>返回值</th>
        <th>参数1</th>
        <th>参数2</th>
        <th> ... </th>
        <th>参数n</th>
    </tr>
</table>
iOS中提供了一个叫做`@encode`的指令，可以将具体的类型表示成字符串编码
<div class="center">
<image src="/resource/runtime/type1.png" style="width:400px"/>
</div>

<div class="center">
<image src="/resource/runtime/type2.png" style="width:600px"/>
</div>

```cpp
// types
// 可以使用 @encode来获取不同类型的 type
NSLog(@"%s, %s, %s, %s, %s", @encode(int), @encod(float), @encode(double), @encode(id), @encode(SEL));
// i, f, d, @, :
AYPerson *p = [[AYPerson alloc] init];
AYClass cP = (__bridge AYClass)[p class];
class_rw_t *data = cP->data();
const char *name = sel_getNam(data->ro->baseMethodList->first.name);
const char *types =data->ro->baseMethodList->first.types;
NSLog(@"name: %s,    types: %s", name,types);
// name: test2:andB:andString:,    types:v32@0:8i16f20@24
/** 具体的type对照表如下， 第一个v是返回值，32是所有参数占用间的大小，后面依次是
 @0 :8 i16 f20 @24, @0 代表id 从0 开始，:8 代表 SEL 从第8位开始 ...
 */
```

### 方法缓存

`Class`内部结构中有个方法缓存`（cache_t）`，用<span>散列表（哈希表）</span>来缓存曾经调用过的方法，可以提高方法的查找速度
<div class="center">
<image src="/resource/runtime/cache.png" style="width:800px"/>
</div>

类调用函数的时候会优先去 `cache` 中查看有没有对应方法，如果有就直接调用，没有就在类方法里边查找，找到了之后调用并添加缓存，后面再详细分析方法调用顺序，现在先研究方法缓存机制。
查看[objc4](https://opensource.apple.com/tarballs/objc4/)源码中的`objc-cache.mm`文件, 找到
`bucket_t * cache_t::find(SEL s, id receiver)`方法
```cpp
#if __arm__  ||  __x86_64__  ||  __i386__
// objc_msgSend has few registers available.
// Cache scan increments and wraps at special end-marking bucket.

static inline mask_t cache_next(mask_t i, mask_t mask) {
    return (i+1) & mask;
}
#elif __arm64__
// objc_msgSend has lots of registers available.
// Cache scan decrements. No end marker needed.
static inline mask_t cache_next(mask_t i, mask_t mask) {
    return i ? i-1 : mask;
}
#endif

// Class points to cache. SEL is key. Cache buckets store SEL+IMP.
// Caches are never built in the dyld shared cache.

static inline mask_t cache_hash(SEL sel, mask_t mask) 
{
    return (mask_t)(uintptr_t)sel & mask;
}

bucket_t * cache_t::find(SEL s, id receiver)
{
    assert(s != 0);

    bucket_t *b = buckets();
    mask_t m = mask();
    mask_t begin = cache_hash(s, m);
    mask_t i = begin;
    do {
        if (b[i].sel() == 0  ||  b[i].sel() == s) {
            return &b[i];
        }
    } while ((i = cache_next(i, m)) != begin);
    // 循环一次以后还没有找到，会抛异常
    // hack
    Class cls = (Class)((uintptr_t)this - offsetof(objc_class, cache));
    cache_t::bad_cache(receiver, (SEL)s, cls);
}
```

`cache_t` 中用 `bucket_t *`数组来存储缓存的方法对，每次进来一个新的方法使用`cache_hash`来获取它的`哈希值`, 然后把这个值当成下标，把对应的方法`method_t`存放到`bucket_t *`中。如果上面获取的`哈希值`已经出现过，会调用对应的`cache_next`方法生成一个新的下标，当`cache`满了之后，会调用扩容的方法`void cache_t::expand()`

```cpp
void cache_t::expand()
{
    cacheUpdateLock.assertLocked();
    
    uint32_t oldCapacity = capacity();
    uint32_t newCapacity = oldCapacity ? oldCapacity*2 : INIT_CACHE_SIZE;

    if ((uint32_t)(mask_t)newCapacity != newCapacity) {
        // mask overflow - can't grow further
        // fixme this wastes one bit of mask
        newCapacity = oldCapacity;
    }

    reallocate(oldCapacity, newCapacity);
}
void cache_t::reallocate(mask_t oldCapacity, mask_t newCapacity)
{
    bool freeOld = canBeFreed();

    bucket_t *oldBuckets = buckets();
    bucket_t *newBuckets = allocateBuckets(newCapacity);

    // Cache's old contents are not propagated. 
    // This is thought to save cache memory at the cost of extra cache fills.
    // fixme re-measure this

    assert(newCapacity > 0);
    assert((uintptr_t)(mask_t)(newCapacity-1) == newCapacity-1);

    setBucketsAndMask(newBuckets, newCapacity - 1);
    
    if (freeOld) {
        cache_collect_free(oldBuckets, oldCapacity);
        cache_collect(false);
    }
}
```
试例验证代码
```cpp
/// 方法缓存
        cache_t pCache = cP->cache;
        for (int i = 0; i < pCache._mask; i++)
        {
            
            NSLog(@"pCache._buckets[%d]->%s", i, pCache._buckets[i]._sel);
        }
        NSLog(@"-------------------");
        /**
         pCache._buckets[0]->(null)
         pCache._buckets[1]->(null)
         pCache._buckets[2]->init
         -------------------
        */
        [p test];
        for (int i = 0; i < pCache._mask; i++)
        {
            
            NSLog(@"pCache._buckets[%d]->%s", i, pCache._buckets[i]._sel);
        }
        NSLog(@"-------------------");
        /**
         pCache._buckets[0]->test
         pCache._buckets[1]->(null)
         pCache._buckets[2]->init
         -------------------
         */
        [p test2:1 andB:2 andString:@"s"];
        for (int i = 0; i < pCache._mask; i++)
        {
            NSLog(@"pCache._buckets[%d]->%s", i, pCache._buckets[i]._sel);
        }
        /**
         pCache._buckets[0]->test
         pCache._buckets[1]->(null)
         pCache._buckets[2]->init
         */
        
        // 查找缓存方法
        bucket_t *b = pCache.cacheFind(@selector(test));
        NSLog(@"查找缓存方法->%s", (char *)b->_sel);
        // 查找缓存方法->test
        
```

reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)