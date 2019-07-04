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

## Stack & Queue - 栈&队列
### Stack
后进先出
![](/resource/data_structrue/stack.png)
### Queue
先进先出
![](/resource/data_structrue/queue.png)
### 常用数据结构的 复杂度
![](/resource/data_structrue/complexity.png)
![](/resource/data_structrue/sorting_complexity.png)

### 使用例子
```cpp
/**
 Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

Open brackets must be closed by the same type of brackets.
Open brackets must be closed in the correct order.
Note that an empty string is also considered valid.
 */

#include <iostream>
#include <string>
#include <stack>
#include <vector>
#include <map>
using namespace std;

class Solution {
public:
    bool isValid(string s) {

        // 1. iterate all elements
        // 2. find all "(" "{" "[", and record
        // 3. get the other parts ")", "]", "}", remove the left one, else return false
        // 4. till the end, if nonthing left, return true, else return false
        stack<char> cached;
        map<char, char> parenthesis;
        parenthesis.insert(pair<char, char>('(', ')'));
        parenthesis.insert(pair<char, char>('{', '}'));
        parenthesis.insert(pair<char, char>('[', ']'));

        for(string::iterator it=s.begin(); it!=s.end(); it++){

            if (parenthesis.count(*it))
            {
                cached.push(*it);
            } else if (!cached.empty() && parenthesis[cached.top()] == *it)
            {
                cached.pop();

            } else{
                return false;
            }
        }

        return cached.empty();
    }
};

int main(){
    vector<string> testStrs{"()", "()[]{}", "(]", "([)]", "{[]}", "]", "", "("};
    for(int i=0; i < testStrs.size(); i++)
    {
        bool isValid = Solution().isValid(testStrs[i]);
        cout << isValid << " ";
    }
    return 0;
}
```

## PriorityQueue - 优先队列
正常进、按照优先级出
>  常用实现方式
1. [Heap](https://en.wikipedia.org/wiki/Heap_(data_structure))(Binary, Binomial, Fibonacci)
2. Binary Search Tree

![](/resource/data_structrue/max_heap.png)
![](/resource/data_structrue/min_heap.png)

![](/resource/data_structrue/heap_complexy.png)

### 使用例子
```
/**
 * Your KthLargest object will be instantiated and called as such:
 * KthLargest* obj = new KthLargest(k, nums);
 * int param_1 = obj->add(val);
 * Note:
 * You may assume that nums' length ≥ k-1 and k ≥ 1.
 */

/*
 * int k = 3;
 * int[] arr = [4,5,8,2];
 * KthLargest kthLargest = new KthLargest(3, arr);
 * kthLargest.add(3);   // returns 4
 * kthLargest.add(5);   // returns 5
 * kthLargest.add(10);  // returns 5
 * kthLargest.add(9);   // returns 8
 * kthLargest.add(4);   // returns 8
 * */
```
```cpp
// with min priority queue
class KthLargest {
    int _k;
    priority_queue<int, vector<int>, greater<int>> pq{};
public:
    KthLargest(int k, vector<int>& nums) {
        /**
         * create a qp with size k
         * 1. make the first pq
         * 2. run through the whole nums
         * */

        _k = k;
        for (int i=0; i<k; i++)
        {
            // note: k could greater than the nums' size
            if(i<nums.size())
            {
                pq.push(nums[i]);
            } else
            {
                break;
            }
        }

        //run through the whole nums
        for (int i=k; i<nums.size(); i++)
        {
            if(pq.top() < nums[i])
            {
                pq.pop();
                pq.push(nums[i]);
            }
        }

    }

    int add(int val) {
        /**
         * 1. if pq 's size is or k, make it k
         * 2. compare the val with the top of the pq, update if needed
         *
         */

        if(pq.empty() || pq.size() < _k)
        {
            pq.push(val);
        } else if (val > pq.top())
        {
            pq.pop();
            pq.push(val);
        }

        return pq.top();
    }
};

int main() {

    int k = 3;
    vector<int> arr{5, -1};
    KthLargest kthLargest(k, arr);

//    ["KthLargest","add","add","add","add","add"]
//    [[3,[5,-1]],[2],[1],[-1],[3],[4]]
    cout << kthLargest.add(2) << endl;   // returns 4
    cout << kthLargest.add(1) << endl;   // returns 5
    cout << kthLargest.add(-1) << endl;  // returns 5
    cout << kthLargest.add(3) << endl;   // returns 8
    cout << kthLargest.add(4) << endl;   // returns 8

    return 0;
}
```