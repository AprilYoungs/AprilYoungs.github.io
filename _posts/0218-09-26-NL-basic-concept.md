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

### 误差函数(Error function, criterion)
![](/resource/basic_concept/error_function.png)
交叉墒误差函数,👈左边为二元分类问题的误差函数,👉右边为多元分类问题的误差函数,
其他误差函数还有均方差(MSE),L1,kl,详见[here](https://pytorch.org/docs/stable/nn.html#id50)

### 梯度下降(Gradient Descent)
![](/resource/basic_concept/dradient_descent.png)
搭建好网络结构之后,会随机初始化权重weight,一开始的结果可能会比较差,误差函数比较大,通过对误差函数进行求导,并按一定比率 α (学习率 learning rate)对权重进行更新,最终,会得到比较好的模型.

### 梯度下降数学推导
以sigmoid激活函数为例<br>
sigmoid 型函数的导数
![](/resource/basic_concept/calculus_1.png)
![](/resource/basic_concept/calculus_2.png)
![](/resource/basic_concept/calculus_3.png)
![](/resource/basic_concept/calculus_4.png)
![](/resource/basic_concept/calculus_5.png)
![](/resource/basic_concept/calculus_6.png)
梯度实际上是标量乘以点的坐标！什么是标量？也就是标签和预测直接的差别。这意味着，如果标签与预测接近（表示点分类正确），该梯度将很小，如果标签与预测差别很大（表示点分类错误），那么此梯度将很大。请记下：小的梯度表示我们将稍微修改下坐标，大的梯度表示我们将大幅度修改坐标。
