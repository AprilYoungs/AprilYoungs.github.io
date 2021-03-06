---
layout: post
title:  "性能优化"
date:   2019-12-12
categories: ios
---

<span>这一篇主要讲性能优化的策略，性能检测请查看另外一篇[instruments](ios_instruments)</span>

做性能优化之前，首先要有指标，明确需要优化什么？
那里出错了？

一个app的好坏如何定义？
* 界面是否好看？颜色，设计
* 内容是否足够吸引人？
* 交互是否方便合理？

上面这些都是产品设计和内容的问题，不过要把好的东西呈现出来就需要好的程序员啦，开发者在做好内容的同时，要保证做到
1. 应用不能无缘无故崩溃，**异常处理**
2. 界面展示、交互流畅，**零卡顿**
3. 耗电量小
4. app快速启动
5. 应用包尽量小

### 异常处理
避免意外崩溃，app意外崩溃无非是两种原因
1. 调用方法不当
    * OC中调用了没有实现的方法
    > 可以使用OC的消息转发机制处理，避免崩溃，并发错误信息当成警告上传，方便后面分析，优化
    * 数组越界
    > OC 的数组 也同样可以使用消息转发机制避免崩溃
    * 野指针
    > 只能靠经验来尽量减少    
2. 内存溢出
    * 加载大内容的东西，没有及时释放。比如同时加载了100000张图片
    > 对于已知的缓存类，可以通过添加内存不足的监听，内存不足时手动释放来解决<br>
    对于未知的内存增长可以借助Allocations来检测
    * 循环引用，用完的东西没有释放
    > 每个类打印`dealloc`或 `deinit`方法，遇到没释放的类，可以借助XCode 的 `debug memory graph` 来分析
    * 栈溢出, 死循环, 递归没有终止条件
    > 这种bug，在运行时可以很明显的看到重复调用的方法，添加终止条件就好

### 卡顿的原因
在屏幕成像的过程中，CPU和GPU起着至关重要的作用,在iOS程序中

* CPU: 对象的创建和销毁、对象属性的调整、布局计算、文本的计算和排版、图片的格式转换和解码、图像的绘制（Core Graphics）
* GPU: 纹理渲染

<div class="center">
<image src="/resource/optimation/optimation1.png" style="width: 600px;"/>
</div>

在iOS中是双缓冲机制，有前帧缓存、后帧缓存

#### 屏幕成像原理
<div class="center">
<image src="/resource/optimation/optimation2.png" style="width: 600px;"/>
</div>

#### 卡顿产生的原因
<div class="center">
<image src="/resource/optimation/optimation3.png" style="width: 600px;"/>
</div>

* 卡顿解决的主要思路
> 尽可能减少CPU、GPU资源消耗<br>
> 按照60FPS的刷帧率，每隔16ms就会有一次VSync信号

可以使用CADisplay来检测是否掉桢

#### 卡顿优化 - CPU

* 尽量用轻量级的对象，比如用不到事件处理的地方，可以考虑使用`CALayer`取代`UIView`

* 不要频繁地调用UIView的相关属性，比如`frame`、`bounds`、`transform`等属性，尽量减少不必要的修改

* 尽量提前计算好布局，在有需要时一次性调整对应的属性，不要多次修改属性

* **`Autolayout`会比直接设置`frame`消耗更多的CPU资源**

* 图片的`size`最好刚好跟`UIImageView`的`size`保持一致

* 控制一下线程的最大并发数量

* 尽量把耗时的操作放到子线程
    * 文本处理（尺寸计算、绘制）
    * 图片处理（解码、绘制）

#### 卡顿优化 - GPU
* 尽量避免短时间内大量图片的显示，尽可能将多张图片合成一张进行显示

* GPU能处理的最大纹理尺寸是4096x4096，一旦超过这个尺寸，就会占用CPU资源进行处理，所以纹理尽量不要超过这个尺寸

* 尽量减少视图数量和层次

* **减少混合图层** 减少透明的视图（alpha<1），不透明的就设置opaque为YES, 避免使用 clearColor, UILabel 默认的背景色就是 clearColor
    * 只要图片里边有透明区域就会触发混合图层，所以滚动列表应减少，或者不要显示透明的图片

* 尽量避免出现离屏渲染


#### 离屏渲染
* 在OpenGL中，GPU有2种渲染方式
    * On-Screen Rendering：当前屏幕渲染，在当前用于显示的屏幕缓冲区进行渲染操作
    * Off-Screen Rendering：离屏渲染，在当前屏幕缓冲区以外新开辟一个缓冲区进行渲染操作

* 离屏渲染消耗性能的原因
    * 需要创建新的缓冲区
    * 离屏渲染的整个过程，需要多次切换上下文环境，先是从当前屏幕（On-Screen）切换到离屏（Off-Screen）；等到离屏渲染结束以后，将离屏缓冲区的渲染结果显示到屏幕上，又需要将上下文环境从离屏切换到当前屏幕

* 哪些操作会触发离屏渲染？
    * 光栅化，`layer.shouldRasterize = YES`

    * 遮罩，`layer.mask`

    * 圆角，同时设置`layer.masksToBounds = YES`、`layer.cornerRadius`大于0<br>考虑通过`CoreGraphics`绘制裁剪圆角，或者叫美工提供圆角图片

    * 阴影，`layer.shadowXXX`<br>如果设置了`layer.shadowPath`就不会产生离屏渲染

#### 卡顿检测
* 平时所说的“卡顿”主要是因为在主线程执行了比较耗时的操作
* 可以添加Observer到主线程RunLoop中，通过监听RunLoop状态切换的耗时，以达到监控卡顿的目的(CADisplayLink)
* 使用 Core Animation 查看帧率

### 耗电的主要来源
* CPU处理，Processing
* 网络，Networking
* 定位，Location
* 图像，Graphics

----
#### 耗电优化
* **尽可能降低CPU、GPU功耗**
* **少用定时器**
* **优化I/O操作**
    * 尽量不要频繁写入小数据，最好批量一次性写入
    * 读写大量重要数据时，考虑用dispatch_io，其提供了基于GCD的异步操作文件I/O的API。用dispatch_io系统会优化磁盘访问
    * 数据量比较大的，建议使用数据库（比如SQLite、CoreData）

* **网络优化**
    * 减少、压缩网络数据
    * 如果多次请求的结果是相同的，尽量使用缓存 (NSCache)
    * 使用断点续传，否则网络不稳定时可能多次传输相同的内容
    * 网络不可用时，不要尝试执行网络请求
    * 让用户可以取消长时间运行或者速度很慢的网络操作，设置合适的超时时间
    * 批量传输，比如，下载视频流时，不要传输很小的数据包，直接下载整个文件或者一大块一大块地下载。如果下载广告，一次性多下载一些，然后再慢慢展示。如果下载电子邮件，一次下载多封，不要一封一封地下载

* **定位优化**
    * 如果只是需要快速确定用户位置，最好用CLLocationManager的requestLocation方法。定位完成后，会自动让定位硬件断电
    * 如果不是导航应用，尽量不要实时更新位置，定位完毕就关掉定位服务
    * 尽量降低定位精度，比如尽量不要使用精度最高的kCLLocationAccuracyBest
    * 需要后台定位时，尽量设置pausesLocationUpdatesAutomatically为YES，如果用户不太可能移动的时候系统会自动暂停位置更新
    * 尽量不要使用startMonitoringSignificantLocationChanges，优先考虑startMonitoringForRegion:

* **硬件检测优化**
    *   用户移动、摇晃、倾斜设备时，会产生动作(motion)事件，这些事件由加速度计、陀螺仪、磁力计等硬件检测。在不需要检测的场合，应该及时关闭这些硬件

### 启动优化
#### APP的启动
* APP的启动可以分为2种
    * 冷启动（Cold Launch）：从零开始启动APP
    * 热启动（Warm Launch）：APP已经在内存中，在后台存活着，再次点击图标启动APP

* APP启动时间的优化，主要是针对冷启动进行优化

* 通过添加环境变量可以打印出APP的启动时间分析（Edit scheme -> Run -> Arguments）
![](/resource/optimation/optimation41.png)
  
* `DYLD_PRINT_STATISTICS`设置为1
    ```cpp
    Total pre-main time: 646.13 milliseconds (100.0%)
         dylib loading time: 440.17 milliseconds (68.1%)
        rebase/binding time:   1.53 milliseconds (0.2%)
            ObjC setup time:  19.25 milliseconds (2.9%)
           initializer time: 185.04 milliseconds (28.6%)
           slowest intializers :
             libSystem.B.dylib :   5.11 milliseconds (0.7%)
   libBacktraceRecording.dylib :  17.33 milliseconds (2.6%)
    libMainThreadChecker.dylib :  18.26 milliseconds (2.8%)
                  AFNetworking :  27.73 milliseconds (4.2%)
                     MJRefresh :  34.13 milliseconds (5.2%)
                  RevealServer :  73.97 milliseconds (11.4%)
    ```
* 如果需要更详细的信息，那就将`DYLD_PRINT_STATISTICS_DETAILS`设置为1<br>
    ```cpp
    total time: 1.7 seconds (100.0%)
    total images loaded:  449 (413 from dyld shared cache)
    total segments mapped: 114, into 7554 pages
    total images loading time: 1.3 seconds (75.7%)
    total load time in ObjC:  22.53 milliseconds (1.2%)
    total debugger pause time: 860.82 milliseconds (48.3%)
    total dtrace DOF registration time:   0.12 milliseconds     (0.0%)
    total rebase fixups:  170,775
    total rebase fixups time:  12.50 milliseconds (0.7%)
    total binding fixups: 607,593
    total binding fixups time: 219.62 milliseconds (12.3%)
    total weak binding fixups time:   2.39 milliseconds (0.1%)
    total redo shared cached bindings time: 222.65  milliseconds (12.5%)
    total bindings lazily fixed up: 0 of 0
    total time in initializers and ObjC +load: 173.83   milliseconds (9.7%)
                      libSystem.B.dylib :   7.34 milliseconds   (0.4%)
            libBacktraceRecording.dylib :   4.28 milliseconds   (0.2%)
             libMainThreadChecker.dylib :  18.92 milliseconds   (1.0%)
                           AFNetworking :  59.35 milliseconds   (3.3%)
                              MJRefresh :  30.78 milliseconds   (1.7%)
                           RevealServer :  44.67 milliseconds   (2.5%)
                           CNDinoReader :   1.90 milliseconds   (0.1%)
    total symbol trie searches:    1369834
    total symbol table binary searches:    0
    total images defining weak symbols:  46
    total images using weak symbols:  109
    ```

* APP的冷启动可以概括为3大阶段
    * dyld
    * runtime
    * main
<div class="center">
<image src="/resource/optimation/optimation4.png" style="width: 900px;"/>
</div>

#### dyld
* dyld（dynamic link editor），Apple的动态链接器，可以用来装载Mach-O文件（可执行文件、动态库等）

* 启动APP时，dyld所做的事情有
    * 装载APP的可执行文件，同时会递归加载所有依赖的动态库
    * 当dyld把可执行文件、动态库都装载完毕后，会通知Runtime进行下一步的处理

#### runtime
* 启动APP时，runtime所做的事情有
    * 调用`map_images`进行可执行文件内容的解析和处理
    * 在`load_images`中调用`call_load_methods`，调用所有`Class`和`Category`的`+load`方法
    * 进行各种objc结构的初始化（注册Objc类 、初始化类对象等等）
    * 调用C++静态初始化器和`__attribute__((constructor))`修饰的函数

* 到此为止，可执行文件和动态库中所有的符号`(Class，Protocol，Selector，IMP，…)`都已经按格式成功加载到内存中，被`runtime`所管理

#### main
* 总结一下
    * APP的启动由`dyld`主导，将可执行文件加载到内存，顺便加载所有依赖的动态库
    * 并由`runtime`负责加载成`objc`定义的结构
    * 所有初始化工作结束后，dyld就会调用main函数
    * 接下来就是`UIApplicationMain`函数，`AppDelegate`的`application:` `didFinishLaunchingWithOptions:`方法

#### APP的启动优化
按照不同的阶段
* dyld
    > 减少动态库、合并一些动态库（定期清理不必要的动态库）<br>
    减少Objc类、分类的数量、减少`Selector`数量（定期清理不必要的类、分类）<br>
    减少C++虚函数数量<br>
    `Swift`尽量使用`struct`

* runtime
    > 用`+initialize`方法和`dispatch_once`取代所有的`__attribute__((constructor))`、`C++`静态构造器、`ObjC`的`+load`

* main
    > 在不影响用户体验的前提下，尽可能将一些操作延迟，不要全部都放在`finishLaunching`方法中
    按需加载

[详细的操作文章](https://mp.weixin.qq.com/s/S0xyhSbKNZ4qXNx479b3kA)

### 安装包瘦身
* 安装包（IPA）主要由可执行文件、资源组成

* 资源（图片、音频、视频等）
    * 采取无损压缩
    * 去除没有用到的资源： [https://github.com/tinymind/LSUnusedResources](https://github.com/tinymind/LSUnusedResources)

* 可执行文件瘦身
    * 编译器优化
    > Strip Linked Product、<br>Make Strings Read-Only、<br>Symbols Hidden by Default设置为YES<br>
    > 去掉异常支持，<br>Enable C++ Exceptions、<br>Enable Objective-C Exceptions设置为NO，<br> Other C Flags添加-fno-exceptions

    * 利用[AppCode](https://www.jetbrains.com/objc/)
    检测未使用的代码：菜单栏 -> Code -> Inspect Code

    * 编写LLVM插件检测出重复代码、未被调用的代码

#### LinkMap
* 生成LinkMap文件，可以查看可执行文件的具体组成
<div class="center">
<image src="/resource/optimation/optimation5.png" style="width: 600px;"/>
</div>

* 可借助第三方工具解析LinkMap文件： [https://github.com/huanxsd/LinkMap](https://github.com/huanxsd/LinkMap)


**NSCache， 断点续传**