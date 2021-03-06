---
layout: post
title:  "人脸识别-face recognise"
date:   2018-12-22
categories: papers
---

## [MTCNN(Multi-task Cascaded Convolutional Networks)](/readed_papers/MTCNN-2016.pdf)
![](/resource/mtcnn/MTCNN_pipeline.png)
多任务人脸识别网络,它的CNN网络分为三部分.首先,使用一个浅层CNN生成候选框;然后是一个稍微复杂点的CNN,用来甄别候选框中哪些没有人脸;最后用一个更加复杂的CNN网络来进一步优化输出,并输出人脸关键点.
这个网络的主要特点:(1)把人脸检测和人脸对齐结合起来,使用比较轻量的CNN结构,可以做到实时检测.(2)使用 *同步挖掘难检测样本(online hard example mining)* 的方法来提升网络的精度.

### 网络结构
![](/resource/mtcnn/mtcnn_architecture.png)
如上图所示,输入一张图片,首先按不同比例对它进行缩放,得到一个图片金字塔,用来输入到如下的网络.
1. Proposal Network(P-Net):一个全卷积网络用来输出包含人脸的候选框,输出的候选框会使用非极大抑制(non-maximum suppression)的方式删除高度重叠的框.
2. Refine Network(R-Net):上一阶段所有的候选框会喂到另一个CNN网络,用来进一步删除错误的候选框,同样也会使用NMS合并候选框.
3. Output Network(O-Net):这个阶段跟上个阶段有点类似,进一步优化上一阶段的输出,不过这个阶段还会输出人脸的五个关键点.

与其他多分类任务相比,人脸检测需要更少,但差异度更大的滤镜.

### 训练过程
#### Loss函数
1. 人脸分类:这个任务是分辨图片中是否有人脸,所以可以使用一个二元的交叉墒作为损失函数
  <br><img style="width:400px" src="/resource/mtcnn/loss_1.png"><br>
2. 框回归:对于每个候选框,我们计算它和最近的标记框的偏移量(左右上下,四个角)
  <br><img style="width:400px" src="/resource/mtcnn/loss_2.png"><br>
3. 关键点回归:预测的每个关键点和标记的关键点的偏移量
  <br><img style="width:400px" src="/resource/mtcnn/loss_3.png"><br>
4. 多任务训练:在每个阶段,对应的网络要完成不同的任务,所以每个阶段的训练输入图片也有所不同,比如包含人脸的,没有人脸的,还有半张人脸的.因此上面(1-3)中的损失函数可能会用不到.比如,如果图片中没有人脸,那么只计算分类的损失函数 *L<sub>i</sub><sup>det</sup>*,另外两个函数等于零.所以整体的损失函数如下:
<br><img style="width:400px" src="/resource/mtcnn/loss_4.png"><br>
*N* 代表所有训练样本量....

#### 同步挖掘难检测样本(Online Hard sample mining)
在每个mini-batch中,计算所有的loss,然后排序,使用前70%的样本来做梯度计算,忽略简单的样本.有针对性的训练模型 .实验表明,使用这种方式训练的网络,比没有要强一些.
