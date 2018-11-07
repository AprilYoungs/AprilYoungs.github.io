---
layout: post
title:  "RNN循环神经网络"
date:   2018-11-07
categories: concept
---

在循环神经网络(RNN)中,前一个网络状态会影响输出,所以它可以处理依赖“时间线”的问题. 上一个网络层输出作为下一个网络的输入,如此循环.
![](/resource/rnn/recurrent.jpg)
换句话说,RNN是一个输入为 输入向量 和 前一个状态 的函数.

#### 应用场景
* 机器翻译 (中文->英文)
* 语音转文字
* 市场预测
* 给图片加标注(与CNN结合)

如下是循环神经网络在不同场景使用时的输入、输出情况.红色的方块是输入,蓝色的是输出,绿色的是中间隐藏层(RNN单元).
![](/resource/rnn/Recurrent_Forward.jpeg)
* 一对一: 正常的向前反馈网络,比如:输入图片, 输出标签
* 一对多(RNN):(图片描述)输入图片,输出对应图片文字描述
* 多对一(RNN):(情感分析)输入一个段落的文字,输出 情感(积极/消极)
* 多对多(RNN):(翻译)输入英文语段,输出翻译的葡萄牙语段.
* 多对多(RNN):(视频分类)输入视频,输出视频描述.

### RNN网络结构
- - -
如下,我们描述如何给RNN添加“深度”,还有在 时间线 上如何展开(unroll)RNN.可以观察到RNN的输出喂给更深一层的RNN,而它的 隐藏状态 喂给新的RNN.
![](/resource/rnn/RNN_Stacking.png)

#### 描述图片
- - -
如果你把卷积神经网络(CNN)和循环神经网络(RNN)链接起来. RNN就可以描述它所见的图片
![](/resource/rnn/CNN_RNN.png)
一般,我们会使用一个预训练(pre-trained)的CNN(比如:VGG,RES)并把它第二个全链接层连接到RNN,然后你就可以开始训练这个模型了.
![](/resource/rnn/CNN_RNN_2.png)

### RNN网络单元结构
RNN有多种单元结构,最原始的RNN结构<br>
<img style="width:300px" src='/resource/rnn/vanilla_rnn.png'>
<br>还有LSTM,目前用得比较多的RNN单元结构
![](/resource/rnn/lstm.png)
详见下一篇介绍

reference:
[Recurrent Neural Networks](https://leonardoaraujosantos.gitbooks.io/artificial-inteligence/content/recurrent_neural_networks.html)
