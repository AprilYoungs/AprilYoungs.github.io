---
layout: post
title:  "SqueezeNet & MobileNet"
date:   2018-12-09
categories: papers
---
#### 写在前面:
这篇文章是我阅读SqueezeNet 和 MobileNet 之后的理解总结,写给健忘的自己.
要读这篇文章需要了解熟悉卷积网络,如果还不了解,可以先查看这篇文章[CNN卷积神经网络](https://aprilyoungs.github.io/blog/2018/10/23/CNN-concept)

### 介绍和起因
* **为了更高效的训练网络**, 现有的一些经典CNN网络,比如VGG, GoogleNet, ResNet,虽然在预测上精度很高,但是由于参数比较多,所以要把它们训练好还是很消耗资源和时间的.所以需要一个小的模型.
* **当把模型更新到终端的时候需要传输的数据变少**
* **方便把模型迁移到嵌入式芯片中**

## [SqueezeNet](/readed_papers/squeezeNet.pdf)(2016)
![](/resource/squeeze_mobile_net/squeeze_title.png)
标题很好的概括了SqueezeNet的特点,AlexNet级别的精度,参数却小了50倍,整个模型的大小不到0.5MB.

### 网络结构

#### 网络结构设计的三个策略
1. **把3x3的卷积核替换成1x1.** 在卷积滤镜数一样的情况下,使用1x1的卷积核和3x3的相比可以把需要的参数缩小9倍.
2. **减少输入到3x3卷积的输入通道数.** 一个卷积核是3x3的卷积层需要的参数为(_输入通道数_)x(滤镜数)x(3x3).所以为了减少参数.不仅可以参照策略1减少卷积核为3x3的卷积层,还可以通过减少输入到3x3卷积的 _输入通道数_.(现在看不懂没关系,后面会详细解释)
3. **延迟下取样,这样卷积网络会拥有更大的激活特征图.** 卷积网络输出特征图的大小由输入数据的大小(图片的 _长_ 和 _宽_),还有卷积的步长(stride)决定.如果 stride > 1,那么输出图约为输入图的大小除以stride(具体大小受padding的策略影响),数据每次变小都会损失一些信息.所以在卷积网络中,前段尽量设置stride=1,stride>1放在网络的靠后阶段,可以保留图片的更多特征,这样可以有效提高预测的精度.

前两个策略的目的在于减小网络大小,第三个策略的目的在于提高精度.

#### Fire Module <span style="color:#0aa"><-重点<span>
![](/resource/squeeze_mobile_net/fire_module.png)
这个结构是squeeze的关键结构.如上图所示,fire module由两部分组成,一个是squeeze(1x1)的卷积网络;还有一个expand,它由1x1和3x3卷积层拼接到一起构成.数据传进来先经过squeeze压缩,然后expand展开.这里设置squeeze的滤镜数小于expand层拼接后滤镜数.这就是前面提到的减少输入到3x3卷积层的 _输入通道数_ 的操作方式.Tensorflow的实现代码如下:
![](/resource/squeeze_mobile_net/fire_module_code.png)

#### 整体网络结构
![](/resource/squeeze_mobile_net/squeeze.png)
左边是一个朴素的SqueezeNet,中间是加了简单捷径的SqueezeNet,右边是加了复杂捷径的SqueezeNet.关于这个捷径的好处,可以参考resnet的[paper](https://arxiv.org/pdf/1512.03385.pdf).
如上图SqueezeNet的第一层是一个传统卷积层,后面跟着8个fire module,最后是一个1x1的卷积层,滤镜数为输出的分类数.

具体参数如下
![](/resource/squeeze_mobile_net/squeezenet_params.png)

### SqueezeNet的表现
采用不同压缩率时的准确率
![](/resource/squeeze_mobile_net/squeeze_acc.png)
不同网络结构的准确率
![](/resource/squeeze_mobile_net/squeeze_acc2.png)
补充一下, **Top-1 Accuracy** 是指网络输出中概率最高的那个刚好是目标标签.**Top-5 Accuracy** 是指网络输出中概率最高的前5个类别中有一个是目标标签.都是计算预测标签吻合预测标签数占输入数据量的比例.

## [MobileNet](/readed_papers/mobileNet.pdf)(2017)
### 网络结构
#### 深度分离卷积(depthwise separable convolution) <span style="color:#0aa"><-重点<span>
![](/resource/squeeze_mobile_net/depthwise_separable_conv.jpeg)
MobileNet是基于 **深度分离卷积** 搭建.深度分离卷积把标准的卷积过程分成两步来进行计算,先是一个基于深度的卷积,然后是叫做基于点的1x1的卷积.
如上图,深度卷积有跟输入图片深度一样的卷积核(绿色),每个卷积核对输入图(蓝色)中对应的channel进行扫描,然后输出跟输入图深度一样的输出特征图(紫色),这个时候跟正常的卷积计算不同,并没有做加法,把不同channel的输出特征图进行叠加;接下来是用1x1卷积核(黄色)的卷积层对输出特征图进行扫描,最终输出Output.
这种结构跟正常的卷积比既能减少运算量又能减少参数量.

* D<sub>K</sub> 代表卷积核大小
* D<sub>F</sub> 代表输出特征图的大小
* M 代表输入channel的数量
* N 代表输出卷积filter的数量

正常卷积需要的参数量为:<br>
D<sub>K</sub> x D<sub>K</sub> x M x N <br>
而深度分离卷积只需要:<br>
G = DxDxMx1 + 1x1xMxN = Mx(DxD+N)<br>
所以深度分离卷积需要的参数和正常卷积的比例为:DxDxN/(DxD+N)<br>
**N**>=1, **D**>=1, 故:深度分离卷积的参数 <= 正常卷积参数 <br>

计算量:<br>
正常卷积层的计算量为:<br>
D<sub>K</sub> x D<sub>K</sub> x M x N x D<sub>F</sub> x D<sub>F</sub> <br>
而深度分离卷积的计算量为:
<br><img style="width:400px" src="/resource/squeeze_mobile_net/depthwise_compute.png"><br>

所以正常卷积和深度分离卷积的计算量比例如下:
<br><img style="width:400px" src="/resource/squeeze_mobile_net/depthwise_compute2.png"><br>
MobileNet使用D<sub>K</sub>=3, 而N一般是比较大的数(32以上),所以深度分离卷积层的计算量比普通卷积层约是的8到9分之一,然而准确率只是减小一点点.

Tensorflow 实现代码如下:
```python
def __depthwise_conv2d_p(name, x, w=None, kernel_size=(3, 3), padding='SAME', stride=(1, 1),
                         initializer=tf.contrib.layers.xavier_initializer(), l2_strength=0.0, bias=0.0):
    with tf.variable_scope(name):
        stride = [1, stride[0], stride[1], 1]
        kernel_shape = [kernel_size[0], kernel_size[1], x.shape.as_list()[-1], 1]

        with tf.name_scope('layer_weights'):
            if w is None:
                w = __variable_with_weight_decay(kernel_shape, initializer, l2_strength)
            __variable_summaries(w)
        with tf.name_scope('layer_biases'):
            if isinstance(bias, float):
                bias = tf.get_variable('biases', [x.shape.as_list()[-1]], initializer=tf.constant_initializer(bias))
            __variable_summaries(bias)
        with tf.name_scope('layer_conv2d'):
            conv = tf.nn.depthwise_conv2d(x, w, stride, padding)
            out = tf.nn.bias_add(conv, bias)

    return out
```

#### 网络组成
所有网络层后面都跟着一个 BatchNorm 和一个 ReLU 非线性激活函数,除了最后的全链接层(它的数据会喂入softmax层来用于分类预测).BatchNorm加在深度分离卷积的位置见下图
![](/resource/squeeze_mobile_net/depthwise_conv_batchnorm.png)
下取样的(stride>1)的操作是在基于深度的卷积层.在数据喂入全链接层之前有一个全局平局池化层.加上基于深度的卷积和基于点的卷积,MobileNet总共有28层.
![](/resource/squeeze_mobile_net/mobileNet_architecture.png)

#### 深度因子: 给模型瘦身
虽然MobileNet已经够小了,不过在有些应用场景中仍然需要更小更快的模型.所以有了深度因子 α. 假设对一个深度分离网络使用深度因子 α,那么它的输入channel _M_ 变成 _αM_,它的输出 channel _N_ 变成 _αN_.
加了深度因子α之后整个网络的计算量变化如下
<br><img style="width:400px" src="/resource/squeeze_mobile_net/width_mul.png"><br>
0< α <=1, 使用深度因子之后整体的计算量和参数量大约小了 α<sup>2</sup>倍.
#### 分辨率因子: 缩小输入
通过把输入图片的大小缩小,也可以有效的减少计算量.所以这里定义了一个分辨率因子 _ρ_,把输入图的缩小 _ρ_ 倍之后,后面网络中每一层的计算量也会随之变小.再把前面说的深度因子 _α_ 考虑进来的话,深度分离卷积的计算量可以表示为:<br>
<img style="width:400px" src="/resource/squeeze_mobile_net/resolution_mul.png"><br>
0< _ρ_ <=1,所以引入分辨率因子 _ρ_ 之后,可以把计算量缩小
_ρ<sup>2</sup>_ 倍.

### MobileNet 的表现
![](/resource/squeeze_mobile_net/compare.png)
在模型大小相当的情况下,MobileNet精度比SqueezeNet高一些,而运算量却小了20几倍.其他Mobile的表现及比较请查看论文详情.
