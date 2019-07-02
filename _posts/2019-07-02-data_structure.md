---
layout: post
title:  "数据结构"
date:   2019-07-02
categories: notes
---

## 时间复杂度
定义：在进行算法分析时，语句总的执行次数T(n)是关于问题规模n的函数，进而分析T(n)随n的变化情况并确定T(n)的数量级。算法的时间复杂度，也就是算法的时间量度，记作：T(n)= O(f(n))。它表示随问题规模n的增大，算法执行时间的增长率和f(n)的增长率相同，称作算法的渐近时间复杂度，简称为时间复杂度。其中f(n)是问题规模n的某个函数。

用大写O()来体现算法时间复杂度的记法，我们称之为大O记法。

**一个程序内部执行（循环）的次数**

![](/resource/data_structrue/4807654-b85dde77b61f8a33.jpg.png)
<div style="text-align:center;">O(1), O(n), O(n*n)对应的曲线</div>
![](/resource/data_structrue/4807654-9d3b7f58b405a618.jpg.png)

## 空间复杂度
定义：算法的空间复杂度通过计算算法所需的存储空间实现，算法的空间复杂度的计算公式记作：S(n)=O(f(n))，其中，n为问题的规模，f(n)为语句关于n所占存储空间的函数。

_很多时候，可以用空间换时间，通过存储常量来减少运算量_

## 数组 & 链表
数组：在内存中分配一块连续的空间
![](/resource/data_structrue/array.png)
添加和删除都需要移动关联的一系列数据
![](/resource/data_structrue/array2.png)
### 时间复杂度
* access: O(1)
* insert: O(n)
* delete: O(n)

链表：链表中元素不需要存在同一个地方，通过Next指到下一个元素，相对比较灵活
![](/resource/data_structrue/linked.png)
![](/resource/data_structrue/linked2.png)
插入和移除元素，只需要改两个元素的next指针即可

### 时间复杂度
* space     O(n)
* prepend   O(1)
* append    O(1)
* lookup    O(n)
* insert    O(1)
* delete    O(1)

## Stack & Queue
### Stack
后进先出
![](/resource/data_structrue/stack.png)
### Queue
先进先出
![](/resource/data_structrue/queue.png)
### 常用数据结构的 复杂度
![](/resource/data_structrue/complexity.png)
![](/resource/data_structrue/sorting_complexity.png)