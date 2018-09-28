---
layout: post
title:  神经网络基本概念
date:   2018-09-26
categories: concept
---

## 感知器 (perceptron)
即信号输入元, 单个的数据源, 比如人的眼睛,耳朵,鼻子,都是感知器<br>

## 离散型和连续型预测 (discrete & continuous)
激活函数 (activation function)
![](/resource/basic_concept/activate_function.png)


使用连续激活函数,预测的结果不是非对即错,而是一个概率,表示预测结果的可靠,及确定性
![](/resource/basic_concept/activate_function2.png)

## SoftMax
多类别分类时使用 **SoftMax**

![](/resource/basic_concept/activate_function3.png)
#### 定义
``` python
def softmax(L):
    expL = np.exp(L)
    return expL/expL.sum()
```

分类问题的预测结果使用**softmax**作为激活函数,转化之后的结果加总的和为 100%,每个值代表一个预测结果的可能性

## One-hot Encoding
![](/resource/basic_concept/one-hot.png)
多类别分类时,分类目标数据一般表示为``[2,4,56,7,8,...]``,需要转换成类似
``[[0,1,0,0,0,0,0],
[0,0,0,1,0,0,0],
[0,0,1,0,0,0,0],
[0,0,0,0,1,0,0],
...]``
这样的数据,计算机才能高效的处理.

## 最大似然率(maximum likelihood)
![](/resource/basic_concept/maximum_likelihood.png)
所有预测结果(概率)的乘积, 用来衡量预测的结果的好坏,随着数据量变大,乘积无限接近0,不是一个好的衡量方式,所以不用.

## 交叉墒(cross entropy)
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

## 梯度下降(Gradient Descent)
![](/resource/basic_concept/gradient_descent.png)
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

### 梯度下降算法
![](/resource/basic_concept/gradient_descent2.png)
对每个数据点进行预测,并更新权重,到error足够小

## 神经网络架构
对现实世界的复杂问题,一般不能用二分法进行分类预测,根据实际问题数据集分布情况,采用不同层级的网络结构才能得到比较好的预测结果.
![](/resource/basic_concept/neuro_network_architect.png)
![](/resource/basic_concept/neuro_network_architect2.png)
![](/resource/basic_concept/neuro_network_architect3.png)
![](/resource/basic_concept/neuro_network_architect4.png)
![](/resource/basic_concept/neuro_network_architect5.png)
![](/resource/basic_concept/neuro_network_architect6.png)

### 多类别分类
![](/resource/basic_concept/neuro_network_architect7.png)
输出层使用 softmax作为激活函数,预测不同类别的概率

## 前向反馈 (feedforward)
前向反馈是神经网络用来将输入变成输出的流程.
![](/resource/basic_concept/feed_forward.png)
神经网络的误差函数
![](/resource/basic_concept/nn_error_fuction.png)

## 反向传播 (backpropagation function)
#### 神经网络模型训练过程
* 进行前向反馈运算.
* 将模型的输出与期望的输出进行比较.
* 计算误差.
* 向后运行前向反馈运算(反向传播),将误差分散到每个权重上.
* 更新权重,并获得更好的模型.
* 继续此流程,直到获得好的模型.
![](/resource/basic_concept/back_propagation.png)

### 链式法则(Chain Rule)
![](/resource/basic_concept/chain_rule.png)
![](/resource/basic_concept/chain_rule2.png)
![](/resource/basic_concept/chain_rule3.png)
梯度传递的计算方式

## 实现梯度下降
画了一个拥有两个输入的神经网络误差示例，相应的，它有两个权重。你可以将其看成一个地形图，同一条线代表相同的误差，较深的线对应较大的误差。
每一步，你计算误差和梯度，然后用它们来决定如何改变权重。重复这个过程直到你最终找到接近误差函数最小值的权重，即中间的黑点。
![](/resource/basic_concept/gradient_descent3.png)
#### 注意事项
因为权重会走向梯度带它去的位置，它们有可能停留在误差小，但不是最小的地方。这个点被称作局部最低点。如果权重初始值有错，梯度下降可能会使得权重陷入局部最优，例如下图所示。
![](/resource/basic_concept/local_minimal.png)
