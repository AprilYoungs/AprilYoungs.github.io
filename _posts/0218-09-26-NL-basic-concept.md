---
layout: post
title:  神经网络基本概念
date:   2018-09-26
categories: concept
---

### 感知器 (perceptron)
即信号输入元, 单个的数据源, 比如人的眼睛,耳朵,鼻子,都是感知器<br>

### 离散型和连续型预测 (discrete & continuous)
激活函数 (activation function)
![](/resource/basic_concept/activate_function.png)


使用连续激活函数,预测的结果不是非对即错,而是一个概率,表示预测结果的可靠,及确定性
![](/resource/basic_concept/activate_function2.png)

### SoftMax
多类别分类时使用 **SoftMax**

![](/resource/basic_concept/activate_function3.png)
#### 定义
``` python
def softmax(L):
    expL = np.exp(L)
    return expL/expL.sum()
```
分类问题的预测结果使用**softmax**作为激活函数,转化之后的结果加总的和为 100%,每个值代表一个预测结果的可能性

### One-hot Encoding
![](/resource/basic_concept/one-hot.png)
多类别分类时,分类目标数据一般表示为``[2,4,56,7,8,...]``,需要转换成类似
``[[0,1,0,0,0,0,0],
[0,0,0,1,0,0,0],
[0,0,1,0,0,0,0],
[0,0,0,0,1,0,0],
...]``
这样的数据,计算机才能高效的处理.

### 最大似然率(maximum likelihood)
![](/resource/basic_concept/maximum_likelihood.png)
所有预测结果(概率)的乘积, 用来衡量预测的结果的好坏,随着数据量变大,乘积无限接近0,不是一个好的衡量方式,所以不用.

### 交叉墒(cross entropy)
概率和误差函数之间有一定的联系,这种联系叫做交叉墒
![](/resource/basic_concept/cross_entropy.png)

把每个预测概率转化成 对数(-log)并相加,可以很方便的求均值,因此这个误差函数不管数据量的大与小,都有比较好的参考价值
![](/resource/basic_concept/cross_entropy2.png)

### 多类别交叉墒(Multi-Class Cross-Entropy)
![](/resource/basic_concept/cross_entropy3.png)
