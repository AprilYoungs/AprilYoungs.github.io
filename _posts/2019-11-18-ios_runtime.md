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
<br>
<image src="/resource/runtime/isaunion.png" style="width:400px">
<br>
上面用到了C语言中的位域
C语言中节省存储空间的一种策略，定义结构体中变量占用空间的大小。
<image src="/resource/runtime/weiyu.png" style="width:400px">
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


