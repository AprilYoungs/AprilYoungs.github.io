---
layout: post
title:  "Spark Streaming"
date:   2021-4-13
categories: big data
---

官网: http://spark.apache.org/streaming/


## Spark Streaming概述<br>
![](/resource/spark_streaming/assets/6297E56F-1CAA-4894-9940-F18E03E0AC94.png)

### 什么是Spark Streaming<br>
![](/resource/spark_streaming/assets/CF1A041B-1F89-446E-93D5-5A0C6B2BD7CE.png)

Spark Streaming类似于Apache Storm(来一条数据处理一条，延迟低，响应快，低吞吐量)，用于流式数据的处理;  
Spark Streaming具有有高吞吐量和容错能力强等特点;  
Spark Streaming支持的数据输入源很多，例如:Kafka(最重要的数据源)、 Flume、Twitter 和 TCP socket等;  
数据输入后可用高度抽象API，如:map、reduce、join、window等进行运算;  
处理结果能保存在很多地方，如HDFS、数据库等;  
Spark Streaming 能与 MLlib 以及 Graphx 融合。  
Spark Streaming 与 Spark 基于 RDD 的概念比较类似;  
**Spark Streaming使用离散化流(Discretized Stream)作为抽象表示，称为DStream。**  
**DStream是随时间推移而收到的数据的序列。在内部，每个时间区间收到的数据都作为 RDD 存在，DStream 是由这些 RDD 所组成的序列。**  
DStream 可以从各种输入源创建，比如 Flume、Kafka 或者 HDFS。创建出来的 DStream 支持两种操作:  
* 转化操作，会生成一个新的DStream   
* 输出操作(output operation)，把数据写入外部系统中  
DStream 提供了许多与 RDD 所支持的操作相类似的操作支持，还增加了与时间相关 的新操作，比如滑动窗口。

### Spark Streaming架构<br>
![](/resource/spark_streaming/assets/15EF02FB-7818-4A26-8DDC-072A87F58B5E.png)

Spark Streaming使用 mini-batch 的架构，把流式计算当作一系列连续的小规模批处理来对待。(伪流式处理)  
Spark Streaming从各种输入源中读取数据，并把数据分组为小的批次。新的批次按均匀的时间间隔创建出来。

- DStream<br>
![](/resource/spark_streaming/assets/5738FDC1-D33E-41D8-AA20-5B6A1EA8D7BA.png)
  Spark Streaming的编程抽象是离散化流，也就是DStream。它是一个 RDD 序列， 每个RDD代表数据流中一个时间片内的数据。  
  应用于 DStream 上的转换操作都会转换为底层RDD上的操作。如对行 DStream 中 的每个RDD应用flatMap操作以生成单词 DStream 的RDD。  
  这些底层的RDD转换是由Spark引擎完成的。DStream操作隐藏了大部分这些细节， 为开发人员提供了更高级别的API以方便使用。

- Spark Streaming 运行流程<br>
![](/resource/spark_streaming/assets/BABB573B-8FD4-40B9-A9BB-795E04FF098F.png)
  Spark Streaming为每个输入源启动对应的接收器。接收器运行在Executor中，从输 入源收集数据并保存为 RDD  
  默认情况下接收到的数据后会复制到另一个Executor中，进行容错;  
  Driver 中的 StreamingContext 会周期性地运行 Spark 作业来处理这些数据。  
    
  具体流程：  
  1、客户端提交Spark Streaming作业后启动Driver，Driver启动Receiver，Receiver接收数据源的数据  
  2、每个作业包含多个Executor，每个Executor以线程的方式运行task，Spark Streaming至少包含一个receiver task(一般情况下)  
  3、Receiver接收数据后生成Block，并把BlockId汇报给Driver，然后备份到另外一个 Executor 上  
  4、ReceiverTracker维护 Reciver 汇报的BlockId  
  5、Driver定时启动JobGenerator，根据Dstream的关系生成逻辑RDD，然后创建 Jobset，交给JobScheduler  
  6、JobScheduler负责调度Jobset，交给DAGScheduler，DAGScheduler根据逻辑 RDD，生成相应的Stages，每个stage包含一到多个Task，将TaskSet提交给 TaskScheduler  
  7、TaskScheduler负责把 Task 调度到 Executor 上，并维护 Task 的运行状态

### Spark Streaming 优缺点

与传统流式框架相比，Spark Streaming 最大的不同点在于它对待数据是粗粒度的处 理方式，即一次处理一小批数据，而其他框架往往采用细粒度的处理模式，即依次处 理一条数据。Spark Streaming 这样的设计实现既为其带来了显而易见的优点，又引 入了不可避免的缺点。

- 优点
  * Spark Streaming 内部的实现和调度方式高度依赖 Spark 的 DAG 调度器和 RDD，这就决定了 Spark Streaming 的设计初衷必须是粗粒度方式的。同时， 由于 Spark 内部调度器足够快速和高效，可以快速地处理小批量数据，这就获得 准实时的特性  
  * Spark Streaming 的粗粒度执行方式使其确保 ”处理且仅处理一次” 的特性 (EOS)，同时也可以更方便地实现容错恢复机制  
  * 由于 Spark Streaming 的 DStream 本质是 RDD 在流式数据上的抽象，因此基 于 RDD 的各种操作也有相应的基于 DStream 的版本，这样就大大降低了用户 对于新框架的学习成本，在了解 Spark 的情况下用户将很容易使用 Spark Streaming  
  * 由于 DStream 是在 RDD 上的抽象，那么也就更容易与 RDD 进行交互操作，在 需要将流式数据和批处理数据结合进行分析的情况下，将会变得非常方便

- 缺点
  Spark Streaming 的粗粒度处理方式也造成了不可避免的延迟。在细粒度处理方 式下，理想情况下每一条记录都会被实时处理，而在 Spark Streaming 中，数 据需要汇总到一定的量后再一次性处理，这就**增加了数据处理的延迟**，这种延迟是由框架的设计引入的，并不是由网络或其他情况造成的

## DStream基础数据源<br>
![](/resource/spark_streaming/assets/E417A684-3F9A-46FF-A4A8-730FB61A1215.png)

基础数据源包括:文件数据流、socket数据流、RDD队列流;这些数据源主要用于测试。  
  
引入依赖：  
  
```xml  
<dependency>  
    <groupId>org.apache.spark</groupId>  
    <artifactId>spark-streaming_2.12</artifactId>  
    <version>${spark.version}</version>  
</dependency>  
```

### 文件数据流

文件数据流:通过 textFileStream(directory) 方法进行读取 HDFS 兼容的文件系统文件  
  
Spark Streaming 将会监控 directory 目录，并不断处理移动进来的文件  
* 不支持嵌套目录  
* 文件需要有相同的数据格式  
* 文件进入 directory 的方式需要通过移动或者重命名来实现   
* 一旦文件移动进目录，则不能再修改，即便修改了也不会读取新数据  
* 文件流不需要接收器(receiver)，不需要单独分配CPU核  
  
```scala  
import org.apache.log4j.{Level, Logger}  
import org.apache.spark.SparkConf  
import org.apache.spark.streaming.dstream.DStream  
import org.apache.spark.streaming.{Seconds, StreamingContext}  
  
object FileDStream {  
  def main(args: Array[String]): Unit = {  
    Logger.getLogger("org").setLevel(Level.WARN)  
  
    val conf: SparkConf = new SparkConf()  
      .setAppName(this.getClass.getCanonicalName.init)  
      .setMaster("local[*]")  
  
  
    val ssc = new StreamingContext(conf, Seconds(10))  
  
    // 1. create DStream  
    // 只会读取新创建，或移动进来的文件（验证时间戳）  
    val lines: DStream[String] = ssc.textFileStream("data/log/")  
  
    // 2. DStream transform  
    val result: DStream[(String, Int)] = lines  
      .flatMap(_.split("\\s+"))  
      .map((_, 1))  
      .reduceByKey(_ + _)  
  
    // 3. DStream output  
    result.print(20)  
  
    // 4. start job  
    ssc.start()  
    // 挂起，不调用会直接结束进程  
    ssc.awaitTermination()  
  }  
}  
```

### Socket数据流

Spark Streaming可以通过Socket端口监听并接收数据，然后进行相应处理;  
  
新开一个命令窗口，启动 nc 程序:  
  
```shell  
nc -lk 9999  
# yum install nc  
```  
  
随后可以在nc窗口中随意输入一些单词，监听窗口会自动获得单词数据流信息，在 监听窗口每隔x秒就会打印出词频统计信息，可以在屏幕上出现结果。  
  
备注:使用local[*]，可能存在问题。 如果给虚拟机配置的cpu数为1，使用local[*]也只会启动一个线程，该线程用于receiver task，此时没有资源处理接收达到的数据。 【现象:程序正常执行，不会打印时间戳，屏幕上也不会有其他有效信息】  
  
注意:DStream的 StorageLevel 是 MEMORY_AND_DISK_SER_2;  
  
```scala  
  
// 修改前面fileTextStream的数据源，其他测试代码相同  
  
val lines: DStream[String] = ssc.socketTextStream(  
  "localhost",  
  9999,  
  StorageLevel.MEMORY_AND_DISK_SER_2)  
  
  
```

- SocketServer程序
  ```scala  
  import java.io.PrintWriter  
  import java.net.{ServerSocket, Socket}  
    
  import scala.util.Random  
    
  object SocketLikeNC {  
    def main(args: Array[String]): Unit = {  
      val words: Array[String] = "Hello World Hello Hadoop Hello spark kafka hive zookeeper hbase flume sqoop".split("\\s+")  
      val n: Int = words.length  
      val port: Int = 9999  
      val random: Random = scala.util.Random  
      val server = new ServerSocket(port)  
      val socket: Socket = server.accept()  
      println("成功连接到本地主机:" + socket.getInetAddress)  
      while (true) {  
        val out = new PrintWriter(socket.getOutputStream)  
        out.println(words(random.nextInt(n)) + " "+  
          words(random.nextInt(n)))  
        out.flush()  
        Thread.sleep(500)  
      }  
    }  
  }  
  ```

### RDD队列流

调试Spark Streaming应用程序的时候，可使用streamingContext.queueStream(queueOfRDD) 创建基于RDD队列的DStream;  
  
备注:  
* oneAtATime:缺省为true，一次处理一个RDD;设为false，一次处理全部RDD   
* RDD队列流可以使用local[1]  
* 涉及到同时出队和入队操作，所以要做同步  
  
每秒创建一个RDD(RDD存放1-100的整数)，Streaming每隔1秒就对数据进行处 理，计算RDD中数据除10取余的个数。  
  
```scala  
import org.apache.log4j.{Level, Logger}  
import org.apache.spark.SparkConf  
import org.apache.spark.rdd.RDD  
import org.apache.spark.streaming.{Seconds, StreamingContext}  
import org.apache.spark.streaming.dstream.{DStream, InputDStream}  
  
import scala.collection.mutable  
  
object RDDDStream {  
  def main(args: Array[String]): Unit = {  
    Logger.getLogger("org").setLevel(Level.ERROR)  
  
    val conf: SparkConf = new SparkConf()  
      .setAppName(this.getClass.getCanonicalName.init)  
      .setMaster("local[*]")  
  
  
    val ssc = new StreamingContext(conf, Seconds(1))  
  
    // 1. create DStream  
    val queue = new mutable.Queue[RDD[Int]]()  
  
    val queueDStream: InputDStream[Int] = ssc.queueStream(queue)  
  
    // 2. DStream transform  
    val result: DStream[(Int, Int)] = queueDStream.map(elem => (elem % 10, 1))  
      .reduceByKey(_ + _)  
  
    // 3. DStream output  
    result.print()  
  
    // 4. start job  
    ssc.start()  
  
    for (i <- 1 to 5) {  
      // 涉及到同时出队和入队操作，所以要做同步  
      queue.synchronized{  
        val range = (1 to 100).map(_*i)  
        queue += ssc.sparkContext.makeRDD(range, 2)  
      }  
      Thread.sleep(1000)  
    }  
  
    ssc.stop()  
  
  }  
}  
  
```

## DStream转换操作
![](/resource/spark_streaming/assets/FD339A8C-182D-44AB-9E31-B96F33175287.png)

DStream上的操作与RDD的类似，分为 **Transformations(转换)和 Output Operations(输出)两种**，此外转换操作中还有一些比较特殊的方法，如: updateStateByKey、transform 以及各种 Window 相关的操作。  
  
备注:  
* 在DStream与RDD上的转换操作非常类似(无状态的操作)   
* DStream有自己特殊的操作(窗口操作、追踪状态变化操作)   
* 在DStream上的转换操作比RDD上的转换操作少  
  
DStream 的转化操作可以分为 无状态(stateless) 和 有状态(stateful) 两种:  
* 无状态转化操作。每个批次的处理不依赖于之前批次的数据。常见的 RDD 转化 操作，例如 map、filter、reduceByKey 等   
* 有状态转化操作。需要使用之前批次的数据 或者是 中间结果来计算当前批次的 数据。有状态转化操作包括:基于滑动窗口的转化操作 或 追踪状态变化的转化 操作

### 无状态转换

无状态转化操作就是把简单的 RDD 转化操作应用到每个批次上，也就是转化  
DStream 中的每一个 RDD。 常见的无状态转换包括:map、flatMap、filter、repartition、reduceByKey、  
groupByKey;直接作用在DStream上  
  
**重要的转换操作:transform。通过对源DStream的每个RDD应用RDD-to-RDD函 数，创建一个新的DStream。支持在新的DStream中做任何RDD操作**。  
  
这是一个功能强大的函数，它可以允许开发者直接操作其内部的RDD。也就是说开 发者，可以提供任意一个RDD到RDD的函数，这个函数在数据流每个批次中都被调 用，生成一个新的流。  
  
过滤黑名单案例  
  
```scala  
import org.apache.log4j.{Level, Logger}  
import org.apache.spark.SparkConf  
import org.apache.spark.rdd.RDD  
import org.apache.spark.sql.{DataFrame, SparkSession}  
import org.apache.spark.streaming.dstream.ConstantInputDStream  
import org.apache.spark.streaming.{Seconds, StreamingContext}  
  
object BlackListFilter1 {  
  def main(args: Array[String]): Unit = {  
    Logger.getLogger("org").setLevel(Level.ERROR)  
  
    val conf: SparkConf = new SparkConf()  
      .setAppName(this.getClass.getCanonicalName.init)  
      .setMaster("local[*]")  
  
    val ssc = new StreamingContext(conf, Seconds(1))  
  
    /**  
     * 黑名单过滤，在blackList中，为true的key会被过滤掉  
     */  
    val blackList = Array(("spark", true), ("scala", false))  
    val blackListRDD: RDD[(String, Boolean)] = ssc.sparkContext.makeRDD(blackList)  
  
    val strArray: Array[String] = "Hello World Hello scala Hadoop Hello spark kafka hive zookeeper hbase flume sqoop"  
      .split("\\s+")  
      .zipWithIndex  
      .map{case (k, v) => s"$v $k"}  
    val rdd: RDD[String] = ssc.sparkContext.makeRDD(strArray)  
  
  
    // ConstantInputDStream  
    // An input stream that always returns the same RDD on each time step. Useful for testing.  
    val wordDStream: ConstantInputDStream[String] = new ConstantInputDStream(ssc, rdd)  
  
    // 1. 方法一 使用RDD Join  
    // transform Return a new DStream in which each RDD is  
    // generated by applying a function * on each RDD of 'this' DStream.  
    wordDStream.transform{rdd =>  
      val result = rdd.map{ line =>  
        (line.split("\\s+")(1), line)  
      }.leftOuterJoin(blackListRDD)  
          .filter{case (_, (_, right)) => !right.getOrElse(false)}  
          .map{case (_, (left, _)) => left}  
      result  
    }.print(20)  
  
  
    // 2. 方法二 使用sql join  
    wordDStream.map(line => (line.split("\\s+")(1), line))  
      .transform{rdd =>  
        val spark = SparkSession  
          .builder()  
          .config(rdd.sparkContext.getConf)  
          .getOrCreate()  
        import spark.implicits._  
  
        val wordDF: DataFrame = rdd.toDF("word", "line")  
        val blackListDF = blackListRDD.toDF("word", "flag")  
        wordDF  
          .join(blackListDF, Seq("word"), "left_outer")  
          .filter("flag is null or flag = false")  
          .select("line")  
          .rdd  
      }.print(20)  
  
    // 3. 方法三 直接使用filter  
    wordDStream.map(line => (line.split("\\s+")(1).toLowerCase, line))  
      .filter{case (word, _) => !blackList.filter(_._2).map(_._1).contains(word)}  
      .map(_._2)  
      .print(20)  
  
  
    ssc.start()  
    ssc.awaitTermination()  
  }  
}  
```

### 有状态转换

有状态的转换主要有两种:窗口操作、状态跟踪操作

- 窗口操作<br>
![](/resource/spark_streaming/assets/DAE5E912-875A-42AF-B491-B104FF4EC25B.png)
  Window Operations可以设置窗口大小和滑动窗口间隔来动态的获取当前Streaming的状态。  
  基于窗口的操作会在一个比 StreamingContext 的 batchDuration(批次间隔)更长 的时间范围内，通过整合多个批次的结果，计算出整个窗口的结果。  
    
  基于窗口的操作需要两个参数:   
  * 窗口长度(windowDuration)。控制每次计算最近的多少个批次的数据  
  * 滑动间隔(slideDuration)。用来控制对新的 DStream 进行计算的间隔   
  **两者都必须是 StreamingContext 中批次间隔(batchDuration)的整数倍。**

	- 常用api<br>
![](/resource/spark_streaming/assets/B83A08C6-47F0-483B-9B59-7C51DCEE20C3.png)

	- 示例代码
	  热点搜索词实时统计。每隔 10 秒，统计最近20秒的词出现的次数  
	    
	  ```scala  
	  import org.apache.log4j.{Level, Logger}  
	  import org.apache.spark.SparkConf  
	  import org.apache.spark.streaming.dstream.DStream  
	  import org.apache.spark.streaming.{Seconds, StreamingContext}  
	    
	  object HotWordStats {  
	    def main(args: Array[String]): Unit = {  
	      Logger.getLogger("org").setLevel(Level.ERROR)  
	    
	      val conf: SparkConf = new SparkConf()  
	        .setAppName(this.getClass.getCanonicalName.init)  
	        .setMaster("local[*]")  
	    
	    
	      val ssc = new StreamingContext(conf, Seconds(5))  
	      ssc.checkpoint("data/checkpoint")  
	    
	      // 1. create DStream  
	      val lines: DStream[String] = ssc.socketTextStream("localhost", 9999)  
	    
	      // 每隔10秒，统计一次，最近20秒，收到单词的次数  
	      val workCount1 = lines.flatMap(_.split("\\s+"))  
	         .map((_,1))  
	         .reduceByKeyAndWindow((x:Int, y:Int)=>x+y, Seconds(20), Seconds(10))  
	      workCount1.print()  
	    
	      // 更加高效的方法  
	      val workCount2 = lines.flatMap(_.split("\\s+"))  
	        .map((_,1))  
	        .reduceByKeyAndWindow(_+_, _-_, Seconds(20), Seconds(10))  
	    
	      workCount2.print()  
	    
	    
	      // 4. start job  
	      ssc.start()  
	      // 挂起，不调用会直接结束进程  
	      ssc.awaitTermination()  
	    }  
	  }  
	  ```  
	    
	  socket 代码  
	    
	  ```scala  
	  import java.io.PrintWriter  
	  import java.net.{ServerSocket, Socket}  
	  import scala.util.Random  
	    
	  object SocketLikeNC {  
	    def main(args: Array[String]): Unit = {  
	      val words: Array[String] = "Hello World Hello Hadoop Hello spark kafka hive zookeeper hbase flume sqoop".split("\\s+")  
	      val n: Int = words.length  
	      val port: Int = 9999  
	      val random: Random = scala.util.Random  
	      val server = new ServerSocket(port)  
	      val socket: Socket = server.accept()  
	      println("成功连接到本地主机:" + socket.getInetAddress)  
	      while (true) {  
	        val out = new PrintWriter(socket.getOutputStream)  
	        out.println(words(random.nextInt(n)) + " "+  
	          words(random.nextInt(n)))  
	        out.flush()  
	        Thread.sleep(500)  
	      }  
	    }  
	  }  
	  ```

- 状态追踪操作

	- updateStateByKey
	  UpdateStateByKey的主要功能:  
	  * 为Streaming中每一个Key维护一份state状态，state类型可以是任意类型的， 可以是自定义对象;更新函数也可以是自定义的  
	  * 通过更新函数对该key的状态不断更新，对于每个新的batch而言，Spark Streaming会在使用updateStateByKey 的时候为已经存在的key进行state的状 态更新  
	  * 使用 updateStateByKey 时要开启 checkpoint 功能  
	    
	  流式程序启动后计算wordcount的累计值，将每个批次的结果保存到文件  
	    
	  ```scala  
	  import org.apache.log4j.{Level, Logger}  
	  import org.apache.spark.SparkConf  
	  import org.apache.spark.streaming.dstream.DStream  
	  import org.apache.spark.streaming.{Seconds, StreamingContext}  
	    
	  object StateTracker1 {  
	    def main(args: Array[String]): Unit = {  
	      Logger.getLogger("org").setLevel(Level.ERROR)  
	    
	      val conf: SparkConf = new SparkConf()  
	        .setAppName(this.getClass.getCanonicalName.init)  
	        .setMaster("local[*]")  
	    
	    
	      val ssc = new StreamingContext(conf, Seconds(5))  
	      ssc.checkpoint("data/checkpoint/")  
	    
	      // 1. create DStream  
	      val lines: DStream[String] = ssc.socketTextStream("localhost", 9999)  
	    
	      val pairsDStream = lines.flatMap(_.split("\\s+")).map((_, 1))  
	    
	  //    var updateFunc: (Seq[V], Option[S]) => Option[S]  
	      // 更新状态值  
	      def updateFunc(values: Seq[Int], state: Option[Int]): Option[Int] = {  
	        Some(values.sum + state.getOrElse(0))  
	      }  
	    
	      val resultDS = pairsDStream.updateStateByKey[Int](updateFunc, numPartitions = 1)  
	      resultDS.cache()  
	      resultDS.print()  
	      resultDS.saveAsTextFiles("data/output/")  
	    
	      // 4. start job  
	      ssc.start()  
	      // 挂起，不调用会直接结束进程  
	      ssc.awaitTermination()  
	    }  
	  }  
	  ```  
	    
	  统计全局的key的状态，但是就算没有数据输入，也会在每一个批次的时候返回之前 的key的状态。  
	  这样的缺点:如果数据量很大的话，checkpoint 数据会占用较大的存储，而且效率也不高。

	- mapWithState
	  也是用于全局统计key的状态。如果没有数据输入，便不会返回之 前的key的状态，只返回增量。  
	  这样做的好处是，只关心那些已经发生的变化的key，对于没有数据输入，则不会返 回那些没有变化的key的数据。即使数据量很大，checkpoint也不会像 updateStateByKey那样，占用太多的存储。  
	    
	  ```scala  
	  import org.apache.log4j.{Level, Logger}  
	  import org.apache.spark.SparkConf  
	  import org.apache.spark.streaming.dstream.DStream  
	  import org.apache.spark.streaming.{Seconds, State, StateSpec, StreamingContext, Time}  
	    
	  object StateTracker2 {  
	    def main(args: Array[String]): Unit = {  
	      Logger.getLogger("org").setLevel(Level.ERROR)  
	    
	      val conf: SparkConf = new SparkConf()  
	        .setAppName(this.getClass.getCanonicalName.init)  
	        .setMaster("local[*]")  
	    
	    
	      val ssc = new StreamingContext(conf, Seconds(1))  
	      ssc.checkpoint("data/checkpoint/")  
	    
	      // 1. create DStream  
	      val lines: DStream[String] = ssc.socketTextStream("localhost", 9999)  
	    
	      val pairsDStream = lines.flatMap(_.split("\\s+")).map((_, 1))  
	    
	    
	  //    def mapFuc(timeStamp: Time, key: String, value: Option[Int], state: State[Int]): Option[(String, Int)] = {  
	  //  
	  //      println(timeStamp)  
	  //      val sum = value.getOrElse(0) + state.getOption().getOrElse(0)  
	  //  
	  //      state.update(sum)  
	  //  
	  //      Some(key, sum)  
	  //    }  
	    
	      // state.get update remove isExists  
	      // 根据情况改变state  
	      def mapFuc(key: String, value: Option[Int], state: State[Int]): (String, Int) = {  
	    
	        val sum = value.getOrElse(0) + state.getOption().getOrElse(0)  
	    
	        state.update(sum)  
	    
	        (key, sum)  
	      }  
	    
	      val spec = StateSpec.function(mapFuc _)  
	    
	      // 不用snapshot的话，每更新一次，收集一次，同一个时间段可能相同的key出现多次  
	      val resultDS = pairsDStream.mapWithState(spec)  
	        // 取所有的值  
	          .stateSnapshots()  
	      resultDS.cache()  
	      resultDS.print(100)  
	      resultDS.saveAsTextFiles("data/output2/")  
	    
	      // 4. start job  
	      ssc.start()  
	      // 挂起，不调用会直接结束进程  
	      ssc.awaitTermination()  
	    }  
	  }  
	    
	  ```

## DStream输出操作<br>
![](/resource/spark_streaming/assets/DAB15364-F219-4261-9F26-1E0285688C85.png)

输出操作定义 DStream 的输出操作。  
**与 RDD 中的惰性求值类似，如果一个 DStream 及其派生出的 DStream 都没有被执 行输出操作，那么这些 DStream 就都不会被求值**。  
如果 StreamingContext 中没有设定输出操作，整个流式作业不会启动。  
  
通用的输出操作 foreachRDD，用来对 DStream 中的 RDD 进行任意计算。在 foreachRDD中，可以重用 Spark RDD 中所有的 Action 操作。需要注意的点:  
* 连接不要定义在 Driver 中  
* 连接定义在 RDD的 foreach 算子中，则遍历 RDD 的每个元素时都创建连接，得不偿失  
* 应该在 RDD的 foreachPartition 中定义连接，每个分区创建一个连接   
* 可以考虑使用连接池

## 与Kafka整合<br>
![](/resource/spark_streaming/assets/E1F5C84F-56B7-4890-AE46-41D43283FC17.png)

官网:[http://spark.apache.org/docs/2.4.5/streaming-kafka-integration.html](http://spark.apache.org/docs/2.4.5/streaming-kafka-integration.html)  
  
针对不同的spark、kafka版本，集成处理数据的方式分为两种:  
**Receiver Approach** 和**Direct Approach**，不同集成版本处理方式的支持，可参考上图

### Kafka-08 接口(了解)

- Receiver based Approach
  基于 Receiver 的方式使用 Kafka 旧版消费者高阶API实现。  
  对于所有的 Receiver，通过 Kafka 接收的数据被存储于 Spark 的 Executors上，底 层是写入BlockManager中，默认200ms生成一个 block(spark.streaming.blockInterval)。然后由 Spark Streaming 提交的 job 构 建BlockRDD，最终以 Spark Core任务的形式运行。对应 Receiver方式，有以下几 点需要注意:  
  * **Receiver 作为一个常驻线程调度到 Executor上运行，占用一个cpu**  
  * Receiver 个数由KafkaUtils.createStream调用次数决定，一次一个 Receiver  
  * kafka中的topic分区并不能关联产生在spark streaming中的rdd分区。增加在 KafkaUtils.createStream()中的指定的topic分区数，仅仅增加了单个receiver消 费的topic的线程数，它不会增加处理数据中的并行的spark的数量。  
  * receiver默认200ms生成一个block，可根据数据量大小调整block生成周期。一个block对应RDD一个分区。  
  * receiver接收的数据会放入到BlockManager，每个 Executor 都会有一个 BlockManager实例，由于数据本地性，那些存在 Receiver 的 Executor 会被调 度执行更多的 Task，就会导致某些executor比较空闲  
  * 默认情况下，Receiver是可能丢失数据的。可以通过设置 spark.streaming.receiver.writeAheadLog.enable为true开启预写日志机制，将 数据先写入一个可靠地分布式文件系统(如HDFS)，确保数据不丢失，但会损失一 定性能

- Direct Approach
  Direct Approach是 Spark Streaming不使用Receiver集成kafka的方式，在企业生产环境中使用较多。相较于Receiver，有以下特点:  
  * 不使用 Receiver。减少不必要的CPU占用;减少了 Receiver接收数据写入 BlockManager，然后运行时再通过blockId、网络传输、磁盘读取等来获取数据 的整个过程，提升了效率;无需WAL，进一步减少磁盘IO;  
  * Direct方式生的RDD是KafkaRDD，它的分区数与 Kafka 分区数保持一致，便于把控并行度（**注意:在 Shuffle 或 Repartition 操作后生成的RDD，这种对应关系会失效**）  
  * 可以手动维护offset，实现 Exactly Once 语义

### Kafka-010 接口

Spark Streaming与kafka 0.10的整合，和0.8版本的 Direct 方式很像。Kafka的分区 和Spark的RDD分区是一一对应的，可以获取 offsets 和元数据，API 使用起来没有 显著的区别。  
  
添加依赖:  
```xml  
<dependency>  
    <groupId>org.apache.spark</groupId>  
    <artifactId>spark-streaming-kafka-0-10_2.12</artifactId>  
    <version>${spark.version}</version>  
</dependency>  
```  
  
不要手动添加 org.apache.kafka 相关的依赖，如kafka-clients。spark-streaming- kafka-0-10已经包含相关的依赖了，不同的版本会有不同程度的不兼容。

- Kafka 中获取数据
  * Kafka集群   
  * kafka生产者发送数据  
  * Spark Streaming程序接收数

	- spark streaming代码
	  ```scala  
	  import org.apache.kafka.clients.consumer.{ConsumerConfig, ConsumerRecord}  
	  import org.apache.kafka.common.serialization.StringDeserializer  
	  import org.apache.log4j.{Level, Logger}  
	  import org.apache.spark.SparkConf  
	  import org.apache.spark.streaming.{Seconds, StreamingContext}  
	  import org.apache.spark.streaming.dstream.InputDStream  
	  import org.apache.spark.streaming.kafka010.{ConsumerStrategies, KafkaUtils, LocationStrategies}  
	    
	  object KafkaDStream {  
	    def main(args: Array[String]): Unit = {  
	      Logger.getLogger("org").setLevel(Level.WARN)  
	    
	      val conf: SparkConf = new SparkConf()  
	        .setAppName(this.getClass.getCanonicalName.init)  
	        .setMaster("local[*]")  
	    
	      val ssc = new StreamingContext(conf, Seconds(5))  
	    
	    
	      // kafka Stream  
	      /**  
	       * LocationStrategies(本地策略)  
	       * LocationStrategies.PreferBrokers:如果 Executor 在 kafka 集群中的某些节点 上，可以使用这种策略。此时Executor 中的数据会来自当前broker节点  
	       * LocationStrategies.PreferConsistent:大多数情况下使用的策略，将Kafka分 区均匀的分布在Spark集群的 Executor上  
	       * LocationStrategies.PreferFixed:如果节点之间的分区有明显的分布不均，使 用这种策略。通过一个map指定将 topic 分区分布在哪些节点中  
	       *  
	       * ConsumerStrategies(消费策略)  
	       * ConsumerStrategies.Subscribe，用来订阅一组固定topic  
	       * ConsumerStrategies.SubscribePattern，使用正则来指定感兴趣的topic  
	       * ConsumerStrategies.Assign，指定固定分区的集合  
	       */  
	      val topics = Array("topicB")  
	      val kafkaParams: Map[String, Object] = getKafkaConsumerConfigs("groupA")  
	      val dstream: InputDStream[ConsumerRecord[String, String]] = KafkaUtils.createDirectStream(  
	        ssc,  
	        LocationStrategies.PreferConsistent,  
	        ConsumerStrategies.Subscribe[String, String](topics, kafkaParams)  
	      )  
	    
	      dstream.foreachRDD { (rdd, time) =>  
	        // 打印消费数据量  
	        if (!rdd.isEmpty()) {  
	          println(s"******************* rdd.count = ${rdd.count()}; time = $time ******************************")  
	        }  
	      }  
	    
	      ssc.start()  
	      ssc.awaitTermination()  
	    }  
	    
	    /**  
	     * kafka 消费者配置  
	     * @param groupId  
	     * @return  
	     */  
	    def getKafkaConsumerConfigs(groupId: String): Map[String, Object] = {  
	      Map[String, Object](  
	        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG -> "centos7-1:9092,centos7-2:9092,centos7-3:9092",  
	        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG -> classOf[StringDeserializer],  
	        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG -> classOf[StringDeserializer],  
	        ConsumerConfig.GROUP_ID_CONFIG -> groupId,  
	        ConsumerConfig.AUTO_OFFSET_RESET_CONFIG -> "earliest",  
	        ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG -> (false: java.lang.Boolean)  
	      )  
	    }  
	  }  
	  ```

	- producer代码
	  ```scala  
	  import java.util.Properties  
	  import java.util.concurrent.Future  
	    
	  import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig, ProducerRecord, RecordMetadata}  
	  import org.apache.kafka.common.serialization.StringSerializer  
	    
	  object KafkaProducer {  
	    def main(args: Array[String]): Unit = {  
	      // 定义 kafka 参数  
	      val brokers = "centos7-1:9092,centos7-2:9092,centos7-3:9092"  
	      val topic = "topicB"  
	      val prop = new Properties()  
	      prop.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers)  
	      prop.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,  
	        classOf[StringSerializer])  
	      prop.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,  
	        classOf[StringSerializer])  
	      // KafkaProducer  
	      val producer = new KafkaProducer[String, String](prop)  
	      for (i <- 1 to 1000000){  
	        val msg = new ProducerRecord[String, String](topic,  
	          i.toString, i.toString) // 发送消息  
	        val value: Future[RecordMetadata] = producer.send(msg)  
	        println(s"i = $i")  
	        Thread.sleep(100)  
	      }  
	      producer.close()  
	    }  
	  }  
	  ```  
	    
	  kafka 指令  
	  ```shell  
	  # 创建 topic  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topicB --partitions 2 --replication-factor 3  
	    
	  # 显示 topic 信息  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --describe --topic topicB  
	  ```

### Offset 管理(010)

Spark Streaming集成Kafka，允许从Kafka中读取一个或者多个 topic 的数据。一个 Kafka Topic包含一个或多个分区，每个分区中的消息顺序存储，并使用 offset 来标 记消息的位置。开发者可以在 Spark Streaming 应用中通过 offset 来控制数据的读 取位置。  
  
Offsets 管理对于保证流式应用在整个生命周期中数据的连贯性是非常重要的。如果 在应用停止或报错退出之前没有将 offset 持久化保存，该信息就会丢失，那么Spark Streaming就没有办法从上次停止或报错的位置继续消费Kafka中的消息。

- 获取偏移量(Obtaining Offsets)
  Spark Streaming与kafka整合时，允许获取其消费的 offset ，具体方法如下:  
    
  ```scala  
  dstream.foreachRDD { (rdd, time) =>  
    println(s"******************* rdd.count = ${rdd.count()}; time = $time ******************************")  
    
    // 获取所有偏移量  
    val offsetRanges: Array[OffsetRange] = rdd.asInstanceOf[HasOffsetRanges].offsetRanges  
    // 偏移量和分区数会对应上  
    rdd.foreachPartition{iter =>  
      // TaskContext.get.partitionId 获取当前所属分区  
      val range: OffsetRange = offsetRanges(TaskContext.get.partitionId)  
    
      println(s"${range.topic} ${range.partition} ${range.fromOffset}-${range.untilOffset}")  
    }  
  }  
  ```  
    
  注意:对HasOffsetRanges的类型转换只有在对 createDirectStream 调用的第一个 方法中完成时才会成功，而不是在随后的方法链中。RDD分区和Kafka分区之间的对 应关系在 shuffle 或 重分区后会丧失，如reduceByKey 或 window。

- 存储偏移量(Storing Offsets)
  在Streaming程序失败的情况下，Kafka交付语义取决于如何以及何时存储偏移量。Spark输出操作的语义为 at-least-once。  
  如果要实现EOS语义(Exactly Once Semantics)，必须**在幂等的输出之后存储偏移量 或者 将存储偏移量与输出放在一个事务中**。可以按照增加可靠性(和代码复杂度) 的顺序使用以下选项来存储偏移量:

	- Checkpoint
	  Checkpoint是对Spark Streaming运行过程中的元数据和每RDDs的数据状态保存到 一个持久化系统中，当然这里面也包含了offset，一般是HDFS、S3，如果应用程序 或集群挂了，可以迅速恢复。  
	  如果Streaming程序的代码变了，重新打包执行就会出现反序列化异常的问题。 这是因为Checkpoint首次持久化时会将整个 jar 包序列化，以便重启时恢复。重新打  
	  包之后，新旧代码逻辑不同，就会报错或仍然执行旧版代码。 要解决这个问题，只能将HDFS上的checkpoint文件删除，但这样也会同时删除  
	  Kafka 的offset信息。

	- Kafka
	  默认情况下，消费者定期自动提交偏移量，它将偏移量存储在一个特殊的Kafka主题 中(__consumer_offsets)。但在某些情况下，这将导致问题，因为消息可能已经 被消费者从Kafka拉去出来，但是还没被处理。  
	  可以将 enable.auto.commit 设置为 false ，在 Streaming 程序输出结果之后，手动 提交偏移到kafka。  
	  与检查点相比，使用Kafka保存偏移量的优点是无论应用程序代码如何更改，偏移量 仍然有效。  
	    
	  ```scala  
	  // ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG -> (false: java.lang.Boolean)  
	    
	  stream.foreachRDD { rdd =>  
	    val offsetRanges = rdd.asInstanceOf[HasOffsetRanges].offsetRanges  
	    
	    // 在输出操作完成之后，手工提交偏移量;此时将偏移量提交到 Kafka 的消息队列中  
	    stream.asInstanceOf[CanCommitOffsets].commitAsync(offsetRanges)  
	  }  
	  ```  
	    
	  与HasOffsetRanges一样，只有在createDirectStream的结果上调用时，转换到 CanCommitOffsets才会成功，而不是在转换之后。commitAsync调用是线程安全 的，但必须在输出之后执行。

	- 自定义存储
![](/resource/spark_streaming/assets/EE12B79D-CC77-4F3F-8002-71D634404509.png)
	  Offsets可以通过多种方式来管理，但是一般来说遵循下面的步骤:  
	  1、 在 DStream 初始化的时候，需要指定每个分区的offset用于从指定位置读取数 据  
	  2、 读取并处理消息  
	  3、 处理完之后存储结果数据  
	  4、将 offsets 保存在外部持久化数据库如 HBase、Kafka、HDFS、ZooKeeper、 **Redis**、**MySQL** ... ...  
	    
	  可以将 Offsets 存储到HDFS中，但这并不是一个好的方案。因为HDFS延迟有点高， 此外将每批次数据的offset存储到HDFS中还会带来小文件问题;  
	  可以将 Offset 存储到保存ZK中，但是将ZK作为存储用，也并不是一个明智的选择， 同时ZK也不适合频繁的读写操作;

- Redis管理的Offset
  要想将Offset保存到外部存储中，关键要实现以下几个功能:  
  * Streaming程序启动时，从外部存储获取保存的Offsets(执行一次)   
  * 在foreachRDD中，每个批次数据处理之后，更新外部存储的offsets(多次执行)  
    
  Redis管理的Offsets:  
  ```shell  
  1、数据结构选择:Hash;key、field、value Key:kafka:topic:TopicName:groupid Field:partition  
  Value:offset  
    
  2、从 Redis 中获取保存的offsets   
    
  3、消费数据后将offsets保存到redis  
  ```  
    
  引入依赖  
    
  ```xml  
  <!-- jedis -->  
  <dependency>  
      <groupId>redis.clients</groupId>  
      <artifactId>jedis</artifactId>  
      <version>2.9.0</version>  
  </dependency>  
  ```

	- 工具类(Redis读取/保存offsets)
	  ```scala  
	    
	  import org.apache.kafka.common.TopicPartition  
	  import org.apache.spark.streaming.kafka010.OffsetRange  
	  import redis.clients.jedis.{Jedis, JedisPool, JedisPoolConfig}  
	  import scala.collection.JavaConverters._  
	    
	  /**  
	   * 1、数据结构选择:Hash;key、field、value  
	   * Key:kafka:topic:TopicName:groupid  
	   * Field:partition  
	   * Value:offset  
	   *  
	   * 2、从 Redis 中获取保存的offsets  
	   * 3、消费数据后将offsets保存到redis  
	   */  
	  object OffsetsWithRedisUtils {  
	    
	    private val redisHost = "centos7-3"  
	    private val redisPort = 6379  
	    
	    private val config = new JedisPoolConfig  
	    config.setMaxIdle(5)  
	    config.setMaxTotal(10)  
	    private val pool = new JedisPool(config, redisHost, redisPort, 10000)  
	    private def getRedisConnection: Jedis = pool.getResource  
	    
	    private val topicPrefix = "kafka:topic"  
	    
	    private def getKey(topic: String, groupId: String) = s"$topicPrefix:$topic:$groupId"  
	    
	    /**  
	     * 从redis读取offset  
	     * @param topics  
	     * @param groupId  
	     * @return  
	     */  
	    def getOffsetsFromRedis(topics: Array[String], groupId: String): Map[TopicPartition, Long] = {  
	      val jedis = getRedisConnection  
	      val offsets = topics.flatMap{ topic =>  
	        val key = getKey(topic, groupId)  
	        jedis  
	          .hgetAll(key)  
	          .asScala  
	          .map{case (partition, offset) =>  
	            new TopicPartition(topic, partition.toInt) -> offset.toLong}  
	      }.toMap  
	    
	      // 资源归还  
	      jedis.close()  
	    
	      offsets  
	    }  
	    
	    /**  
	     * 保存到redis  
	     * @param offsets  
	     * @param groupId  
	     */  
	    def saveOffsetsToRedis(offsets: Array[OffsetRange], groupId: String): Unit = {  
	      // HMSET kafka:topic:topicA:mygroupId 0 200 1 200  
	      // hmset(key: String, hash: Map[String, String])  
	    
	      val jedis = getRedisConnection  
	    
	      offsets  
	        .map{range =>  
	        (range.topic, (range.partition.toString, range.untilOffset.toString))  
	        }  
	        .groupBy(_._1)  
	        .foreach{case (topic, pOffsets) =>  
	          jedis.hmset(getKey(topic, groupId), pOffsets.map(_._2).toMap.asJava)  
	        }  
	    
	      // 归还资源  
	      jedis.close()  
	    }  
	    
	    def main(args: Array[String]): Unit = {  
	      val groupId = "mygroupId"  
	      val topics: Array[String] = Array("topicA", "topicB")  
	    
	      val offsets = Array(  
	        OffsetRange(topics(0), 0, 1L, 1000L),  
	        OffsetRange(topics(0), 1, 1L, 2000L),  
	        OffsetRange(topics(1), 0, 1L, 3000L),  
	        OffsetRange(topics(1), 1, 1L, 4000L),  
	      )  
	    
	      saveOffsetsToRedis(offsets, groupId)  
	    
	      // HMSET kafka:topic:topicA:mygroupId 0 200 1 200  
	      // HMSET kafka:topic:topicB:mygroupId 0 20 1 200  
	      val result: Map[TopicPartition, Long] = getOffsetsFromRedis(topics, groupId)  
	      println(result)  
	    
	    }  
	  }  
	  ```

	- spark streaming代码
	  ```scala  
	  import org.apache.kafka.clients.consumer.{ConsumerConfig, ConsumerRecord}  
	  import org.apache.kafka.common.TopicPartition  
	  import org.apache.kafka.common.serialization.StringDeserializer  
	  import org.apache.log4j.{Level, Logger}  
	  import org.apache.spark.streaming.dstream.InputDStream  
	  import org.apache.spark.streaming.kafka010._  
	  import org.apache.spark.streaming.{Seconds, StreamingContext}  
	  import org.apache.spark.{SparkConf, TaskContext}  
	    
	  object KafkaDStream3 {  
	    def main(args: Array[String]): Unit = {  
	      Logger.getLogger("org").setLevel(Level.WARN)  
	    
	      val conf: SparkConf = new SparkConf()  
	        .setAppName(this.getClass.getCanonicalName.init)  
	        .setMaster("local[*]")  
	    
	      val ssc = new StreamingContext(conf, Seconds(5))  
	    
	      val topics = Array("topic_2", "topic_1")  
	      val groupId = "groupC"  
	      val kafkaParams: Map[String, Object] = getKafkaConsumerConfigs(groupId)  
	      // 获取缓存的offset  
	      val offsets: Map[TopicPartition, Long] = OffsetsWithRedisUtils.getOffsetsFromRedis(topics, groupId)  
	      offsets.foreach(println)  
	    
	      // kafka Stream  
	      val dstream: InputDStream[ConsumerRecord[String, String]] = KafkaUtils.createDirectStream(  
	        ssc,  
	        LocationStrategies.PreferConsistent,  
	        ConsumerStrategies.Subscribe[String, String](  
	          topics,  
	          kafkaParams,  
	          offsets  
	        )  
	      )  
	    
	      dstream.foreachRDD { (rdd, time) =>  
	        if (!rdd.isEmpty()) {  
	          println(s"******************* rdd.count = ${rdd.count()}; time = $time ******************************")  
	    
	          val offsetRanges: Array[OffsetRange] = rdd.asInstanceOf[HasOffsetRanges].offsetRanges  
	    
	          // 保存offset  
	          OffsetsWithRedisUtils.saveOffsetsToRedis(offsetRanges, groupId)  
	    
	          rdd.foreachPartition{iter =>  
	            val range: OffsetRange = offsetRanges(TaskContext.get.partitionId)  
	    
	            println(s"${range.topic} ${range.partition} ${range.fromOffset}-${range.untilOffset}")  
	          }  
	        }  
	      }  
	    
	      ssc.start()  
	      ssc.awaitTermination()  
	    }  
	    
	    def getKafkaConsumerConfigs(groupId: String): Map[String, Object] = {  
	      Map[String, Object](  
	        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG -> "centos7-1:9092,centos7-2:9092,centos7-3:9092",  
	        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG -> classOf[StringDeserializer],  
	        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG -> classOf[StringDeserializer],  
	        ConsumerConfig.GROUP_ID_CONFIG -> groupId,  
	        ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG -> (false: java.lang.Boolean)  
	      )  
	    }  
	  }  
	    
	  ```

	- producer
	  ```shell  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_1 --partitions 3 --replication-factor 3    
	    
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_2 --partitions 2 --replication-factor 3   
	  ```  
	    
	  ```scala  
	  import java.util.Properties  
	  import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig, ProducerRecord}  
	  import org.apache.kafka.common.serialization.StringSerializer  
	    
	  object KafkaProducer {  
	    def main(args: Array[String]): Unit = {  
	      // 定义 kafka 参数  
	      val brokers = "centos7-1:9092,centos7-2:9092,centos7-3:9092"  
	    
	      val prop = new Properties()  
	      prop.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers)  
	      prop.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,  
	        classOf[StringSerializer])  
	      prop.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,  
	        classOf[StringSerializer])  
	    
	      // KafkaProducer  
	      val producer = new KafkaProducer[String, String](prop)  
	      for (i <- 1 to 1000000){  
	        val msg1 = new ProducerRecord[String, String]("topic_1",  
	          i.toString, i.toString) // 发送消息  
	        val msg2 = new ProducerRecord[String, String]("topic_1",  
	          i.toString, i.toString)  
	        producer.send(msg1)  
	        producer.send(msg1)  
	        producer.send(msg2)  
	        println(s"i = $i")  
	        Thread.sleep(100)  
	      }  
	      producer.close()  
	    }  
	  }  
	  ```

