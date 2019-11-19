---
layout: post
title:  "Runtime"
date:   2019-11-18
categories: ios
---
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
类的 `class` 地址时没有变，但是 `isa` 值一直在变。 打开计算器
<div class="center">
<image src="/resource/runtime/isa2.png" style="width:400px"/>
</div>

查看对应位的值，可以观察到做相应的操作之后，对应位置的值确实变了, 这里使用的是模拟器，需要使用 `__x86_64__` 的对照表

<div class="center">
<image src="/resource/runtime/isa3.png" style="width:500px"/>
</div>
