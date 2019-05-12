---
layout: post
title:  "决策树与随机森林"
date:   2019-05-12
categories: notes
---
## 决策树与随机森林

### 前置概念
1. Entropy(墒): 热力学中表征无知状态的参量之一, 其物理意义是体系混乱程度的度量.
2. Information Entropy(信息墒):信息墒是用来消除随机不确定性的东西，度量样本集合纯度的指标

# 加公式 和 图


### 树模型 & 线性模型
1. 线性模型
> 对每个特征进行加权求和<br>
 score = f(W<sub>x1</sub></sub>X1 + W<sub>x2</sub>X2 + W<sub>x3</sub>X3 + ...)

2. 树模型
> 根据每个特征值, 对样本进行分类<br>

# 加图

### 决策树 --> Xgboost
> 可以用决策树对数据进行分类, 可以用 **信息纯度** 来衡量分类效果好坏.

1.  ID3: 信息增益
2.  C4.5: 信息增益率
3.  CART: 基尼系数
> Classification & regression tree

假如有一个属性会把数据分类为10组, 而另外一个属性可以把数据分类为2组, 而且两种分类方式下的组内数据都是同样的标签.那么用基尼系数, 或者信息增益都无法比较上面两个属性的好坏, 只有信息增益率可以区分类为2类的效果好一些.

#### 过拟合
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

read:  RF out of bag data
bootstrap


GBDT
AdaBoost?
XGboost?
