---
layout: post
title:  "instruments的使用"
date:   2019-12-12
categories: ios
---
注意: 不能使用越狱的手机来做性能检测

<span>前提条件：后面使用的是XCode 10.3 的版本，手机为iOS 12， iOS 13 系统</span>

这篇文章会介绍如何使用instruments测量`CPU`，`GPU`，`内存`，`耗电`，具体的优化方法，请查看另外一篇 [性能优化](ios_optimation)

<br><br>

tips：如果打开`instrument`看不到代码的调用栈，确认一个项目的配置
打开这个配置之后，可以在instrument 中直接查看对应的项目源码，不打开就只能看到地址
<div class="center">
<image src="/resource/optimation/optimation11.png" style="width: 700px;"/>
</div>



打开项目，点击 Product-> Profile 编译好之后，就可以开始使用instruments
<div class="center">
<image src="/resource/optimation/optimation10.png" style="width: 600px;"/>
</div>

可以看到不同类型的工具
<div class="center">
<image src="/resource/optimation/optimation12.png" style="width: 600px;"/>
</div>

<!-- 下面主要讲Timer Profiler， Core Animation -->


### CPU & Memory的检测
使用 instruments - > activity monitor 来检测
<div class="center">
<image src="/resource/optimation/optimation6.png" style="width: 600px;"/>
</div>

<div class="center">
<image src="/resource/optimation/optimation7.png" style="width: 600px;"/>
</div>
筛选自己要看的app，每个app都是一个进程，可以同时查看 cpu 和 内存的使用情况, 上面的柱状图是手机整体的，没有什么参考意义，主要看下面的数据，目前还没有找到导出数据的有效方式，只能大概的感受一下数据, 详细的检测请继续往后面看

### Time Profiler 耗时检测
<div class="center">
<image src="/resource/optimation/optimation14.png" style="width: 700px;"/>
</div>

点击左上角的录制按钮，会启动app并开始打印CPU的运行状态
<div class="center">
<image src="/resource/optimation/optimation15.png" style="width: 800px;"/>
</div>
<div class="center">
<image src="/resource/optimation/optimation16.png" style="width: 800px;"/>
</div>

下方打印调用栈信息默认状态下会比较难看懂，可以改一下配置
<div class="center">
<image src="/resource/optimation/optimation17.png" style="width: 800px;"/>
</div>

`Separate by Thread`可以把不同线程的信息分开，`Hide System Libraries`可以隐藏系统框架的调用信息，因为我们一般只想看自己写的代码

还有一个操作的小技巧，按住 `option` 键的同时点击 `Main Thread` 左边的小三角，可以直接展开所有调用栈，是不是很方便？
<div class="center">
<image src="/resource/optimation/optimation18.png" style="width: 800px;"/>
</div>

可以很清晰的看到这里有一个方法`CatLogger.crunchSomeNumbers`很耗时，app启动后一直在调用
<div class="center">
<image src="/resource/optimation/optimation19.png" style="width: 800px;"/>
</div>


点击对应的方法，可以查看源码，并跳转到`XCode`， 修改代码也很方便
<div class="center">
<image src="/resource/optimation/optimation20.png" style="width: 800px;"/>
</div>

<div class="center">
<image src="/resource/optimation/optimation21.png" style="width: 800px;"/>
</div>

<div class="center">
<image src="/resource/optimation/optimation22.png" style="width: 800px;"/>
</div>

可以点击中间的按钮，切换模式，切换到`console`查看应用打印的信息
<div class="center">
<image src="/resource/optimation/optimation23.png" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/optimation/optimation24.png" style="width: 700px;"/>
</div>

可以使用 `time profiler` 来检测每个任务在CPU上消耗的时长，优化CPU

### GPU 的检测
<div class="center">
<image src="/resource/optimation/optimation25.png" style="width: 700px;"/>
</div>

9.x 版本的 `instruments` 可以用它来查看,界面上是否有混合图层，是否有离屏幕渲染
<div class="center">
<image src="/resource/optimation/optimation26.png" style="width: 800px;"/>
</div>

不过 10.x 以后的版本 使用 `Core Animation`只能真机调试，而且没有这个选项
<div class="center">
<image src="/resource/optimation/optimation27.png" style="width: 800px;"/>
</div>

相比前面的 `time profiler`， `Core Animation` 多了一个查看帧率的功能。

XCode 10 以后想要查看是否有混合图层，是否有离屏渲染，可以在模拟器上打开
<div class="center">
<image src="/resource/optimation/optimation28.png" style="width: 600px;"/>
</div>

红色区域混合图层
<div class="center">
<image src="/resource/optimation/optimation29.png" style="width: 400px;"/>
</div>

黄色区域启用了离屏渲染
<div class="center">
<image src="/resource/optimation/optimation30.png" style="width: 400px;"/>
</div>

### 内存检测 Allocations
<div class="center">
<image src="/resource/optimation/optimation31.png" style="width: 800px;"/>
</div>

打开之后开始录制，启动app
<div class="center">
<image src="/resource/optimation/optimation33.png" style="width: 800px;"/>
</div>

点击下方的 `mark generation`, 上方的进度条会出现小红旗，操作app，隔一段时间记录一下，看growth是否一直在增长，整体占用内存是否一直在增长，如果有涨有跌，并且维持在一个比较合理的数值，那说明内存管理不错，如果一直在增长，说明有内存溢出的风险，当内存超过某个阀值之后app就会被系统强制退出。
<div class="center">
<image src="/resource/optimation/optimation34.png" style="width: 800px;"/>
</div>

展开之后可以查看产生大内存的代码。
<div class="center">
<image src="/resource/optimation/optimation35.png" style="width: 800px;"/>
</div>

也可以在下方搜索自己应用的类，查看每个类的引用计数，
`persistent`代表当前存在的计数， `transient` 代表生成过并已经被释放的对象数量。
<div class="center">
<image src="/resource/optimation/optimation32.png" style="width: 800px;"/>
</div>

**如何查看是否有循环引用？**<br>
可以使用XCode比较直观的工具 `debug memory graph`<br>
运行项目后，点击下方的按钮，可以直观的看到每个对象的相互引用图
<div class="center">
<image src="/resource/optimation/optimation36.png" style="width: 800px;"/>
</div>

如果对象没有被释放，出现循环引用，可能会出现如下这种图
<div class="center">
<image src="/resource/optimation/optimation37.png" style="width: 600px;"/>
</div>


### App Launch 应用启动时间
<div class="center">
<image src="/resource/optimation/optimation38.png" style="width: 700px;"/>
</div>

点击左上角的录制，会启动app，启动完之后会自动关闭
<div class="center">
<image src="/resource/optimation/optimation39.png" style="width: 800px;"/>
</div>

切换到Profile，可以看到每个环节消耗的时间
<div class="center">
<image src="/resource/optimation/optimation40.png" style="width: 600px;"/>
</div>

### 能耗检测
使用 instruments - > Energy Log 来检测
<div class="center">
<image src="/resource/optimation/optimation8.png" style="width: 600px;"/>
</div>

打开之后，控制板里边有如下这些项目的检测，说明它们是影响能耗的主要因素
<div class="center">
<image src="/resource/optimation/optimation9.png" style="width: 400px;"/>
</div>

* 是否休眠
* 屏幕亮度
* CPU运行情况
* 网络使情况
* GPS定位是否在工作
* WI-FI使用打开
* 蓝牙是否打开

所以降低能耗可以从上面这些方面着手去改善，不使用的时候就关掉 GPS，蓝牙，调低屏幕亮度，减少网络请求的次数，减少CPU的使用，此外还有其他应用检测工具，比如陀螺仪，计步器，不使用时也不推荐打开。


reference: <br>
[instruments-tutorial-getting-started](https://www.raywenderlich.com/4784723-instruments-tutorial-getting-started)<br>
[practical-instruments](https://www.raywenderlich.com/5176-practical-instruments)