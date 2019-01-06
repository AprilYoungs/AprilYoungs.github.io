---
layout: post
title:  "CNN MODELS"
date:   2019-01-06
categories: papers
---

### Squeeze-and-Excitation Networks
在 res-net的基础上,引入了一个新结构 SE 层
![](/resource/SE_net/SE_block.png)
![](/resource/SE_net/SE_block2.png)

```python
def squeeze_excite_block(input, ratio=16):
    init = input
    channel_axis = 1 if K.image_data_format() == "channels_first" else -1  # compute channel axis
    filters = init._keras_shape[channel_axis]  # infer input number of filters
    se_shape = (1, 1, filters) if K.image_data_format() == 'channels_last' else (filters, 1, 1)  # determine Dense matrix shape

    se = GlobalAveragePooling2D()(init)
    se = Reshape(se_shape)(se)
    se = Dense(filters // ratio, activation='relu', kernel_initializer='he_normal', kernel_regularizer=regularizers.l2(weight_decay), use_bias=False)(se)
    se = Dense(filters, activation='sigmoid', kernel_initializer='he_normal', kernel_regularizer=regularizers.l2(weight_decay), use_bias=False)(se)
    x = multiply([init, se])
    return x
```    
也就是,把输入的网络先求逐层均值,然后再加两个全链接层,接上sigmoid层,输出0~1,最后把输出结果乘以原来对应的数据层.<br>
类似注意力机制,给每一个channel分配对应的权重,通过这种处理,可以提升网络的精度.
#### 模型结构
![](/resource/SE_net/SE_model.png)
#### 模型比较
![](/resource/SE_net/SE_precise.png)
