---
layout: post
title:  "instruments的使用"
date:   2019-12-12
categories: ios
---
注意: 不能使用越狱的手机来做性能检测

reference: 
[instruments-tutorial-getting-started](https://www.raywenderlich.com/4784723-instruments-tutorial-getting-started)
[practical-instruments](https://www.raywenderlich.com/5176-practical-instruments)

打开项目，点击 Product-> Profile 编译好之后，就可以开始使用instruments
<div class="center">
<image src="/resource/optimation/optimation10.png" style="width: 600px;"/>
</div>

#### CPU & Memory的检测
使用 instruments - > activity monitor 来检测
<div class="center">
<image src="/resource/optimation/optimation6.png" style="width: 600px;"/>
</div>

选择手机和app, 只能开启使用开发证书签名的app

<div class="center">
<image src="/resource/optimation/optimation7.png" style="width: 600px;"/>
</div>
筛选自己要看的app，每个app都是一个都是一个进程，可以同时查看 cpu 和 内存的使用情况, 上面的柱状图是手机整体的，没有什么参考意义，主要看下面的数据，目前还有找到导出数据的有效方式，只能大概的感受一下数据

#### 能耗检测
使用 instruments - > Energy Log 来检测
<div class="center">
<image src="/resource/optimation/optimation8.png" style="width: 600px;"/>
</div>

打开之后，控制板里边有如下这些项目的检测，说明它们是影响能耗的主要因素
<div class="center">
<image src="/resource/optimation/optimation9.png" style="width: 500px;"/>
</div>

* 是否休眠
* 屏幕亮度
* CPU运行情况
* 网络使情况
* GPS定位是否在工作
* WI-FI使用打开
* 蓝牙是否打开

所以降低能耗可以从上面这些方面着手去改善，不使用的时候就关掉 GPS，蓝牙，调低屏幕亮度，减少网络请求的次数，减少CPU的使用，此外还有其他应用检测工具，比如陀螺仪，计步器，不使用的使用也不推荐打开。