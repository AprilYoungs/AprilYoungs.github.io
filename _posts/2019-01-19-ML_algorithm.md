---
layout: post
title:  "决策树与随机森林"
date:   2019-05-12
categories: notes
---

#### 前置概念
1. Entropy(墒): 热力学中表征无知状态的参量之一, 其物理意义是体系混乱程度的度量.
2. Information Entropy(信息墒):信息墒是用来消除随机不确定性的东西，度量样本集合纯度的指标
![](/resource/dt_rf/information.png)
![](/resource/dt_rf/information_fig.png)

#### 树模型 & 线性模型
1. 线性模型
> 对每个特征进行加权求和<br>
 score = f(W<sub>x1</sub>X1 + W<sub>x2</sub>X2 + W<sub>x3</sub>X3 + ...)

2. 树模型
> 根据每个特征值, 对样本进行分类<br>
![](/resource/dt_rf/tree.png)

### 决策树

可以用决策树对数据进行分类, 可以用 **信息纯度** 来衡量分类效果好坏.

*
目标: 分类后 每个页节点的数据都是同一类别(纯度越高越好)

*
衡量分类效果好坏的指标:

1.  ID3: 信息增益
2.  C4.5: 信息增益率
3.  CART: 基尼系数

#### ID3: 信息增益
信息增益越大,分类效果越好
![](/resource/dt_rf/information_gain.png)
a 代表某一属性, D<sub>v</sub> 是属性a中一个类别的数量.比如属性a是西瓜的 **色泽**, 那D<sub>v</sub>可以是色泽为 **乌黑** 的西瓜的数量.
![](/resource/dt_rf/max_information_gain.png)
使用这个标准存在一个问题, 属性对目标数据的分类越细,越有优势. 举一个极端的例子, 如果用数据的编号对数据进行分类. 那么每一条数据都是一个类别, 是把每个类别都分出来了, 但是并没有实际意义

#### C4.5: 信息增益率
![](/resource/dt_rf/gain_ratio.png)
IV(a)是属性固有的值, 类别越多,IV(a)越大
比如一个属性只有两类 IV(a) = -1/2 * log2(1/2) * 2 = 1
<br>另一个属性有四个类别 IV(a) = -1/4 * log2(1/4) * 4 = 2

通过把信息增益除以对应属性的IV值对类比较多的属性给以一定的惩罚, 可以获得比较合理的纯度指标

但是增益率对类别少的属性有偏好, 不会直接选择增益高的属性<br>
那么能不能先选择增益高的属性, 然后再从增益高的属性里边选择增益率高的属性?

#### CART: 基尼系数
从样本中随意抽取两个样本, 它们为不同类别的概率.
![](/resource/dt_rf/gini.png)
基尼系数越小, 样本纯度越高<br>
针对属性a的基尼系数为:
![](/resource/dt_rf/gini_a.png)
![](/resource/dt_rf/gini_a_max.png)
每次选取属性来对数据进行分类时选择基尼系数最小的.

#### 缺失值的处理
![](/resource/dt_rf/missValue.png)
![](/resource/dt_rf/missValue2.png)
![](/resource/dt_rf/missValue3.png)
计算有缺失值的属性的信息增益时, 先忽略有缺失值的那部分数据, 按照没有缺失值的方式去计算,最后把计算结果乘以缺失的比例 p, 就得到有缺失值的属性的信息增益, 即缺失值越多, 这个属性被用来做分类依据的可能性越低.

#### 连续值的处理
![](/resource/dt_rf/continuous.png)
![](/resource/dt_rf/continuous2.png)
选择分区的时候, 可以使用二分法, 从中间开始分割数据, 每次根据结果,选择往左边二分,还是往右边二分.

#### 过拟合
![](/resource/dt_rf/overfitting.png)
* 预剪支
* 后剪支

#### Tips
* 减少特征数, 防止过拟合
* 减少深度, max_depth
* 设置合适的页节点数量, min_samples_split
* 训练前把数调整平衡, 防止数倾向与那些优势权重
*
...

### 随机森林

#### 集成学习(Ensemble learning)

## ** key words

read:  RF out of bag data
bootstrap

generation errors

GBDT
AdaBoost?
XGboost?
