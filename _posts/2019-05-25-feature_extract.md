---
layout: post
title:  "机器学习的杂谈"
date:   2019-05-25
categories: notes
---

#### python 包管理

python 版本
```shell
# 当前python 版本信息
python --version -V
# 查看电脑里边所有python
which -a python
```

conda 常用指令

``` shell
# 获取当前conda的信息
conda info
# 更新conda 版本
conda update conda
# 安装包
conda install/update scikit-learn
# 创建环境,开启/关闭环境
conda create --name/-n py35 python=3.5 activate/deactivate py35/base
# 遍历环境
conda env list
# 遍历当前环境的包
conda list/search
# 输出环境 到 文件
conda list -e > requirements.txt
# 从文本读取 安装 包 (--yes, 全部直接确认)
conda install --yes --file requirements.txt
```

pip 常用指令

```shell
pip install scikit-learn
pip uninstall scikit-learn
pip --version/-V
pip list
pip install scikit-learn-1.0-py2.py3-none-any.whl
pip show --files scikit-learn
pip install --upgrade/-U scikit-learn
# 指定python 的 pip
python -m pip install scikit-learn
python -m pip install --upgrade pip
```

* conda 和 pip 混合使用时, ** 先conda 后 pip **
* 尽量不要用 sudo pip, 权限高, 容易覆盖其他环境的包

#### 关于激活函数
没有激活函数的神经网络, 不管多少层网络, 其实和一层网络没有区别, 矩阵相乘是可以合并的.

### 特征工程
> 数据和特征决定了机器学习的上限, 而模型和算法只是逼近整个上限而已

> 其本质是一项工程活动, 目的是最大限度的从原始数据中提取特征以供算法和模型使用

* 如何使用? 可用性评估
* 如何获取? 获取和存储
* 如何处理? 清洗, 标准化, 特征选择, 特征扩展
* 如何更新?

不论什么数据, 处理的目的都是转化成列向量
![](/resource/feature_extraction/features.png)

基本特征, 统计特征, 复杂特征 -》 结构化特征
自然特征 -》 非结构化特征

#### scikit-learning 数据预处理函数
![](/resource/feature_extraction/sk_feature.png)


#### 降维与PCA
降维的目的:
1. 缓解维度灾难
2. 压缩数据时信息损失最小化
3. 高维数据可视化

#### 参数搜索
sklearn 中使用GridSearchCV, 遍历多种参数组合, 通过交叉寻找最优效果的参数.
![](/resource/feature_extraction/grid_search.png)
