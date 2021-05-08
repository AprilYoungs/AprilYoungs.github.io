---
layout: post
title:  "Spark 原理"
date:   2021-4-18
categories: big data
---

Spark 原理主要包括 :  
* 核心组件的运行机制(Master、Worker、SparkContext等)   
* 任务调度的原理  
* Shuffle原理  
* 内存管理  
* 数据倾斜处理   
* Spark优化  
熟练掌握 Spark 内核原理，能够帮助我们更好地完成 Spark 应用开发，并能够准确锁定项目运行过程中出现问题的 症结所在。


## Spark Runtime<br>
![](/resource/spark_theory/assets/92E0F639-8F95-4132-9BA6-33DA107DA67E.png)

1.Using spark-submit, the user submits an application.  
2.In spark-submit, we invoke the main() method that the user specifies. It also launches the driver program.  
3.The driver program asks for the resources to the cluster manager that we need to launch executors.  
4.The cluster manager launches executors on behalf of the driver program.  
5.The driver process runs with the help of user application. Based on the actions and transformation on RDDs, the driver sends work to executors in the form of tasks.  
6.The executors process the task and the result sends back to the driver through the cluster manager.

### 核心组件

- Master(Cluster Manager)
  集群中的管理节点，管理集群资源，通知 Worker 启动 Executor 或 Driver。

- Worker
  集群中的工作节点，负责管理本节点的资源，定期向Master汇报心跳，接收Master的命令，启动Driver 或 Executor。Worker :

- Driver
  执行 Spark 应用中的 main 方法，负责实际代码的执行工作。其主要任务:  
  * 负责向集群申请资源，向master注册信息   
  * Executor启动后向 Driver 反向注册   
  * 负责作业的解析、生成Stage并调度Task到Executor上   
  * 监控Task的执行情况，执行完毕后释放资源  
  * 通知 Master 注销应用程序

- Executor
  是一个 JVM 进程，负责执行具体的Task。Spark 应用启动时， Executor节点被同时启动，并且始终伴随着整个 Spark 应用的生命周期而存在。如果有 Executor 节点发生了故障或崩溃， 会将出错节点上的任务调度到其他 Executor 节点上继续运行。Executor 核心功能:  
  * 负责运行组成 Spark 应用的任务，并将结果返回给 Driver 进程   
  * 通过自身的 Block Manage 为应用程序缓存RDD

### 集群部署模式

Spark 支持 3 种集群管理器，分别为:

- Standalone
  独立模式，Spark 原生的简单集群管理器，自带完整的服务，可单独部署到一个集群中，无需依 赖任何其他资源管理系统，使用 Standalone 可以很方便地搭建一个集群;

- Hadoop YARN
  统一的资源管理机制，在上面可以运行多套计算框架，如MapReduce、Storm 等，根据 driver 在集群中的位置不同，分为 yarn client 和 yarn cluster;

- Apache Mesos
  一个强大的分布式资源管理框架，它允许多种不同的框架部署在其上;

- master url<br>
![](/resource/spark_theory/assets/09BDCFA7-CFA4-422C-8411-6D4A76F4E152.png)
  Spark 的运行模式取决于传递给 SparkContext 的 Master 环境变量的值， 个别模式还需要辅助的程序接口来配合使用  
    
    
  提交任务时，以下参数共同决定了 Spark 运行方式:  
  * master (MASTER_URL) :决定了 Spark 任务提交给哪种集群处理  
  * deploy-mode (DEPLOY_MODE):决定了 Driver 的运行方式，可选值为 Client(缺省值) 或 Cluster

### Yarn模式运行机制

- Yarn Cluster 模式(生产)<br>
![](/resource/spark_theory/assets/D3C01B59-B35F-45D6-9860-B8B13CCEB870.png)
  * Client先RM提交请求，并上传jar到HDFS上   
  * RM在集群中选择一个NM，在其上启动AppMaster，在AppMaster中实例化SparkContext(Driver)   
  * AppMaster向RM注册应用程序，注册的目的是申请资源。RM监控App的运行状态直到结束   
  * AppMaster申请到资源后，与NM通信，在Container中启动Executor进程   
  * Executor向Driver注册，申请任务  
  * Driver对应用进行解析，最后将Task发送到Executor上   
  * Executor中执行Task，并将执行结果或状态汇报给Driver   
  * 应用执行完毕，AppMaster通知RM注销应用，回收资源

- Yarn Client 模式(调试)<br>
![](/resource/spark_theory/assets/62B9FC06-41CE-4266-AAC0-8E3B3CBDD1FE.png)
  * 启动应用程序实例化SparkContext，向RM申请启动AppMaster   
  * RM在集群中选择一个NM，在其上启动AppMaster   
  * AppMaster向RM注册应用程序，注册的目的是申请资源。RM监控App的运行状态直到结束   
  * AppMaster申请到资源后，与NM通信，在Container中启动Executor进程 Executor向Driver注册，申请任务  
  * Driver对应用进行解析，最后将Task发送到Executor上   
  * Executor中执行Task，并将执行结果或状态汇报给Driver   
  * 应用执行完毕，Driver通知RM注销应用，回收资源

- Client模式与Cluster模式的区别
  client模式:  
  * Driver运行在客户端   
  * 适用于调试，能直接看见各种日志 
  * 连接断了，任务就挂了  
    
  cluster模式:  
  * Driver运行在AppMaster中(运行在集群中)   
  * 适合于生产，日志需要登录到某个节点才能看到(webUI查看)  
  * 连接断了，任务不受影响

## Master & Worker 解析

### Spark RPC 框架<br>
![](/resource/spark_theory/assets/F41CBCFF-DCC2-48D6-B897-D71CB24B3243.png)

RPC(Remote Procedure Call)远程过程调用。两台服务器A、B，A服务器上的应用，想要调用B服务器上应用提供 的函数/方法，由于不在一个内存空间，不能直接调用，需要通过网络来表达调用的语义和传达调用的数据。  
* RPC接口。让使用者调用远程请求时，就像调用本地函数(发消息，接收消息调用本地函数)  
* 序列化、反序列化  
* 网络传输  
  
如果把分布式系统(Hadoop、Spark等)比作一个人，那么RPC可以认为是人体的血液循环系统。它将系统中各个 不同的组件联系了起来。在Spark中，不同组件之间的通信、jar的上传、Shuffle数据的传输、Block数据的复制与备 份都是基于RPC来实现的，所以说 RPC 是分布式系统的基石毫不为过。  
  
Spark 2.X 的 RPC 框架是基于优秀的网络通信框架 Netty 开发的。Spark RPC借鉴了Akka（2.X以前  
）的中的设计，它是基于 Actor模型，各个组件可以认为是一个个独立的实体，各个实体之间通过消息来进行通信。具体各个组件之间的关系 如上图

- RpcEnv
  RpcEnv是RPC的环境对象，管理着整个 RpcEndpoint 的生命周期，其主要功能有:根据name或uri注册 endpoints、管理各种消息的处理、停止endpoints。其中RpcEnv只能通过RpcEnvFactory创建得到。 RpcEnv中的 核心方法:  
    
  ```scala  
  // RpcEndpoint 向 RpcEnv 注册  
  def setupEndpoint(name: String, endpoint: RpcEndpoint): RpcEndpointRef  
    
  // 根据参数信息，从 RpcEnv 中获得一个远程的RpcEndpoint  
  def setupEndpointRef(address: RpcAddress, endpointName: String): RpcEndpointRef  
  ```

- RpcEndpoint
  RpcEndpoint:表示一个消息通信体，可以接收、发送、处理消息。  
    
  RpcEndpoint的生命周期为:constructor -> onStart -> receive* -> onStop，其中:  
  * onStart在接收任务消息前调用主要用来执行初始化  
  * send发送的消息不需要立即处理，ask发送的消息需要立即处理  
  * receive 和 receiveAndReply 分别用来接收RpcEndpoint send 或 ask 过来的消息  
  	* receive方法，接收由RpcEndpointRef.send方法发送的消息，该类消息不需要进行响应消息(Reply)， 而只是在RpcEndpoint端进行处理   
  	* receiveAndReply方法，接收由RpcEndpointRef.ask发送的消息，RpcEndpoint端处理完消息后，需要给调用RpcEndpointRef.ask的通信端响应消息

- RpcEndPointRef
  RpcEndpointRef 是对远程 RpcEndpoint 的一个引用。当需要向一个具体的RpcEndpoint发送消息时，需要获取到该RpcEndpoint的引用，然后通过该引用发送消息。  
  * send 方法发送消息后不等待响应，亦即 Send-and-forget  
  * ask 方法发送消息后需要等待通信对端给予响应，通过 Future 来异步获取响应结果

### Master 启动流程

Master继承了RpcEndpoint，实现了 RpcEndpoint 接口  
Master的生命周期遵循 constructor -> onStart -> receive* -> onStop 的步骤   
Master 的 onStart 方法中最重要的事情是:执行恢复  
  
Master HA的实现方式:  
* ZOOKEEPER。基于zookeeper的Active / Standby 模式。适用于生产模式，其基本原理是通过zookeeper来选 举一个Master，其他的Master处于Standby状态;   
* FILESYSTEM。基于文件系统的单点恢复。主要用于开发或测试环境。为Spark提供目录保存spark Application 和worker的注册信息，一旦Master发生故障，可通过重新启动Master进程(start-master.sh)，恢复已运行的 Spark Application和Worker 注册信息;  
* CUSTOM。允许用户自定义 HA 的实现，对于高级用户特别有用;   
* _。默应情况，未配置HA，不会持久化集群的数据，Master启动立即管理集群;

### Worker 启动流程

Worker继承了RpcEndpoint，实现了 RpcEndpoint 接口  
Worker的生命周期遵循 constructor -> onStart -> receive* -> onStop 的步骤   
Worker 的 onStart 方法中最重要的事情是: 向master注册

## SparkContext

Spark应用程序的第一步就是创建并初始化SparkContext，SparkContext的初始化过程包含了内部组件的创建和准 备，主要涉及网络通信、分布式、消息、存储、计算、调度、缓存、度量、清理、文件服务和UI等方面。  
SparkContext 是 Spark 程序主要功能的入口点，链接Spark集群，创建RDD、累加器和广播变量，一个线程只能运 行一个SparkContext。  
SparkContext在应用程序中将外部数据转换成RDD，建立了第一个RDD，也就是说SparkContext建立了RDD血缘关 系的根，是DAG的根源。  
  
SparkContext 内部

### 重要组件

- SparkConf
  Spark Application 的配置，用来设置 Spark 的 KV 格式的参数。可用通过 new 实例化一个 SparkConf 的对象，这可以把所有的以 spark 开头的属性配置好，使用 SparkConf 进行参数设置的优先级是高 于属性文件，通过 new SparkConf(false) 可以在进行单元测试的时候不去读取外部的设置。所有的 setter 方法都支持链式表达。一旦 SparkConf 对象传给 Spark，会被其他组件 clone，并且不能再动态的被任何用户 修改

- DAGScheduler
  DAG调度器，调度系统中最重要的组件之一，负责创建job，将DAG的RDD划分为不同的 stage，提交stage

- SparkEnv
   SparkEnv 是Spark的执行环境对象，其中包括与众多Executor执行相关的对象。Executor 有自己 的 Spark 的执行环境 SparkEnv。有了 SparkEnv，就可以将数据存储在存储体系中;就能利用计算引擎对计算 任务进行处理，就可以在节点间进行通信等。在 local 模式下Driver会创建Executor，local-cluster部署模式或 者 Standalone 部署模式下 Worker 的 CoarseGrainedExecutorBackend 进程中也会创建Executor，所以 SparkEnv 存在于 Driver 或者 CoarseGrainedExecutorBackend 进程中。SparkEnv包含了很多重要的组件，完 成不同的功能

- TaskScheduler
  任务调度器，调度系统中最重要的组件之一，按照调度算法对集群管理器已经分配给应用程 序的资源进行二次调度后分配任务，TaskScheduler调度的 Task是 DAGScheduler创建的，因此DAGScheduler 是TaskScheduler的前置调度器

- SchedulerBackend
  用于对接不同的资源管理系统

### SparkEnv重要组件<br>
![](/resource/spark_theory/assets/FEE08E33-17C3-4AD8-8912-57B02A96DAEC.png)

SparkEnv是spark计算层的基石，不管是 Driver 还是 Executor，都需要依赖SparkEnv来进行计算，它是Spark的执 行环境对象，其中包括与众多Executor执行相关的对象。Spark 对任务的计算都依托于 Executor 的能力，所有的 Executor 都有自己的 Spark 的执行环境 SparkEnv。  
  
有了 SparkEnv，可以将数据存储在存储体系中;利用计算引擎对计算任务进行处理，可以在节点间进行通信等。

- RpcEnv
  通过Netty技术来实现对组件之间的通信;

- MapOutPutTracker
  MapOutputTracker 用于跟踪Map阶段任务的输出状态，此状态便于Reduce阶段任务 获取地址及中间结果。每个Map任务或者Reduce任务都会有其唯一标识，分别为mapId 和 reduceId。每个 Reduce任务的输入可能是多个Map任务的输出，Reduce会到各个Map任务的所在节点上拉取Block。每个 Shuffle过程都有唯一的表示shuffleId。MapOutputTracker 有两个子类:MapOutputTrackerMaster(for driver) 和 MapOutputTrackerWorker(for executors);因为它们使用了不同的HashMap来存储元数据;

- ShuffleManager
  ShuffleManager负责管理本地及远程的Block数据的shuffle操作。ShuffleManager根据默 认的 spark.shuffle.manager 属性，通过反射方式生成的SortShuffleManager的实例。默认使用的是sort模式 的SortShuffleManager;

- BlockManager
  BlockManager负责对Block的管理;

- MemoryManager
  MemoryManager 的主要实现有 StaticMemoryManager 和 UnifiedMemoryManager(默认)。

### SparkContext启动流程

初始化步骤:   
1. 初始设置  
2. 创建 SparkEnv  
3. 创建 SparkUI  
4. Hadoop 相关配置  
5. Executor 环境变量  
6. 注册 HeartbeatReceiver 心跳接收器  
7. 创建 TaskScheduler、SchedulerBackend   
8. 创建和启动 DAGScheduler  
9. 启动TaskScheduler、SchedulerBackend  
10. 启动测量系统 MetricsSystem  
11. 创建事件日志监听器  
12. 创建和启动 ExecutorAllocationManager   
13. ContextCleaner 的创建与启动  
14. 自定义 SparkListener 与启动事件  
15. Spark 环境更新  
16. 投递应用程序启动事件  
17. 测量系统添加Source  
18. 将 SparkContext 标记为激活

### 三大组件启动流程<br>
![](/resource/spark_theory/assets/43C9D90D-CF65-4DE2-A61C-9D2FC007565C.png)

* DAGScheduler(高层调度器，class):负责将 DAG 拆分成不同Stage的具有依赖关系(包含RDD的依赖关 系)的多批任务，然后提交给TaskScheduler进行具体处理  
* TaskScheduler(底层调度器，trait，只有一种实现TaskSchedulerImpl):负责实际每个具体Task的物理调度 执行  
* SchedulerBackend(trait):有多种实现，分别对应不同的资源管理器 	* 在Standalone模式下，其实现为:StandaloneSchedulerBackend

## 作业执行原理

### 任务调度概述<br>
![](/resource/spark_theory/assets/1FFDB368-BAE4-4F55-8223-3E0AA8FFE4DB.png)

Spark 的任务调度可分为:Stage 级调度(高层调度)、Task级调度(底层调度)。总体调度流程如上图所示：  
  
* Job : 遇到一个 Action 方法则触发一个 Job  
* Stage 是 Job 的子集，遇到 Shuffle(宽依赖) 做一次划分。Stage有两个具体子类:  
	* ShuffleMapStage，是其他 Stage 的输入，ShuffleMapStage 内部的转换操作(map、filter等)会组成pipeline，连在一起计算，  
产生 map 输出文件(Shuffle 过程中输出的文件)   
	* ResultStage。一个job中只有一个ResultStage，最后一个 Stage 即为 ResultStage  
* Task 是 Stage 的子集，以并行度(分区数)来衡量，分区数是多少，则有多少个 task

### job触发<br>
![](/resource/spark_theory/assets/1717F812-2433-4671-A97A-780BA0156943.png)

Action 操作后会触发 Job 的计算，并交给 DAGScheduler 来提交。  
  
1、Action 触发 sc.runJob   
2、触发 dagScheduler.runJob  
3、dagScheduler.runJob 提交job，作业提交后发生阻塞，等待执行结果， job 是串行执行的。

### Stage划分

Spark的任务调度从 DAG 划分开始，由 DAGScheduler 完成：  
* DAGScheduler 根据 RDD 的血缘关系构成的 DAG 进行切分，将一个Job划分为若干Stages，具体划分策略是: 从最后一个RDD开始，通过回溯依赖判断父依赖是否是宽依赖(即以Shuffle为界)，划分Stage;窄依赖的 RDD之间被划分到同一个Stage中，可以进行 pipeline 式的计算  
* 在向前搜索的过程中使用深度优先搜索算法  
* 最后一个Stage称为ResultStage，其他的都是ShuffleMapStage  
* 一个Stage是否被提交，需要判断它的父Stage是否执行。只有父Stage执行完毕才能提交当前Stage，如果一个 Stage没有父Stage，那么从该Stage开始提交  
  
总体而言，DAGScheduler做的事情较为简单，仅仅是在Stage层面上划分DAG，提交Stage并监控相关状态信息。

- DAGScheduler中的重要对象

	- DAGSchedulerEventProcessLoop
	   DAGScheduler内部的事件循环处理器，用于处理DAGSchedulerEvent类型 的事件。DAGSchedulerEventProcessLoop 实现了自 EventLoop。  
	  EventLoop是个消息异步处理策略抽象类(abstract class)  
	  * 内置了一个消息队列(双端队列) eventQueue:LinkedBlockingDeque[E]，配合实现消息存储、消息消费使用   
	  * 内置了一个消费线程eventThread，消费线程消费队列中的消息，消费处理接口函数是onReceive(event: E)，消 费异常函数接口onError(e: Throwable)   
	  * 对外开放了接收消息的post方法:接收到外部消息并存入队列，等待被消费   
	  * 消费线程启动方法start。在调用线程启动方法:eventThread.start()之前，需要调用onStart()为启动做准备接口函数   
	  * 消费线程停止方法stop。在调用线程停止方法:eventThread.interrupt&eventThread.join()之后，需要调用 onStop()做补充接口函数

	- JobWaiter
	  实现了 JobListener 接口，等待 DAGScheduler 中的job计算完成。  
	  每个 Task 结束后，通过回调函数，将对应结果传递给句柄函数 resultHandler 处理。 所有Tasks都完成时认为job完成。

- 调用流程
  1.dagScheduler.submit 发送消息  
  2.调用 dagScheduler.handleJobSubmitted  
  3.handleJobSubmitted => createResultStage  
  4.提交ResultStage  
  >submitStage 方法会通过入参 ResultStage 逐层获取父stage，再从最上游stage开始逐步调用 TaskScheduler.submitTasks 方法提交task集合，最后才提交ResultStage的task集合。先调用getMissingParentStages来获取是否有未提交的父stages。若有，则依次递归提交父stages，并将missing加 入到waitingStages中。对于要依次提交的父stage，也是如此;  
  >若missing存在未提交的父stages，则先提交父stages;  
  >这时会调用submitMissingTasks(stage, jobId.get)，参数就是missing及其对应的jobId.get。这个函数便是将stage与 taskSet对应起来，然后DAGScheduler将taskSet提交给TaskScheduler去执行的Executor。  
  5.提交 Task  
  	* 得到RDD中需要计算的partition:对于Shuffle类型的stage，需要判断stage中是否缓存了该结果;对于Result类型的Final Stage，则判断计算Job中该 partition是否已经计算完成。这么做(没有直接提交全部tasks)的原因是，stage中某个task执行失败其他执行成功 的时候就需要找出这个失败的task对应要计算的partition而不是要计算所有partition。  
  	* 序列化task的binary:Executor可以通过广播变量得到它。每个task运行的时候首先会反序列化  
  	* 为每个需要计算的partition生成一个task: ShuffleMapStage对应的task全是ShuffleMapTask;ResultStage对应的全是ResultTask。task继承Serializable，要确保task是可序列化的  
  	* 提交tasks: 先用tasks来初始化一个 TaskSet 对象，再调用 TaskScheduler.submitTasks 提交

### Task调度<br>
![](/resource/spark_theory/assets/273F9401-A9A0-426E-86E2-9BD159F71751.png)

Task 的调度是由 TaskScheduler 来完成(底层调度)。  
DAGScheduler 将 Stage 打包到 TaskSet 交给TaskScheduler，TaskScheduler 会将 TaskSet 封装为 TaskSetManager 加入到调度队列中  
  
TaskScheduler 初始化后会启动 SchedulerBackend  
  
SchedulerBackend负责跟外界打交道，接收 Executor 的注册，维护 Executor 的状态。 SchedulerBackend 是个管理“资源”(Executor)的，它在启动后会定期地去“询问” TaskScheduler 有没有任务要运行。  
大致方法调用流程如上图所示  
  
将 TaskSetManager 加入 rootPool 调度池中之后，调用 SchedulerBackend 的 reviveOffers 方法给driverEndpoint 发送 ReviveOffer 消息;driverEndpoint 收到 ReviveOffer 消息后调用 makeOffers 方法，过滤出活跃状态的 Executor(这些 Executor都是任务启动时反向注册到 Driver 的 Executor)，然后将 Executor 封装成 WorkerOffer 对 象 ; 准备好计算资源(WorkerOffer)后 ， taskScheduler 基于这些资源调用resourceOffer 在 Executor 上分 配 task。

- TaskSetManager<br>
![](/resource/spark_theory/assets/A27E9BCA-5593-4A80-82DF-2D2866E9E470.png)
  TaskSetManager 负责监控管理同一个 Stage 中的 Tasks，TaskScheduler 以 TaskSetManager 为单元来调度任务。

### 调度策略<br>
![](/resource/spark_theory/assets/E9B51537-4749-48EA-9781-CF100B68F866.png)

TaskScheduler会先把 DAGScheduler 给过来的 TaskSet 封装成 TaskSetManager 扔到任务队列里，然后再从任务队 列里按照一定规则把它们取出来，由 SchedulerBackend 发送给Executor运行;  
TaskScheduler 以树的方式来管理任务队列，树中的根节点类型为 Schedulable，叶子节点为 TaskSetManager，非叶子节点为Pool；  
TaskScheduler 支持两种调度策略:FIFO(默认调度策略)、FAIR。

- FIFO 调度策略
  FIFO调度策略，TaskSetManager 按照到来的先后次序进入队列;出队时直接拿最先进入队列的 TaskSetManager。 FIFO调度策略是默认模式，在此模式下，只有一个 TaskSetManager 池。

- Fair 调度策略
  Fair 模式中有一个 rootPool 和多个子 Pool，各个子 Pool 中存储着所有待分配的 TaskSetManager ;  
  在 Fair 模式中，需要先对子 Pool 进行排序，再对子 Pool 里面的 TaskSetManager 进行排序，因为Pool和 TaskSetManager 都继承了 Schedulable trait，因此可使用相同的排序算法;

### 本地化调度

* DAGScheduler切割Job，划分Stage。调用submitStage来提交一个Stage对应的tasks，submitStage会调用submitMissingTasks，submitMissingTasks 确定每个需要计算的 task 的 preferred Locations  
* 通过调用 getPreferredLocations 得到分区的优先位置，一个partition对应一个task，此分区的优先位置就是task的优先位置  
* 从调度队列中拿到 TaskSetManager 后，那么接下来的工作就是 TaskSetManager 按照一定的规则一个个取出task 给 TaskScheduler，TaskScheduler 再交给 SchedulerBackend 发送到 Executor 上执行  
* 根据每个 task 的优先位置，确定 task 的 Locality 级别，Locality一共有五种，优先级由高到低顺序  
	* PROCESS_LOCAL data is in the same JVM as the running code. This is the best locality possible  
	* NODE_LOCAL data is on the same node. Examples might be in HDFS on the same node, or in another executor on the same node. This is a little slower than PROCESS_LOCAL because the data has to travel between processes  
	* NO_PREF data is accessed equally quickly from anywhere and has no locality preference  
	* RACK_LOCAL data is on the same rack of servers. Data is on a different server on the same rack so needs to be sent over the network, typically through a single switch  
	* ANY data is elsewhere on the network and not in the same rack  
在调度执行时，Spark总是会尽量让每个 Task 以最高的本地性级别来启动;  
当某个 Task 以某个本地性级别启动，但是该本地性级别对应的所有节点都没有空闲资源而启动失败，此时并不会马 上降低本地性级别启动，而是在某个时间长度内再次以本地性级别来启动该task，若超过限时时间则降级启动，去 尝试下一个本地性级别，依次类推;  
通过调整每个类别的最大容忍延迟时间，在等待阶段对应的 Executor 可能就会有相应的资源去执行此 Task，这样有 可能在一定程度上提到运行性能;

### 返回结果<br>
![](/resource/spark_theory/assets/B5AC24D0-4072-4F31-8F41-287A0F8CB579.png)

对于Executor的计算结果，会根据结果的大小使用不同的处理策略:  
* 计算结果在(0，200KB-128MB)区间内:通过Netty直接发送给Driver终端  
	* Netty的预留空间reservedSizeBytes，200KB  
	* spark.rpc.message.maxSize，默认值是128MB  
* 计算结果在[128MB， 1GB]区间内:将结果以 taskId 为编号存入到 BlockManager 中，然后通过 Netty 把编号 发送给 Driver;阈值可通过 Netty 框架传输参数设置  
	* spark.driver.maxResultSize，默认值 1G  
* 计算结果在(1GB，∞)区间内:直接丢弃，可通过spark.driver.maxResultSize配置

### 失败重试与黑名单机制

Task被提交到Executor启动执行后，Executor会将执行状态上报给SchedulerBackend(DriverEndpoint);  
SchedulerBackend 则告诉 TaskScheduler，TaskScheduler 找到该 Task 对应的 TaskSetManager，并通知到该 TaskSetManager，这样 TaskSetManager 就知道 Task 的失败与成功状态;  
  
即 SchedulerBackend(DriverEndPoint) => TaskScheduler => TaskSetManager  
  
对于失败的Task，会记录它失败的次数，如果失败次数还没有超过最大重试次数，那么就把它放回待调度的Task池子 中，否则整个Application失败;  
  
在记录 Task 失败次数过程中，会记录它上一次失败所在的Executor Id和Host。下次再调度这个Task时，会使用黑名 单机制，避免它被调度到上一次失败的节点上，起到一定的容错作用;

## Shuffle详解

在 Spark 或 MapReduce 分布式计算框架中，数据被分成一块一块的分区，分布在集群中各节点上，每个计算任务 一次处理一个分区，当需要对具有某种共同特征的一类数据进行计算时，就需要将集群中的这类数据汇聚到同一节 点。这个按照一定的规则对数据重新分区的过程就是Shuffle。

### Spark Shuffle的两个阶段<br>
![](/resource/spark_theory/assets/04592529-6915-433C-B540-524F9CB5D238.png)

对于Spark来讲，一些Transformation或Action算子会让RDD产生宽依赖，即Parent RDD中的每个Partition被child RDD中的多个Partition使用，这时需要进行Shuffle，根据Record的key对parent RDD进行重新分区。 以Shuffle为边界，Spark将一个Job划分为不同的Stage。Spark的Shuffle分为Write和Read两个阶段，分属于两个不同的Stage，前者是Parent Stage的最后一步，后者是Child Stage的第一步。  
  
Spark 的 Stage 分为两种:  
* ResultStage。负责返回计算结果   
* ShuffleMapStage。其他的均为ShuffleMapStage  
  
如果按照 map 端和 reduce 端来分析的话:   
* ShuffleMapStage可以即是map端任务，又是reduce端任务  
* ResultStage只能充当reduce端任务  
  
Spark Shuffle的流程简单抽象为以下几步:  
* Shuffle Write  
	* Map side combine (if needed)  
	* Write to local output file   
* Shuffle Read  
	* Block fetch  
	* Reduce side combine   
	* Sort (if needed)

### Shuffle Writer

ShuffleWriter(抽象类)，有3个具体的实现:  
* SortShuffleWriter: 需要在 Map 排序  
* UnsafeShuffleWriter: 使用 Java Unsafe 直接操作内存，避免Java对象多余的开销和GC 延迟，效率高  
* BypassMergeSortShuffleWriter: 和Hash Shuffle的实现基本相同，区别在于map task输出汇总一个文件，同时还会产生一个index file  
  
以上 ShuffleWriter 有各自的应用场景。分别如下:  
* 没有map端聚合操作 且 RDD的partition分区数小于200个，使用 BypassMergerSortShuffleWriter  
* 没有map端聚合，RDD的partitions分区数小于16,777,216，且 Serializer支持 relocation【Serializer 可以对已 经序列化的对象进行排序，这种排序起到的效果和先对数据排序再序列化一致】，使用UnsafeShuffleWriter  
* 不满足以上条件使用SortShuffleWriter

- bypass运行机制
  bypass运行机制的触发条件如下:  
  * shuffle map task数量 <= spark.shuffle.sort.bypassMergeThreshold (缺省200)  
  * 不是聚合类的shuffle算子  
    
  Bypass机制 Writer 流程如下:  
  * 每个Map Task为每个下游 reduce task 创建一个临时磁盘文件，并将数据按key进行hash然后根据hash值写入 内存缓冲，缓冲写满之后再溢写到磁盘文件;  
  * 最后将所有临时磁盘文件都合并成一个磁盘文件，并创建索引文件;  
  * Bypass方式的Shuffle Writer机制与Hash Shuffle是类似的，在shuffle过程中会创建很多磁盘文件，最后多了一个磁盘文件合并的过程。Shuffle Read的性能会更好;   
  * Bypass方式与普通的Sort Shuffle方式的不同在于:  
  	* 磁盘写机制不同   
  	* 根据key求hash，减少了数据排序操作，提高了性能

- Shuffle Writer 流程
  1.数据先写入一个内存数据结构中。不同的shuffle算子，可能选用不同的数据结构  
  	* 如果是 reduceByKey 聚合类的算子，选用 Map 数据结构，一边通过 Map 进行聚合，一边写入内存  
  	* 如果是 join 类的 shuffle 算子，那么选用 Array 数据结构，直接写入内存  
  2.检查是否达到内存阈值。每写一条数据进入内存数据结构之后，就会判断一下，是否达到了某个临界阈值。如 果达到临界阈值的话，那么就会将内存数据结构中的数据溢写到磁盘，并清空内存数据结构  
  3.数据排序。在溢写到磁盘文件之前，会先根据key对内存数据结构中已有的数据进行排序。排序过后，会分批将 数据写入磁盘文件。默认的batch数量是10000条，也就是说，排序好的数据，会以每批1万条数据的形式分批 写入磁盘文件  
  4.数据写入缓冲区。写入磁盘文件是通过Java的BufferedOutputStream 实现的。BufferedOutputStream 是 Java的缓冲输出流，首先会将数据缓冲在内存中，当内存缓冲满溢之后再一次写入磁盘文件中，这样可以减少 磁盘IO次数，提升性能  
  5.重复写多个临时文件。一个 Task 将所有数据写入内存数据结构的过程中，会发生多次磁盘溢写操作，会产生多个临时文件  
  6.临时文件合并。最后将所有的临时磁盘文件进行合并，这就是merge过程。此时会将之前所有临时磁盘文件中 的数据读取出来，然后依次写入最终的磁盘文件之中  
  7.写索引文件。由于一个 Task 就只对应一个磁盘文件，也就意味着该task为下游stage的task准备的数据都在这 一个文件中，因此还会单独写一份索引文件，其中标识了下游各个 Task 的数据在文件中的 start offset 与 end offset

### Shuffle MapOutputTracker<br>
![](/resource/spark_theory/assets/11FF9BD0-B59A-4993-840F-8BC4DC178133.png)

Spark的shuffle过程分为Writer和Reader:  
* Writer负责生成中间数据   
* Reader负责整合中间数据  
而中间数据的元信息，则由MapOutputTracker负责管理。 它负责Writer和Reader的沟通。 Shuffle Writer会将中间数据保存到Block里面，然后将数据的位置发送给MapOutputTracker。  
Shuffle Reader通过向 MapOutputTracker 获取中间数据的位置之后，才能读取到数据。 Shuffle Reader 需要提供 shuffleId、mapId、reduceId 才能确定一个中间数据:  
* shuffleId，表示此次shuffle的唯一id  
* mapId，表示map端 rdd 的分区索引，表示由哪个父分区产生的数据  
* reduceId，表示reduce端的分区索引，表示属于子分区的那部分数据  
  
MapOutputTracker在executor和driver端都存在:  
* MapOutputTrackerMaster 和 MapOutputTrackerMasterEndpoint(负责通信) 存在于driver  
* MapOutputTrackerWorker 存在于 executor 端  
* MapOutputTrackerMaster 负责管理所有 shuffleMapTask 的输出数据，每个 shuffleMapTask 执行完后会把 执行结果(MapStatus对象)注册到MapOutputTrackerMaster  
* MapOutputTrackerMaster 会处理 executor 发送的 GetMapOutputStatuses 请求，并返回 serializedMapStatus 给 executor 端  
* MapOutputTrackerWorker 负责为 reduce 任务提供 shuffleMapTask 的输出数据信息(MapStatus对象)  
* 如果MapOutputTrackerWorker在本地没有找到请求的 shuffle 的 mapStatus，则会向 MapOutputTrackerMasterEndpoint 发送 GetMapOutputStatuses 请求获取对应的 mapStatus

### Shuffle Reader

* Map Task 执行完毕后会将文件位置、计算状态等信息封装到 MapStatus 对象中，再由本进程中的 MapOutPutTrackerWorker 对象将其发送给Driver进程的 MapOutPutTrackerMaster对象  
* Reduce Task开始执行之前会先让本进程中的 MapOutputTrackerWorker 向 Driver 进程中的 MapOutputTrackerMaster 发动请求，获取磁盘文件位置等信息  
* 当所有的Map Task执行完毕后，Driver进程中的 MapOutputTrackerMaster 就掌握了所有的Shuffle文件的信 息。此时MapOutPutTrackerMaster会告诉MapOutPutTrackerWorker磁盘小文件的位置信息  
* 完成之前的操作之后，由 BlockTransforService 去 Executor 所在的节点拉数据，默认会启动五个子线程。每次 拉取的数据量不能超过48M

###  Hadoop Shuffle 与 Spark Shuffle 的区别

共同点:  
二者从功能上看是相似的;从High Level来看，没有本质区别，实现(细节)上有区别  
  
实现上的区别:  
* Hadoop中有一个Map完成，Reduce便可以去fetch数据了，不必等到所有Map任务完成;而Spark的必须等到 父stage完成，也就是父stage的 map 操作全部完成才能去fetch数据。这是因为spark必须等到父stage执行 完，才能执行子stage，主要是为了迎合stage规则   
* Hadoop的Shuffle是sort-base的，那么不管是Map的输出，还是Reduce的输出，都是partition内有序的，而 spark不要求这一点  
* Hadoop的Reduce要等到fetch完全部数据，才将数据传入reduce函数进行聚合，而 Spark是一边fetch一边聚合

### Shuffle优化

Spark作业的性能主要就是消耗了shuffle过程，因为该环节包含了众多低效的IO操作:磁盘IO、序列化、网络数据传输等;如果要让作业的性能更上一层楼，就有必要对 shuffle 过程进行调优。 但必须注意的是，影响Spark作业性能的因素，主要还是代码质量、资源参数以及数据倾斜，shuffle调优只能在整个Spark的性能调优中占到一小部分而已。  
  
开发过程中对 Shuffle 的优化:  
* 减少Shuffle过程中的数据量   
* 避免Shuffle  
  
 Shuffle 的参数优化:

- 调节 map 端缓冲区大小
  * spark.shuffle.file.buffer 默认值为32K，shuffle write阶段buffer缓冲大小。将数据写到磁盘文件之前，会先写 入buffer缓冲区，缓冲写满后才溢写到磁盘   
  * 调节map端缓冲的大小，避免频繁的磁盘IO操作，进而提升任务整体性能  
  * 合理设置参数，性能会有 1%~5% 的提升

- 调节 reduce 端拉取数据缓冲区大小
  * spark.reducer.maxSizeInFlight 默认值为48M。设置shuffle read阶段buffer缓冲区大小，这个buffer缓冲决定 了每次能够拉取多少数据  
  * 在内存资源充足的情况下，可适当增加参数的大小(如96m)，减少拉取数据的次数及网络传输次数，进而提 升性能  
  * 合理设置参数，性能会有 1%~5% 的提升

- 调节 reduce 端拉取数据重试次数及等待间隔
  * Shuffle read阶段拉取数据时，如果因为网络异常导致拉取失败，会自动进行重试   
  * spark.shuffle.io.maxRetries，默认值3。最大重试次数   
  * spark.shuffle.io.retryWait，默认值5s。每次重试拉取数据的等待间隔  
  * 一般调高最大重试次数，不调整时间间隔

- 调节 Sort Shuffle 排序操作阈值
  * 如果shuffle reduce task的数量小于阈值，则shuffle write过程中不会进行排序操作，而是直接按未经优化的 Hash Shuffle方式写数据，最后将每个task产生的所有临时磁盘文件都合并成一个文件，并创建单独的索引文件  
  * spark.shuffle.sort.bypassMergeThreshold，默认值为200  
  * 当使用SortShuffleManager时，如果的确不需要排序操作，建议将这个参数调大

- 调节 Shuffle 内存大小
  * Spark给 Shuffle 阶段分配了专门的内存区域，这部分内存称为执行内存  
  * 如果内存充足，而且很少使用持久化操作，建议调高这个比例，给 shuffle 聚合操作更多内存，以避免由于内存 不足导致聚合过程中频繁读写磁盘  
  * 合理调节该参数可以将性能提升10%左右

## 内存管理

在执行 Spark 的应用程序时，Spark 集群会启动 Driver 和 Executor 两种 JVM 进程:  
* Driver为主控进程，负责创建 Spark 上下文，提交 Spark 作业，将作业转化为 Task，并在各个 Executor 进程 间协调任务的调度  
* Executor负责在工作节点上执行具体的计算任务，并将结果返回给 Driver，同时为需要持久化的 RDD 提供存储功能  
  
Driver 的内存管理(缺省值 1G)相对来说较为简单，这里主要针对 Executor 的内存管理进行分析，下文中提到的 Spark 内存均特指 Executor 的内存。

### 堆内内存与堆外内存<br>
![](/resource/spark_theory/assets/7E77DC7D-2DC9-40B9-AB20-18F3AFA07430.png)

作为一个 JVM 进程，Executor 的内存管理建立在 JVM 的内存管理之上，Spark 对JVM 的堆内(On-heap)空间进行 了更为详细的分配，以充分利用内存。同时，Spark 引入了堆外(Off-heap)内存，使之可以直接在工作节点的系统 内存中开辟空间，进一步优化了内存的使用。  
  
堆内内存受到 JVM 统一管理，堆外内存是直接向操作系统进行内存的申请和释放。

- 堆内内存
  堆内内存的大小，由 Spark 应用程序启动时的 executor-memory 或 spark.executor.memory 参数配置。Executor内运行的并发任务共享 JVM 堆内内存。  
  * 缓存 RDD 数据和广播变量占用的内存被规划为存储内存  
  * 执行 Shuffle 时占用的内存被规划为执行内存  
  * Spark 内部的对象实例，或者用户定义的 Spark 应用程序中的对象实例，均占用剩余的空间  
    
  Spark 对堆内内存的管理是一种逻辑上 ”规划式” 的管理，因为对象实例占用内存的申请和释放都由 JVM 完成，Spark 只能在申请后和释放前记录这些内存。  
    
  虽然不能精准控制堆内内存的申请和释放，但 Spark 通过对存储内存和执行内存各自独立的规划管理，可以决定是 否要在存储内存里缓存新的 RDD，以及是否为新的任务分配执行内存，在一定程度上可以提升内存的利用率，减少异常的出现。

- 堆外内存
  为了进一步优化内存的使用以及提高 Shuffle 时排序的效率，Spark 引入了堆外(Off-heap)内存，使之可以直接在 工作节点的系统内存中开辟空间，存储经过序列化的二进制数据。  
  堆外内存意味着把内存对象分配在 Java 虚拟机的堆以外的内存，这些内存直接受操作系统管理。这样做的结果就是 能保持一个较小的堆，以减少垃圾收集对应用的影响。  
  利用 JDK Unsafe API，Spark 可以直接操作系统堆外内存，减少了不必要的内存开销，以及频繁的 GC 扫描和回收， 提升了处理性能。堆外内存可以被精确地申请和释放(堆外内存之所以能够被精确的申请和释放，是由于内存的申请 和释放不再通过 JVM 机制，而是直接向操作系统申请，JVM 对于内存的清理是无法准确指定时间点的，因此无法实 现精确的释放)，而且序列化的数据占用的空间可以被精确计算，所以相比堆内内存来说降低了管理的难度，也降低 了误差。  
    
  在默认情况下堆外内存并不启用，可通过配置 spark.memory.offHeap.enabled 参数启用，并由 spark.memory.offHeap.size 参数设定堆外空间的大小。除了没有 other 空间，堆外内存与堆内内存的划分方式相 同，所有运行中的并发任务共享 存储内存 和 执行内存 。

### 静态内存管理<br>
![](/resource/spark_theory/assets/D56AECE3-0BCF-46B2-BB83-859673FBCA0C.png)

Spark 2.0 以前版本采用静态内存管理机制。存储内存、执行内存和其他内存的大小在 Spark 应用程序运行期间均为固定的，但用户可以应用程序启动前进行配置，堆内内存的分配如上图所示。  
可用的存储内存 = systemMaxMemory * spark.storage.memoryFraction * spark.storage.safetyFraction  
可用的执行内存 = systemMaxMemory * spark.shuffle.memoryFraction * spark.shuffle.safetyFraction  
  
systemMaxMemory 为当前 JVM 堆内内存的大小  
  
这个预留的保险区域仅仅是一种逻辑上的规划，在具体使用时 Spark 并没有区别对待，和”其它内存”一样交给了 JVM 去管理。  
  
静态内存管理机制实现起来较为简单，但如果用户不熟悉 Spark 的存储机制，或没有根据具体的数据规模和计算任 务或做相应的配置，很容易造成”一半海水，一半火焰”的局面，即存储内存和执行内存中的一方剩余大量的空间，而 另一方却早早被占满，不得不淘汰或移出旧的内容以存储新的内容。由于新的内存管理机制的出现，这种方式目前已 经很少有开发者使用，出于兼容旧版本的应用程序的目的，Spark 仍然保留了它的实现。

- 堆外内存<br>
![](/resource/spark_theory/assets/4272C4A3-1871-4CBF-A6B3-47B59124706E.png)
  堆外内存分配较为简单，只有存储内存和执行内存。可用的执行内存和存储内存占用的空间大小直接由参数 spark.memory.storageFraction 决定。由于堆外内存占用的空间可以被精确计算，无需再设定保险区域。

### 统一内存管理<br>
![](/resource/spark_theory/assets/CBE14FAD-054C-4EFE-AF80-AFF432CE7FA9.png)

Spark 2.0 之后引入统一内存管理机制，与静态内存管理的区别在于存储内存和执行内存共享同一块空间，可以动态占用对方的空闲区域，统一内存管理的堆内内存结构如上图所示

- 堆外内存<br>
![](/resource/spark_theory/assets/03D20825-8C80-4F12-937E-2FAB5D25CE97.png)

- 动态占用机制<br>
![](/resource/spark_theory/assets/C0E944F9-069D-496C-B377-34BB3C61F920.png)
  其中最重要的优化在于动态占用机制，其规则如下:  
  * 设定基本的存储内存和执行内存区域(spark.storage.storageFraction 参数)，该设定确定了双方各自拥有的空间的范围   
  * 双方的空间都不足时，则存储到硬盘;若己方空间不足而对方空余时，可借用对方的空间;(存储空间不足是指 不足以放下一个完整的 Block)   
  * 执行内存的空间被对方占用后，可让对方将占用的部分转存到硬盘，然后”归还”借用的空间   
  * 存储内存的空间被对方占用后，无法让对方”归还”，因为需要考虑 Shuffle 过程中的很多因素，实现起来较为复杂  
    
  凭借统一内存管理机制，Spark 在一定程度上提高了堆内和堆外内存资源的利用率，降低了开发者维护 Spark 内存的 难度，但并不意味着开发者可以高枕无忧。如果存储内存的空间太大或者说缓存的数据过多，反而会导致频繁的全量 垃圾回收，降低任务执行时的性能，因为缓存的 RDD 数据通常都是长期驻留内存的。所以要想充分发挥 Spark 的性 能，需要开发者进一步了解存储内存和执行内存各自的管理方式和实现原理。

### 存储内存管理

RDD缓存的数据 & 共享变量

- RDD 持久化机制
  RDD作为 Spark 最根本的数据抽象，是只读的分区记录的集合，只能基于在稳定物理存储中的数据集上创建，或者 在其他已有的 RDD 上执行转换操作产生一个新的 RDD。转换后的 RDD 与原始的 RDD 之间产生的依赖关系。凭借 Lineage，Spark保证了每一个 RDD 都可以被重新恢复。但 RDD 的所有转换都是惰性的，即只有当一个返回结果给 Driver 的Action发生时，Spark 才会创建任务读取 RDD，然后真正触发转换的执行。  
    
  Task 在启动之初读取一个分区时:  
  * 先判断这个分区是否已经被持久化  
  * 如果没有则需要检查 Checkpoint 或按照血统重新计算。如果一个 RDD 上要执行多次Action，可以在第一次行 动中使用 persist 或 cache 方法，在内存或磁盘中持久化或缓存这个 RDD，从而在执行后面的Action时提升计 算速度。  
    
  RDD 的持久化由 Spark 的 Storage【BlockManager】 模块负责，实现了 RDD 与物理存储的解耦合。Storage 模块 负责管理 Spark 在计算过程中产生的数据，将那些在内存或磁盘、在本地或远程存取数据的功能封装了起来。在具 体实现时Driver 端和 Executor 端 的 Storage 模块构成了主从式架构，即 Driver 端 的 BlockManager 为Master， Executor 端的 BlockManager 为 Slave。  
    
  Storage 模块在逻辑上以 Block 为基本存储单位，RDD 的每个Partition 经过处理后唯一对应一个Block。Driver 端 的 Master 负责整个 Spark 应用程序的 Block 的元数据信息的管理和维护，而 Executor 端的 Slave 需要将 Block 的 更新等状态上报到 Master，同时接收Master 的命令，如新增或删除一个 RDD。  
    
  在对 RDD 持久化时，Spark 规定了 MEMORY_ONLY、MEMORY_AND_DISK 等存储级别 ，这些存储级别是以下 5 个变量的组合  
    
  存储级别从三个维度定义了 RDD Partition 的存储方式:  
  * 存储位置:磁盘/堆内内存/堆外内存   
  * 存储形式:序列化方式 / 反序列化方式   
  * 副本数量:1份 / 2份

- RDD 缓存过程<br>
![](/resource/spark_theory/assets/9533A2C9-A766-4D79-93EE-009D8EE6A292.png)
  ```shell  
  File => RDD1 => RDD2 =====> RDD3 => RDD4 =====> RDD5 => Action   
  RDD缓存的源头:Other (Iterator / 内存空间不连续)   
  RDD缓存的目的地:存储内存(内存空间连续)  
  ```  
    
  RDD 在缓存到存储内存之前，Partition 中的数据一般以迭代器(Iterator)的数据结构来访问，这是 Scala 语言中一 种遍历数据集合的方法。通过 Iterator 可以获取分区中每一条序列化或者非序列化的数据项(Record)，这些 Record 的对象实例在逻辑上占用了 JVM 堆内内存的 other 部分的空间，同一 Partition 的不同 Record 的存储空间并不连 续。  
    
  RDD 在缓存到存储内存之后，Partition 被转换成 Block，Record 在堆内或堆外存储内存中占用一块连续的空间。将 Partition 由不连续的存储空间转换为连续存储空间的过程，Spark 称之为**展开(Unroll)**。  
    
  Block 有序列化和非序列化两种存储格式，具体以哪种方式取决于该 RDD 的存储级别:  
  * 非序列化的 Block 以 DeserializedMemoryEntry 的数据结构定义，用一个数组存储所有的对象实例   
  * 序列化的 Block 以 SerializedMemoryEntry 的数据结构定义，用字节缓冲区(ByteBuffer)存储二进制数据  
    
  因为不能保证存储空间可以一次容纳 Iterator 中的所有数据，当前的计算任务在 Unroll 时要向 MemoryManager 申请足够的 Unroll 空间来临时占位，空间不足则 Unroll 失败，空间足够时可以继续进行。  
  * 序列化的 Partition，其所需的 Unroll 空间可以直接累加计算，一次申请  
  * 非序列化的 Partition 则要在遍历 Record 的过程中依次申请，即每读取一条 Record，采样估算其所需的 Unroll 空间并进行申请，空间不足时可以中断，释放已占用的 Unroll 空间  
  * 如果最终 Unroll 成功，当前 Partition 所占用的 Unroll 空间被转换为正常的缓存 RDD 的存储空间  
    
  在静态内存管理时，Spark 在存储内存中专门划分了一块 Unroll 空间，其大小是固定的，统一内存管理时则没有对 Unroll 空间进行特别区分，当存储空间不足时会根据动态占用机制进行处理。

- 淘汰与落盘
  由于同一个 Executor 的所有的计算任务共享有限的存储内存空间，当有新的 Block 需要缓存但是剩余空间不足且无 法动态占用时，就要对 LinkedHashMap 中的旧 Block 进行淘汰(Eviction)，而被淘汰的 Block 如果其存储级别中 同时包含存储到磁盘的要求，则要对其进行落盘(Drop)，否则直接删除该 Block。  
    
  ```shell  
   Memory_And_Disk  =>  cache  =>  Memory  
  淘汰:从内存空间中清除   
  落盘:将存储内存中的数据(RDD缓存的数据)写到磁盘上  
  ```  
    
  存储内存的淘汰规则为:  
  * 被淘汰的旧 Block 要与新 Block 的 MemoryMode 相同，即同属于堆外或堆内内存  
  * 新旧 Block 不能属于同一个 RDD，避免循环淘汰  
  * 旧 Block 所属 RDD 不能处于被读状态，避免引发一致性问题  
  * 遍历 LinkedHashMap 中 Block，按照最近最少使用(LRU)的顺序淘汰，直到满足新 Block 所需的空间。其中 LRU 是 LinkedHashMap 的特性。  
    
  落盘的流程则比较简单，如果其存储级别符合 _useDisk 为 true 的条件，再根据其 _deserialized 判断是否是非序列化的形式，若是则对其进行序列化，最后将数据存储到磁盘，在 Storage 模块中更新其信息。

### 执行内存管理

执行内存主要用来存储任务在执行 Shuffle 时占用的内存，Shuffle 是按照一定规则对 RDD 数据重新分区的过程， Shuffle 的 Write 和 Read 两阶段对执行内存的使用:  
**Shuffle Write**  
	* 在 map 端会采用 ExternalSorter 进行外排，在内存中存储数据时主要占用堆内执行空间。  
**Shuffle Read**  
	* 在对 reduce 端的数据进行聚合时，要将数据交给 Aggregator 处理，在内存中存储数据时占用堆内执行空间  
	* 如果需要进行最终结果排序，则要将再次将数据交给 ExternalSorter 处理，占用堆内执行空间  
  
在 ExternalSorter 和 Aggregator 中，Spark 会使用一种叫 AppendOnlyMap 的哈希表在堆内执行内存中存储数 据，但在 Shuffle 过程中所有数据并不能都保存到该哈希表中，当这个哈希表占用的内存会进行周期性地采样估算， 当其大到一定程度，无法再从 MemoryManager 申请到新的执行内存时，Spark 就会将其全部内容存储到磁盘文件 中，这个过程被称为溢存(Spill)，溢存到磁盘的文件最后会被归并。  
  
Spark 的存储内存和执行内存有着截然不同的管理方式:  
* 对存储内存来说，Spark 用一个 LinkedHashMap 来集中管理所有的 Block，Block 由需要缓存的 RDD 的 Partition 转化而成;  
* 对执行内存来说，Spark 用 AppendOnlyMap 来存储 Shuffle 过程中的数据，在 Tungsten 排序中甚至抽象成 为页式内存管理，开辟了全新的 JVM 内存管理机制。

## BlockManager<br>
![](/resource/spark_theory/assets/2D8D9DC1-A73E-4135-988F-077480FAE823.png)

BlockManager是一个嵌入在 Spark 中的 key-value型分布式存储系统，也是 Master-Slave 结构的，RDD-cache、shuffle-output、broadcast 等的实现都是基于BlockManager来实现的:  
* shuffle 的过程中使用 BlockManager 作为数据的中转站  
* 将广播变量发送到 Executor 时， broadcast 底层使用的数据存储层  
* spark streaming 一个 ReceiverInputDStream 接收到的数据，先放在 BlockManager 中， 然后封装为一个 BlockRdd 进行下一步运算  
* 如果对一个 RDD 进行了cache，CacheManager 也是把数据放在了 BlockManager 中， 后续 Task 运行的时候 可以直接从 CacheManager 中获取到缓存的数据 ，不用再从头计算  
  
BlockManager也是分布式结构，在Driver和所有Executor上都会有BlockManager。每个节点上存储的block信息都 会汇报给Driver端的BlockManager Master作统一管理，BlockManager对外提供get和set数据接口，可将数据存储 在Memory、Disk、Off-heap。

### BlockManager Master

Driver的组件为BlockManager Master，负责:  
* 各节点上BlockManager内部管理数据的元数据进行维护，如 block 的增、删、改、查等操作  
* 只要 BlockManager 执行了数据增、删、改操作，那么必须将 Block 的 BlockStatus 上报到BlockManager Master，BlockManager Master会对元数据进行维护

### BlockManager

每个节点都有一个 BlockManager，每个 BlockManager 创建之后，第一件事就是去向 BlockManager Master 进行 注册，此时 BlockManager Master 会为其创建对应的 BlockManagerInfo。  
  
BlockManager运行在所有的节点上，包括所有 Driver 和 Executor 上:  
* BlockManager对本地和远程提供一致的 get 和 set 数据块接口，BlockManager本身使用不同的存储方式来存储这些数据，包括memory、disk、off-heap  
* BlockManager负责Spark底层数据存储与管理，Driver和Executor的所有数据都由对应的BlockManager进行管理  
* BlockManager创建后，立即向 BlockManager Master进行注册，此时BlockManager Master会为其创建对应 的BlockManagerInfo  
* BlockManager中有3个非常重要的组件:  
	* DiskStore:负责对磁盘数据进行读写  
	* MemoryStore:负责对内存数据进行读写   
	* BlockTransferService:负责建立到远程其他节点BlockManager的连接，负责对远程其他节点的 BlockManager的数据进行读写  
* 使用BlockManager进行写操作时，如RDD运行过程中的中间数据，或者执行persist操作，会优先将数据写入 内存中。如果内存大小不够，将内存中的部分数据写入磁盘;如果persist指定了要replica，会使用 BlockTransferService将数据复制一份到其他节点的BlockManager上去  
* 使用 BlockManager 进行读操作时，如 Shuffle Read 操作，如果能从本地读取，就利用 DiskStore 或 MemoryStore 从本地读取数据;如果本地没有数据，就利用 BlockTransferService 从远程 BlockManager 读 取数据

## 数据倾斜

### 基本概念<br>
![](/resource/spark_theory/assets/8F882FF4-10AD-4D76-BE71-4023596DFBB0.png)

**什么是数据倾斜**? Task之间数据分配的非常不均匀  
  
**数据倾斜有哪些现象**  
* Executor lost、OOM、Shuffle过程出错、程序执行慢  
* 单个Executor执行时间特别久，整体任务卡在某个阶段不能结束  
* 正常运行的任务突然失败大多数 Task 运行正常，个别Task运行缓慢或发生OOM  
  
**数据倾斜造成的危害有哪些**  
* 个别任务耗时远高于其它任务，轻则造成系统资源的浪费，使整体应用耗时过大，不能充分发挥分布式系统并 行计算的优势  
* 个别Task发生OOM，导致整体作业运行失败  
  
**为什么会发生数据倾斜**  
* 数据异常: 参与计算的 key 有大量空值(null)，这些空值被分配到同一分区  
* Map Task数据倾斜，主要是数据源导致的数据倾斜:  
	* 数据文件压缩格式(压缩格式不可切分)  
	* Kafka数据分区不均匀  
* Reduce task数据倾斜(重灾区，最常见):  
	* Shuffle (外因)。Shuffle操作涉及到大量的磁盘、网络IO，对作业性能影响极大  
	* Key分布不均 (内因)  
  
**如何定位发生数据倾斜**  
凭借经验或Web UI，找到对应的Stage;再找到对应的 Shuffle 算子

### 数据倾斜处理

**做好数据预处理**:  
* 过滤key中的空值   
* 消除数据源带来的数据倾斜(文件采用可切分的压缩方式)  
  
**数据倾斜产生的主要原因**:Shuffle + key分布不均  
  
**处理数据倾斜的基本思路**:  
* 消除shuffle  
* 减少shuffle过程中传输的数据   
* 选择新的可用于聚合或join的Key(结合业务)   
* 重新定义分区数  
* 加盐强行打散Key

- 避免shuffle
  使用Map端的join是典型的解决方案；可以完全消除Shuffle，进而解决数据倾斜；有很强的适用场景(大表和小表关联)，典型的大表与小表的join，其他场景不合适

- 减少 Shuffle 过程中传输的数据
  * 使用高性能算子，避免使用groupByKey，用reduceByKey或aggregateByKey替代  
  * 没有从根本上解决数据分配不均的问题，收效有限，使用场景有限

- 选择新的可用于聚合或join的Key
  * 从业务出发，使用新的key去做聚合或join。如当前key是【省 城市 日期】，在业务允许的情况下选择新的 key【省 城市 区 日期】，有可能 解决或改善 数据倾斜问题  
  * 存在的问题:这样的key不好找;或者找到了新的key也不能解决问题

- 改变Reduce的并行度
  ```shell  
  key.hashCode % reduce个数 = 分区号  
  ```  
    
  * 变更 reduce 的并行度。理论上分区数从 N 变为 N-1 有可能解决或改善数据倾斜  
  * 一般情况下这个方法不管用，数据倾斜可能是由很多key造成的，但是建议试试因为这个方法非常简单，成本极低  
  * 可能只是解决了这一次的数据倾斜问题，非长远之计  
  * 缺点:适用性不广;优点:简单

- 加盐强行打散Key
  shuffle + key不能分散

	- 两阶段聚合<br>
![](/resource/spark_theory/assets/A8B5344B-CF79-42D5-A6E0-A7636EC7DCBC.png)
	  * 加盐打散key。给每个key都加一个随机数，如10以内的随机数。此时key就被打散了   
	  * 局部聚合。对打上随机数的数据，执行一次聚合操作，得到结果   
	  * 全局聚合。将各个key的前缀去掉，再进行一次聚合操作，得到最终结果  
	    
	  两阶段聚合的优缺点:  
	  * 对于聚合类的shuffle操作导致的数据倾斜，效果不错。通常都可以解决掉数据倾斜，至少是大幅度缓解数据倾斜，将Spark作业的性能提升数倍以上   
	  * 仅适用于聚合类的shuffle操作，适用范围相对较窄。如果是join类的shuffle操作，还得用其他的解决方案

	- 采样倾斜key并拆分join操作<br>
![](/resource/spark_theory/assets/35827493-65C3-415F-9526-CF87CF5AE004.png)
	  **业务场景**:两个RDD/两张表进行 join 的时候，数据量都比较大。  
	  **使用场景**:计算两个RDD/两张表中的key分布情况。如果出现数据倾斜，是其中一个RDD/Hive表中的少数几个key的 数据量过大，而另一个RDD/Hive表中的所有key都分布比较均匀，那么采用这个解决方案比较合适。  
	  **处理步骤**:  
	  1、对包含少数几个数据量过大的key的那个RDD，通过sample算子采样出一份样本来，然后统计一下每个key的数 量，计算出数据量最大的是哪几个key;  
	  2、将这几个key对应的数据从原来的RDD中拆分出来，形成一个单独的RDD，并给每个key都打上n以内的随机数作 为前缀，而不会导致倾斜的大部分key形成另外一个RDD;  
	  3、将需要join的另一个RDD，也过滤出来那几个倾斜key对应的数据并形成一个单独的RDD，将每条数据膨胀成n条 数据，这n条数据都按顺序附加一个0~n的前缀，不会导致倾斜的大部分key也形成另外一个RDD;  
	  4、再将附加了随机前缀的独立RDD与另一个膨胀n倍的独立RDD进行join，此时就可以将原先相同的key打散成n 份，分散到多个task中去进行join了;  
	  5、另外两个普通的RDD就照常join即可;  
	  6、最后将两次join的结果使用union算子合并起来即可，就是最终的join结果。

	- 使用随机前缀和扩容再进行join<br>
![](/resource/spark_theory/assets/3ED7E758-D551-4D16-91E3-31EE64D116BC.png)
	  **业务场景**:如果在进行join操作时，RDD中有大量的key导致数据倾斜，进行分拆key没什么意义，此时就只能使用最后一种方案来解决问题了。  
	  **处理步骤**:  
	  1、选一个RDD，将每条数据都打上一个n以内的随机前缀(打散)   
	  2、对另外一个RDD进行扩容，将每条数据都扩容成n条数据，扩容出来的每条数据都依次打上一个0~n的前缀   
	  3、将两个处理后的RDD进行join即可  
	    
	  **优缺点**:  
	  * 如果两个RDD都很大，那么将RDD进行N倍的扩容显然行不通   
	  * 使用扩容的方式通常能缓解数据倾斜，不能彻底解决数据倾斜问题

## Spark优化

### 编码的优化

- RDD复用
  避免创建重复的RDD。在开发过程中要注意:对于同一份数据，只应该创建一个RDD，不要创建多个RDD来代表同 一份数据。

- RDD缓存/持久化
  * 当多次对同一个RDD执行算子操作时，每一次都会对这个RDD以之前的父RDD重新计算一次，这种情况是必须 要避免的，对同一个RDD的重复计算是对资源的极大浪费  
  * 对多次使用的RDD进行持久化，通过持久化将公共RDD的数据缓存到内存/磁盘中，之后对于公共RDD的计算都 会从内存/磁盘中直接获取RDD数据  
  * RDD的持久化是可以进行序列化的，当内存无法将RDD的数据完整的进行存放的时候，可以考虑使用序列化的 方式减小数据体积，将数据完整存储在内存中

- 巧用 filter
  * 尽可能早的执行filter操作，过滤无用数据  
  * 在filter过滤掉较多数据后，使用 coalesce 对数据进行重分区

- 使用高性能算子
  1、避免使用groupByKey，根据场景选择使用高性能的聚合算子 reduceByKey、aggregateByKey 2、coalesce、repartition，选择没有shuffle的操作  
  3、foreachPartition 优化输出操作  
  4、map、mapPartitions，选择合理的选择算子   
  mapPartitions性能更好，但数据量大时容易导致OOM  
  5、用 repartitionAndSortWithinPartitions 替代 repartition + sort 操作  
  6、合理使用 cache、persist、checkpoint，选择合理的数据存储级别  
  7、filter的使用  
  8、减少对数据源的扫描(算法复杂了)

- 设置合理的并行度
  * Spark作业中的并行度指各个stage的task的数量  
  * 设置合理的并行度，让并行度与资源相匹配。简单来说就是在资源允许的前提下，并行度要设置的尽可能大， 达到可以充分利用集群资源。合理的设置并行度，可以提升整个Spark作业的性能和运行速度

- 广播大变量
  * 默认情况下，task中的算子中如果使用了外部变量，每个task都会获取一份变量的复本，这会造多余的网络传输和内存消耗  
  * 使用广播变量，只会在每个Executor保存一个副本，Executor的所有task共用此广播变量，这样就节约了网络及内存资源

- Kryo序列化
  * 默认情况下，Spark使用Java的序列化机制。Java的序列化机制使用方便，不需要额外的配置。但Java序列化机 制效率不高，序列化速度慢而且序列化后的数据占用的空间大  
  * Kryo序列化机制比Java序列化机制性能提高10倍左右。Spark之所以没有默认使用Kryo作为序列化类库，是它 不支持所有对象的序列化，同时Kryo需要用户在使用前注册需要序列化的类型，不够方便。从Spark 2.0开始， 简单类型、简单类型数组、字符串类型的 Shuffling RDDs 已经默认使用 Kryo 序列化方式

- 多使用Spark SQL
  * Spark SQL 编码更容易，开发更简单  
  * Spark的优化器对SQL语句做了大量的优化，一般情况下实现同样的功能，Spark SQL更容易也更高效

- 优化数据结构
  Spark中有三种类型比较消耗内存:  
  * 对象。每个Java对象都有对象头、引用等额外的信息，占用了额外的内存空间   
  * 字符串。每个字符串内部都有一个字符数组以及长度等额外信息   
  * 集合类型。如HashMap、LinkedList等，集合类型内部通常会使用一些内部类来封装集合元素  
    
  Spark官方建议，在编码实现中，特别是对于算子函数中的代码，尽量不要使用上述三种数据结构。尽量使用字符串 替代对象，使用原始类型(比如Int、Long)替代字符串，使用数组替代集合类型，尽可能地减少内存占用，从而降 低GC频率，提升性能。

- 使用高性能库
  * fastutil是扩展了Java标准集合框架 (Map、List、Set;HashMap、ArrayList、HashSet) 的类库，提供了特殊类 型的map、set、list和queue  
  * fastutil能够提供更小的内存占用、更快的存取速度;可使用fastutil提供的集合类，来替代JDK原生的Map、 List、Set。好处在于使用fastutil集合类，可以减小内存占用，在进行集合操作时，提供更快的存取速度

### 参数优化

- Shuffle优化
  Spark作业的性能主要就是消耗了shuffle过程，因为该环节包含了众多低效的IO操作:磁盘IO、序列化、网络数据传输等;如果要让作业的性能更上一层楼，就有必要对 shuffle 过程进行调优。 但必须注意的是，影响Spark作业性能的因素，主要还是代码质量、资源参数以及数据倾斜，shuffle调优只能在整个Spark的性能调优中占到一小部分而已。  
    
  开发过程中对 Shuffle 的优化:  
  * 减少Shuffle过程中的数据量   
  * 避免Shuffle  
    
   Shuffle 的参数优化:

	- 调节 map 端缓冲区大小
	  * spark.shuffle.file.buffer 默认值为32K，shuffle write阶段buffer缓冲大小。将数据写到磁盘文件之前，会先写 入buffer缓冲区，缓冲写满后才溢写到磁盘   
	  * 调节map端缓冲的大小，避免频繁的磁盘IO操作，进而提升任务整体性能  
	  * 合理设置参数，性能会有 1%~5% 的提升

	- 调节 reduce 端拉取数据缓冲区大小
	  * spark.reducer.maxSizeInFlight 默认值为48M。设置shuffle read阶段buffer缓冲区大小，这个buffer缓冲决定 了每次能够拉取多少数据  
	  * 在内存资源充足的情况下，可适当增加参数的大小(如96m)，减少拉取数据的次数及网络传输次数，进而提 升性能  
	  * 合理设置参数，性能会有 1%~5% 的提升

	- 调节 reduce 端拉取数据重试次数及等待间隔
	  * Shuffle read阶段拉取数据时，如果因为网络异常导致拉取失败，会自动进行重试   
	  * spark.shuffle.io.maxRetries，默认值3。最大重试次数   
	  * spark.shuffle.io.retryWait，默认值5s。每次重试拉取数据的等待间隔  
	  * 一般调高最大重试次数，不调整时间间隔

	- 调节 Sort Shuffle 排序操作阈值
	  * 如果shuffle reduce task的数量小于阈值，则shuffle write过程中不会进行排序操作，而是直接按未经优化的 Hash Shuffle方式写数据，最后将每个task产生的所有临时磁盘文件都合并成一个文件，并创建单独的索引文件  
	  * spark.shuffle.sort.bypassMergeThreshold，默认值为200  
	  * 当使用SortShuffleManager时，如果的确不需要排序操作，建议将这个参数调大

	- 调节 Shuffle 内存大小
	  * Spark给 Shuffle 阶段分配了专门的内存区域，这部分内存称为执行内存  
	  * 如果内存充足，而且很少使用持久化操作，建议调高这个比例，给 shuffle 聚合操作更多内存，以避免由于内存 不足导致聚合过程中频繁读写磁盘  
	  * 合理调节该参数可以将性能提升10%左右

- 内存调优

- 资源优化

- 动态资源分配
  动态资源分配(DRA，dynamic resource allocation)  
  * 默认情况下，Spark采用资源预分配的方式。即为每个Spark应用设定一个最大可用资源总量，该应用在整个生 命周期内都会持有这些资源  
  * Spark提供了一种机制，使它可以根据工作负载动态调整应用程序占用的资源。这意味着，不使用的资源，应用 程序会将资源返回给集群，并在稍后需要时再次请求资源。如果多个应用程序共享Spark集群中的资源，该特性 尤为有用  
  * 动态的资源分配是 executor 级  
  * 默认情况下禁用此功能，并在所有粗粒度集群管理器上可用(CDH发行版中默认为true)  
  * 在Spark On Yarn模式下使用:  
  	* num-executors指定app使用executors数量  
  	* executor-memory、executor-cores指定每个executor所使用的内存、cores  
    
  **动态申请executor**:  
  * 如果有新任务处于等待状态，并且等待时间超过Spark.dynamicAllocation.schedulerBacklogTimeout(默认 1s)，则会依次启动executor，每次启动1、2、4、8...个executor(如果有的话)。启动的间隔由 spark.dynamicAllocation.sustainedSchedulerBacklogTimeout 控制 (默认与schedulerBacklogTimeout相同)  
  **动态移除executor**:  
  * executor空闲时间超过 spark.dynamicAllocation.executorIdleTimeout 设置的值(默认60s)，该executor会被移除，除非有缓存数据  
    
  **相关参数**:  
  * spark.dynamicAllocation.enabled = true   
  * Standalone模式:spark.shuffle.service.enabled = true  
  * Yarn模式:《Running Spark on YARN》-- Configuring the External Shuffle Service  
  * spark.dynamicAllocation.executorIdleTimeout(默认60s)。Executor闲置了超过此持续时间，将被删除  
  * spark.dynamicAllocation.cachedExecutorIdleTimeout(默认infinity)。已缓存数据块的 Executor 闲置了超 过此持续时间，则该执行器将被删除  
  * spark.dynamicAllocation.initialExecutors(默认spark.dynamicAllocation.minExecutors)。初始分配 Executor 的个数。如果设置了--num-executors(或spark.executor.instances)并且大于此值，该参数将作为 Executor 初始的个数  
  * spark.dynamicAllocation.maxExecutors(默认infinity)。Executor 数量的上限  
  * spark.dynamicAllocation.minExecutors(默认0)。Executor 数量的下限  
  * spark.dynamicAllocation.schedulerBacklogTimeout(默认1s)。任务等待时间超过了此期限，则将请求新的 Executor

- 调节本地等待时长
  * Spark总是倾向于让所有任务都具有最佳的数据本地性。遵循移动计算不移动数据的思想，Spark希望task能够  
    运行在它要计算的数据所在的节点上，这样可以避免数据的网络传输  
  **PROCESS_LOCAL > NODE_LOCAL > NO_PREF > RACK_LOCAL > ANY**  
  * 在某些情况下，可能会出现一些空闲的executor没有待处理的数据，那么Spark可能就会牺牲一些数据本地  
  * 如果对应节点资源用尽，Spark会等待一段时间(默认3s)。如果等待指定时间后仍无法在该节点运行，那么自动 降级，尝试将task分配到比较差的本地化级别所对应的节点上;如果当前级别仍然不行，那么继续降级  
  * 调节本地等待时长。如果在等待时间内，目标节点处理完成了一部分 Task，那么等待运行的 Task 将有机会得到 执行，获得较好的数据本地性，提高 Spark 作业整体性能  
  *   根据数据本地性不同，等待的时间间隔也不一致，不同数据本地性的等待时间设置参数  
  	* spark.locality.wait:设置所有级别的数据本地性，默认是3000毫秒   
  	* spark.locality.wait.process:多长时间等不到PROCESS_LOCAL就降级，默认为${spark.locality.wait} 	  
  	* spark.locality.wait.node:多长时间等不到NODE_LOCAL就降级，默认为${spark.locality.wait} 	  
  	* spark.locality.wait.rack:多长时间等不到RACK_LOCAL就降级，默认为${spark.locality.wait}

- 调节连接等待时长
  在Spark作业运行过程中，Executor优先从自己本地关联的BlockManager中获取某份数据，如果本地BlockManager  
  没有的话，会通过 TransferService 远程连接其他节点上Executor的BlockManager来获取数据;  
    
  在生产环境下，有时会遇到file not found、file lost这类错误。这些错误很有可能是 Executor 的 BlockManager 在 拉取数据的时候，无法建立连接，然后超过默认的连接等待时长后，宣告数据拉取失败。如果反复尝试都拉取不到数 据，可能会导致Spark作业的崩溃。这种情况也可能会导致 DAGScheduler 反复提交几次stage，TaskScheduler返回 提交几次task，延长了Spark作业的运行时间;  
    
  此时，可以考虑调节连接的超时时长，设置:spark.core.connection.ack.wait.timeout = 300s (缺省值120s) 调节连接等待时长后，通常可以避免部分的文件拉取失败、文件丢失等报错。

