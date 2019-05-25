---
layout: post
title:  "特征工程"
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
