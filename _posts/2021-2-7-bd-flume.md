---
layout: post
title:  "Flume--数据采集工具"
date:   2021-2-7
categories: big data
---

Flume由Cloudera公司开发，是**一个分布式、高可靠、高可用的海量日志采集、聚合、传输的系统**。  
  
Flume支持在日志系统中定制各类数据发送方，用于采集数据;   
Flume提供对数据进行简单处理，并写到各种数据接收方的能力。   
简单的说，**Flume是实时采集日志的数据采集引擎**。


## 概述

### Flume的特点

* 分布式:flume分布式集群部署，扩展性好  
* 可靠性好: 当节点出现故障时，日志能够被传送到其他节点上而不会丢失   
* 易用性:flume配置使用较繁琐，对使用人员专业技术要求高   
* 实时采集:flume采集流模式进行数据实时采集  
  
适用场景:适用于日志文件实时采集。

### Flume体系结构<br>
![](/resource/flume/assets/1CC471F3-BBEC-4F21-BEEC-B94557C5BF07.png)

- Agent
  本质上是一个 JVM 进程，该JVM进程控制Event数据流从外部日志生产者 那里传输到目的地(或者是下一个Agent)。一个完整的Agent中包含了三个组 件Source、Channel和Sink，Source是指数据的来源和方式，Channel是一个数 据的缓冲池，Sink定义了数据输出的方式和目的地。

- Source
  Source是负责接收数据到Flume Agent的组件。Source组件可以处理各种类 型、各种格式的日志数据，包括avro、exec、spooldir、netcat等。

- Channel
  Channel是位于Source和Sink之间的缓冲区。Channel允许Source和Sink运作 在不同的速率上。Channel是线程安全的，可以同时处理多个Source的写入操作 及多个Sink的读取操作。常用的Channel包括:  
  	* Memory Channel是内存中的队列。Memory Channel在允许数据丢失的情 景下适用。如果不允许数据丢失，应该避免使用Memory Channel，因为程 序死亡、机器宕机或者重启都可能会导致数据丢失;  
  	* File Channel将所有事件写到磁盘。因此在程序关闭或机器宕机的情况下不 会丢失数据;* Channel

- Sink
  Sink不断地轮询Channel中的事件且批量地移除它们，并将这些事件批量写入到 存储或索引系统、或者被发送到另一个Flume Agent。  
  Sink是完全事务性的。在从Channel批量删除数据之前，每个Sink用Channel启 动一个事务。批量事件一旦成功写出到存储系统或下一个Flume Agent，Sink就 利用Channel提交事务。事务一旦被提交，该Channel从自己的内部缓冲区删除 事件。  
  Sink组件包括hdfs、logger、avro、file、null、HBase、消息队列等。

- Event
  Event是Flume定义的一个数据流传输的最小单位

### Flume拓扑结构

- 串行模式<br>
![](/resource/flume/assets/F1DB8764-F4C3-48E1-9C2E-C34EB5323316.png)
  将多个flume给顺序连接起来，从最初的source开始到最终sink传送的目的存储系 统。  
    
  此模式不建议桥接过多的flume数量， flume数量过多不仅会影响传输速率，而且一 旦传输过程中某个节点flume宕机，会影响整个传输系统。

- 复制模式(单Souce多Channel、Sink模式)<br>
![](/resource/flume/assets/ED715B4C-27B0-401F-9139-B40245E535A1.png)
  将事件流向一个或者多个目的地。这种模式将数据源复制到多个channel中，每个channel都有相同的数据，sink可以选择传送的不同的目的地。

- 负载均衡模式(单Source、Channel多Sink)<br>
![](/resource/flume/assets/7E201871-5DE1-42B4-A18D-719B007D7185.png)
  将多个sink逻辑上分到一个sink组，flume将数据发送到不同的sink，主要解决负载 均衡和故障转移问题。

- 聚合模式<br>
![](/resource/flume/assets/5A1A08F3-9524-4DB6-84CE-37A64A4A4E80.png)
  这种模式最常见的，也非常实用，日常web应用通常分布在上百个服务器，大者甚至 上千个、上万个服务器。产生的日志，处理起来也非常麻烦。用这种组合方式能很好 的解决这一问题，每台服务器部署一个flume采集日志，传送到一个集中收集日志的 flume，再由此flume上传到hdfs、hive、hbase、消息队列中。

### Flume内部原理<br>
![](/resource/flume/assets/83F008DF-F448-4015-BBB5-4FE27B70B1BE.png)

```sh  
总体数据流向:Souce => Channel => Sink Channel: 处理器、拦截器、选择器  
```  
  
具体过程:  
1. Source接收事件，交给其Channel处理器处理事件  
2. 处理器通过拦截器Interceptor，对事件一些处理,比如压缩解码，正则拦截，时间戳拦截，分类等  
3. 经过拦截器处理过的事件再传给Channel选择器，将事件写入相应的Channel。  
Channel Selector有两种:  
	* Replicating Channel Selector(默认),会将source过来的Event发往所有 Channel(比较常用的场景是，用多个Channel实现冗余副本，保证可用性) 	  
	* Multiplexing Channel Selector，根据配置分发event。此selector会根据 event中某个header对应的value来将event发往不同的channel  
4. 最后由Sink处理器处理各个Channel的事件

## 安装部署

* Flume官网地址:http://flume.apache.org/   
* 文档查看地址:http://flume.apache.org/FlumeUserGuide.html   
* 下载地址:http://archive.apache.org/dist/flume/  
* 选择的版本 1.9.0

### 1. 下载软件 apache-flume

下载软件 apache-flume-1.9.0-bin.tar.gz，并上传到 centos7-3 上的 /opt/lagou/software 目录下

### 2. 解压 apache-flume

解压 apache-flume-1.9.0-bin.tar.gz 到 /opt/lagou/servers/ 目录下;并重命名 为 flume-1.9.0

### 3. 在 /etc/profile 中增加环境变量

```sh  
vi /etc/profile  
  
export FLUME_HOME=/opt/lagou/servers/flume-1.9.0  
export PATH=$PATH:$FLUME_HOME/bin  
  
  
source /etc/profile  
```

### 4. 配置java_home

将 $FLUME_HOME/conf 下的 flume-env.sh.template 改名为 flume-env.sh，并添加 JAVA_HOME的配置  
  
```sh  
cd $FLUME_HOME/conf  
mv flume-env.sh.template flume-env.sh  
vi flume-env.sh  
export JAVA_HOME=/opt/lagou/servers/jdk1.8.0_231  
```

## 基础应用

### 前置知识

- 常见的 Source
  Flume 支持的数据源种类有很多，可以来自directory、http、kafka等。Flume提供 了Source组件用来采集数据源。  
    
  # 3种监控日志文件Source的对比  
  * exec Source:适用于监控一个实时追加的文件，但不能保证数据不丢失;  
  * spooldir Source:能够保证数据不丢失，且能够实现断点续传，但延迟较高，不能实时 监控;  
  * taildir Source:既能够实现断点续传，又可以保证数据不丢失，还能够进行实时监控。

	- avro source<br>
![](/resource/flume/assets/94B9E7BF-3492-4AD9-B2EF-9E0583E061E6.png)
	  监听 Avro 端口来接收外部 avro 客户端的事件流。avro-source 接收到的是经过avro序列化后的数据，然后反序列化数据继续传输。如果是avro source的话，源数据必须是经过avro序列化后的数据。利用 Avro source可以实现多 级流动、扇出流、扇入流等效果。接收通过flume提供的avro客户端发送的日 志信 息。  
	  >Avro是Hadoop的一个数据序列化系统，由Hadoop的创始人Doug Cutting(也是 Lucene，Nutch等项目的创始人)开发，设计用于支持大批量数据交换的应用。它的主要 特点有:  
	  支持二进制序列化方式，可以便捷，快速地处理大量数据; 动态语言友好，Avro提供的机制使动态语言可以方便地处理Avro数据;

	- exec source
	  可以将命令产生的输出作为source。如ping 192.168.234.163、tail -f hive.log

	- netcat source
	  一个NetCat Source用来监听一个指定端口，并接收监听到的 数据

	- spooling directory source
	  将指定的文件加入到“自动搜集”目录中。flume会 持续监听这个目录，把文件当做source来处理。注意:一旦文件被放到目录中后， 便不能修改，如果修改，flume会报错。此外，也不能有重名的文件

	- Taildir Source(1.7)
	  监控指定的多个文件，一旦文件内有新写入的数据， 就会将其写入到指定的sink内，本来源可靠性高，不会丢失数据。其不会对于跟踪的 文件有任何处理，不会重命名也不会删除，不会做任何修改。目前不支持Windows 系统，不支持读取二进制文件，支持一行一行的读取文本文件

- 常见的 Channel
  采集到的日志需要进行缓存，Flume提供了Channel组件用来缓存数据。

	- memory channel
	  缓存到内存中(最常用)

	- file channel
	  缓存到文件中

	- JDBC channel
	  通过JDBC缓存到关系型数据库中

	- kafka channel
	  缓存到kafka中

- 常见的 Sink
  缓存的数据最终需要进行保存，Flume提供了Sink组件用来保存数据。

	- logger sink
	  将信息显示在标准输出上，主要用于测试

	- avro sink
	  Flume events发送到sink，转换为Avro events，并发送到配置好的hostname/port。从配置好的channel按照配置好的批量大小批量获取events

	- null sink
	  将接收到events全部丢弃

	- HDFS sink
	  将 events 写进HDFS。支持创建文本和序列文件，支持两种文件 类型压缩。文件可以基于数据的经过时间、大小、事件的数量周期性地滚动  
	    
	  一般使用 HDFS Sink 都会采用滚动生成文件的方式，滚动生成文件的策略有:  
	  * 基于时间  
	  	* hdfs.rollInterval   
	  	* 缺省值:30，单位秒   
	  	* 0禁用  
	  * 基于文件大小  
	  	* hdfs.rollSize   
	  	* 缺省值:1024字节   
	  	* 0禁用  
	  * 基于event数量  
	  	* hdfs.rollCount   
	  	* 缺省值:10  
	  	* 0禁用  
	  * 基于文件空闲时间  
	  	* hdfs.idleTimeout  
	  	* 缺省值:0  
	  	* 0禁用  
	  * 基于HDFS文件副本数  
	  	* hdfs.minBlockReplicas  
	  	* 默认:与HDFS的副本数一致   
	  	* 要将该参数设置为1;否则HFDS文件所在块的复制会引起文件滚动  
	    
	  其他重要配置:  
	  * hdfs.useLocalTimeStamp  
	  	* 使用本地时间，而不是event header的时间戳  
	  	* 默认值:false  
	  * hdfs.round  
	  	* 时间戳是否四舍五入  
	  	* 默认值false   
	  	* 如果为true，会影响所有的时间，除了t%  
	  * hdfs.roundValue  
	  	* 四舍五入的最高倍数(单位配置在hdfs.roundUnit)，但是要小于当前时间  
	  	* 默认值:1  
	  * hdfs.roundUnit  
	  	* 可选值为:second、minute、hour   
	  	* 默认值:second 

		- 避免生成小文件的配置
		  如果要避免HDFS Sink产生小文件，参考如下参数设置:  
		    
		  ```sh  
		  a1.sinks.k1.type=hdfs  
		  a1.sinks.k1.hdfs.useLocalTimeStamp=true  
		  a1.sinks.k1.hdfs.path=hdfs://linux121:9000/flume/events/%Y/%m/%d/  
		  %H/%M  
		  a1.sinks.k1.hdfs.minBlockReplicas=1  
		  a1.sinks.k1.hdfs.rollInterval=3600  
		  a1.sinks.k1.hdfs.rollSize=0  
		  a1.sinks.k1.hdfs.rollCount=0  
		  a1.sinks.k1.hdfs.idleTimeout=0  
		  ```

	- Hive sink
	  该sink streams 将包含分割文本或者JSON数据的events直接传送 到Hive表或分区中。使用Hive 事务写events。当一系列events提交到Hive时，它们 马上可以被Hive查询到

	- HBase sink
	  保存到HBase中

	- kafka sink
	  保存到kafka中

### 入门案例

flume帮助文档  
[http://flume.apache.org/FlumeUserGuide.html](http://flume.apache.org/FlumeUserGuide.html)  
  
业务需求:监听本机 8888 端口，Flume将监听的数据实时显示在控制台   
  
需求分析:  
* 使用 telnet 工具可以向 8888 端口发送数据   
* 监听端口数据，选择 netcat source   
* channel 选择 memory   
* 数据实时显示，选择 logger sink

- 1. 安装 telnet 工具

  ```sh  
  yum install -y telnet  
    
  brew install telnet  
  ```

- 2. 检查 8888 端口是否被占用
  如果该端口被占用，可以选择使用其他端口完成任务  
    
  ```sh  
  lsof -i:8888  
  ```

- 3. 创建 Flume Agent 配置文件
  vim flume-netcat-logger.conf  
  文件位置随意，建议放在flume/conf目录下  
    
  ```sh  
  # example.conf: A single-node Flume configuration  
    
  # Name the components on this agent  
  a1.sources = r1  
  a1.sinks = k1  
  a1.channels = c1  
    
  # Describe/configure the source  
  a1.sources.r1.type = netcat  
  a1.sources.r1.bind = centos7-3  
  a1.sources.r1.port = 8888  
    
  # Describe the sink  
  a1.sinks.k1.type = logger  
    
  # Use a channel which buffers events in memory  
  a1.channels.c1.type = memory  
  a1.channels.c1.capacity = 1000  
  a1.channels.c1.transactionCapacity = 100  
    
  # Bind the source and sink to the channel  
  a1.sources.r1.channels = c1  
  a1.sinks.k1.channel = c1  
  ```  
    
  Memory Channel 是使用内存缓冲Event的Channel实现。速度比较快速，容量会受 到 jvm 内存大小的限制，可靠性不够高。适用于允许丢失数据，但对性能要求较高 的日志采集业务。

- 4. 启动Flume Agent
  ```sh  
  $FLUME_HOME/bin/flume-ng agent --name a1 \  
  --conf-file $FLUME_HOME/conf/flume-netcat-logger.conf \  
  -Dflume.root.logger=INFO,console  
  ```  
    
  * name。定义agent的名字，要与参数文件一致  
  * conf-file。指定参数文件位置  
  * `-D`表示flume运行时动态修改 flume.root.logger 参数属性值，并将控制台日志 打印级别设置为INFO级别。日志级别包括:log、info、warn、error

- 5. 使用 telnet 向本机的 8888 端口发送消息
  ```sh  
  telnet centos7-3 8888  
  ```

- 6. 在 Flume 监听页面查看数据接收情况
  ```sh  
  21/02/03 11:32:21 INFO instrumentation.MonitoredCounterGroup: Component type: CHANNEL, name: c1 started  
  21/02/03 11:32:21 INFO node.Application: Starting Sink k1  
  21/02/03 11:32:21 INFO node.Application: Starting Source r1  
  21/02/03 11:32:21 INFO source.NetcatSource: Source starting  
  21/02/03 11:32:21 INFO source.NetcatSource: Created serverSocket:sun.nio.ch.ServerSocketChannelImpl[/172.16.134.6:8888]  
  21/02/03 11:33:23 INFO sink.LoggerSink: Event: { headers:{} body: 48 65 6C 6C 6F 20 77 6F 72 6C 64 0D             Hello world. }  
  21/02/03 11:33:32 INFO sink.LoggerSink: Event: { headers:{} body: 49 20 61 6D 20 61 70 72 69 6C 0D                I am april. }  
  21/02/03 11:34:58 INFO sink.LoggerSink: Event: { headers:{} body: 68 65 6C 6C 6F 20 66 72 6F 6D 20 6D 61 63 0D    hello from mac. }  
  ```

### 监控日志文件信息到HDFS

业务需求:监控本地日志文件，收集内容实时上传到HDFS  
需求分析:  
* 使用 tail -F 命令即可找到本地日志文件产生的信息  
* source 选择 exec。exec 监听一个指定的命令，获取命令的结果作为数据源。 source组件从这个命令的结果中取数据。当agent进程挂掉重启后，可能存在数 据丢失;  
* channel 选择 memory  
* sink 选择 HDFS  
  
```sh  
tail -f 等同于--follow=descriptor，根据文件描述符进行追踪，当文件改名或被删除，追踪停止  
  
tail -F  
等同于--follow=name --retry，根据文件名进行追踪，并保持重试，即该文件被删除 或改名后，如果再次创建相同的文件名，会继续追踪  
```

- 1. 环境准备
  Flume要想将数据输出到HDFS，必须持有Hadoop相关jar包。将  
  `commons-configuration-1.6.jar` `hadoop-auth-2.9.2.jar` `hadoop-common-2.9.2.jar` `hadoop-hdfs-2.9.2.jar` `commons-io-2.4.jar` `htrace-core4-4.1.0-incubating.jar`  
    
  拷贝到 $FLUME_HOME/lib 文件夹下  
    
  ```sh  
  # 在 $HADOOP_HOME/share/hadoop/httpfs/tomcat/webapps/webhdfs/WEB- INF/lib 有这些文件  
  cd $HADOOP_HOME/share/hadoop/httpfs/tomcat/webapps/webhdfs/WEB- INF/lib  
  cp commons-configuration-1.6.jar $FLUME_HOME/lib/  
  cp hadoop-auth-2.9.2.jar $FLUME_HOME/lib/  
  cp hadoop-common-2.9.2.jar $FLUME_HOME/lib/  
  cp hadoop-hdfs-2.9.2.jar $FLUME_HOME/lib/  
  cp commons-io-2.4.jar $FLUME_HOME/lib/  
  cp htrace-core4-4.1.0-incubating.jar $FLUME_HOME/lib/  
  ```

- 2. 创建配置文件
  vim flume-exec-hdfs.conf   
    
  ```sh  
  # Name the components on this agent  
  a2.sources = r2  
  a2.sinks = k2  
  a2.channels = c2  
    
  # Describe/configure the source  
  a2.sources.r2.type = exec  
  a2.sources.r2.command = tail -F /tmp/root/hive.log  
    
  # Use a channel which buffers events in memory  
  a2.channels.c2.type = memory  
  a2.channels.c2.capacity = 10000  
  a2.channels.c2.transactionCapacity = 500  
    
  # Describe the sink  
  a2.sinks.k2.type = hdfs  
  a2.sinks.k2.hdfs.path = hdfs://centos7-1:9000/flume/%Y%m%d/%H%M  
  # 上传文件的前缀  
  a2.sinks.k2.hdfs.filePrefix = logs-  
  # 是否使用本地时间戳  
  a2.sinks.k2.hdfs.useLocalTimeStamp = true  
  # 积攒500个Event才flush到HDFS一次  
  a2.sinks.k2.hdfs.batchSize = 500  
  # 设置文件类型，支持压缩。DataStream没启用压缩   
  a2.sinks.k2.hdfs.fileType = DataStream  
  # 1分钟滚动一次  
  a2.sinks.k2.hdfs.rollInterval = 60  
  # 128M滚动一次  
  a2.sinks.k2.hdfs.rollSize = 134217700  
  # 文件的滚动与Event数量无关  
  a2.sinks.k2.hdfs.rollCount = 0  
  # 最小冗余数  
  a2.sinks.k2.hdfs.minBlockReplicas = 1  
    
  # Bind the source and sink to the channel  
  a2.sources.r2.channels = c2  
  a2.sinks.k2.channel = c2  
  ```

- 3. 启动Agent
  ```sh  
  $FLUME_HOME/bin/flume-ng agent --name a2 \  
  --conf-file ~/conf/flume-exec-hdfs.conf \  
  -Dflume.root.logger=INFO,console  
  ```

- 4. 启动Hadoop和Hive，操作Hive产生日志
  ```sh  
  start-dfs.sh start-yarn.sh  
  # 在命令行多次执行  
  hive -e "show databases"  
  ```

- 5. 在HDFS上查看文件

### 监控目录采集信息到HDFS

业务需求:监控指定目录，收集信息实时上传到HDFS   
需求分析:  
* source 选择 spooldir。spooldir 能够保证数据不丢失，且能够实现断点续传， 但延迟较高，不能实时监控  
* channel 选择 memory  
* sink 选择 HDFS  
spooldir Source监听一个指定的目录，即只要向指定目录添加新的文件，source组 件就可以获取到该信息，并解析该文件的内容，写入到channel。sink处理完之后， 标记该文件已完成处理，文件名添加 .completed 后缀。虽然是自动监控整个目录， 但是只能监控文件，如果以追加的方式向已被处理的文件中添加内容，source并不 能识别。需要注意的是:  
* 拷贝到spool目录下的文件不可以再打开编辑   
* 无法监控子目录的文件夹变动   
* 被监控文件夹每500毫秒扫描一次文件变动   
* 适合用于同步新文件，但不适合对实时追加日志的文件进行监听并同步

- 1. 创建配置文件
  vim flume-spooldir-hdfs.conf  
    
  ```sh  
  # Name the components on this agent  
  a3.sources = r3  
  a3.channels = c3  
  a3.sinks = k3  
    
  # Describe/configure the source  
  a3.sources.r3.type = spooldir  
  a3.sources.r3.spoolDir = /root/upload  
  a3.sources.r3.fileSuffix = .COMPLETED  
  a3.sources.r3.fileHeader = true  
  # 忽略以.tmp结尾的文件，不上传   
  a3.sources.r3.ignorePattern = ([^ ]*\.tmp)  
    
  # Use a channel which buffers events in memory  
  a3.channels.c3.type = memory  
  a3.channels.c3.capacity = 10000  
  a3.channels.c3.transactionCapacity = 500  
    
  # Describe the sink  
  a3.sinks.k3.type = hdfs   
  a3.sinks.k3.hdfs.path = hdfs://centos7-1:9000/flume/upload/%Y%m%d/%H%M   
  # 上传文件的前缀  
  a3.sinks.k3.hdfs.filePrefix = upload-  
  # 是否使用本地时间戳   
  a3.sinks.k3.hdfs.useLocalTimeStamp = true   
  # 积攒500个Event，flush到HDFS一次   
  a3.sinks.k3.hdfs.batchSize = 500  
  # 设置文件类型  
  a3.sinks.k3.hdfs.fileType = DataStream   
  # 60秒滚动一次   
  a3.sinks.k3.hdfs.rollInterval = 60  
  # 128M滚动一次  
  a3.sinks.k3.hdfs.rollSize = 134217700   
  # 文件滚动与event数量无关   
  a3.sinks.k3.hdfs.rollCount = 0  
  # 最小冗余数   
  a3.sinks.k3.hdfs.minBlockReplicas = 1  
    
  # Bind the source and sink to the channel  
  a3.sources.r3.channels = c3  
  a3.sinks.k3.channel = c3  
  ```

- 2. 启动Agent
  ```sh  
  $FLUME_HOME/bin/flume-ng agent --name a3 \  
  --conf-file ~/conf/flume-spooldir-hdfs.conf \  
  -Dflume.root.logger=INFO,console  
  ```

- 3. 向upload文件夹中添加文件

- 4. 查看HDFS上的数据

### 监控日志文件采集数据到HDFS、本地文件系统<br>
![](/resource/flume/assets/5C78064D-9588-49B3-9D21-5D33C8073A07.png)

业务需求:监控日志文件，收集信息上传到HDFS 和 本地文件系统   
需求分析:  
* 需要多个Agent级联实现  
* source 选择 taildir  
* channel 选择 memory  
* 最终的 sink 分别选择 hdfs、file_roll  
  
taildir Source。Flume 1.7.0加入的新Source，相当于 spooldir source + exec source。可以监控多个目录，并且使用正则表达式匹配该目录中的文件名进行实时 收集。实时监控一批文件，并记录每个文件最新消费位置，agent进程重启后不会有 数据丢失的问题。  
  
目前不适用于Windows系统;其不会对于跟踪的文件有任何处理，不会重命名也不 会删除，不会做任何修改。不支持读取二进制文件，支持一行一行的读取文本文件。

- 1. 创建第一个配置文件
  flume-taildir-avro.conf 配置文件包括:  
  * 1个 taildir source   
  * 2个 memory channel   
  * 2个 avro sink  
    
  ```sh  
  # Name the components on this agent  
  a1.sources = r1  
  a1.sinks = k1 k2  
  a1.channels = c1 c2  
  # 将数据流复制给所有channel   
  a1.sources.r1.selector.type = replicating  
    
  # source  
  a1.sources.r1.type = taildir  
  # 记录每个文件最新消费位置  
  a1.sources.r1.positionFile = /root/flume/taildir_position.json   
  a1.sources.r1.filegroups = f1  
  # 备注:.*log 是正则表达式;这里写成 *.log 是错误的   
  a1.sources.r1.filegroups.f1 = /tmp/root/.*log  
    
  # sink  
  a1.sinks.k1.type = avro  
  a1.sinks.k1.hostname = centos7-3  
  a1.sinks.k1.port = 9091  
    
  a1.sinks.k2.type = avro  
  a1.sinks.k2.hostname = centos7-3  
  a1.sinks.k2.port = 9092  
    
  # channel  
  a1.channels.c1.type = memory  
  a1.channels.c1.capacity = 10000  
  a1.channels.c1.transactionCapacity = 500  
    
  a1.channels.c2.type = memory  
  a1.channels.c2.capacity = 10000  
  a1.channels.c2.transactionCapacity = 500  
    
  # Bind the source and sink to the channel  
  a1.sources.r1.channels = c1 c2  
  a1.sinks.k1.channel = c1  
  a1.sinks.k2.channel = c2  
  ```

- 2. 创建第二个配置文件
  flume-avro-hdfs.conf配置文件包括:  
  * 1个 avro source  
  * 1个 memory channel   
  * 1个 hdfs sink  
    
  ```sh  
  # Name the components on this agent  
  a2.sources = r1  
  a2.sinks = k1  
  a2.channels = c1  
    
  # Describe/configure the source  
  a2.sources.r1.type = avro  
  a2.sources.r1.bind = centos7-3  
  a2.sources.r1.port = 9091  
    
  # Describe the channel  
  a2.channels.c1.type = memory  
  a2.channels.c1.capacity = 10000  
  a2.channels.c1.transactionCapacity = 500  
    
    
  # Describe the sink  
  a2.sinks.k1.type = hdfs  
  a2.sinks.k1.hdfs.path = hdfs://centos7-1:9000/flume2/%Y%m%d/%H  
    
  # 上传文件的前缀  
  a2.sinks.k1.hdfs.filePrefix = flume2-  
  # 是否使用本地时间戳   
  a2.sinks.k1.hdfs.useLocalTimeStamp = true   
  # 500个Event才flush到HDFS一次   
  a2.sinks.k1.hdfs.batchSize = 500  
  # 设置文件类型，可支持压缩   
  a2.sinks.k1.hdfs.fileType = DataStream  
  # 60秒生成一个新的文件   
  a2.sinks.k1.hdfs.rollInterval = 60   
  a2.sinks.k1.hdfs.rollSize = 0   
  a2.sinks.k1.hdfs.rollCount = 0   
  a2.sinks.k1.hdfs.minBlockReplicas = 1  
    
  # Bind the source and sink to the channel  
  a2.sources.r1.channels = c1  
  a2.sinks.k1.channel = c1  
  ```

- 3. 创建第三个配置文件
  flume-avro-file.conf配置文件包括:  
  * 1个 avro source  
  * 1个 memory channel   
  * 1个 file_roll sink  
    
  ```sh  
  # Name the components on this agent  
  a3.sources = r1  
  a3.sinks = k1  
  a3.channels = c2  
    
  # Describe/configure the source  
  a3.sources.r1.type = avro  
  a3.sources.r1.bind = centos7-3  
  a3.sources.r1.port = 9092  
    
  # Describe the sink  
  a3.sinks.k1.type = file_roll  
  # 目录需要提前创建好  
  a3.sinks.k1.sink.directory = /root/flume/output  
    
  # Describe the channel  
  a3.channels.c2.type = memory  
  a3.channels.c2.capacity = 10000  
  a3.channels.c2.transactionCapacity = 500  
    
  # Bind the source and sink to the channel  
  a3.sources.r1.channels = c2  
  a3.sinks.k1.channel = c2  
  ```

- 4. 分别启动3个Agent
  ```sh  
  $FLUME_HOME/bin/flume-ng agent --name a3 \  
  --conf-file ~/conf/flume-avro-file.conf \  
  -Dflume.root.logger=INFO,console &  
  $FLUME_HOME/bin/flume-ng agent --name a2 \  
  --conf-file ~/conf/flume-avro-hdfs.conf \  
  -Dflume.root.logger=INFO,console &  
  $FLUME_HOME/bin/flume-ng agent --name a1 \  
  --conf-file ~/conf/flume-taildir-avro.conf \  
  -Dflume.root.logger=INFO,console &  
  ```

- 5. 执行hive命令产生日志
  ```sh  
  hive -e "show databases"  
  ```

- 6. 分别检查HDFS文件、本地文件、以及消费位置文件

## 高级特性

### 拦截器 Interceptor

Flume支持在运行时对event进行修改或丢弃，通过拦截器来实现;   
Flume里面的拦截器是实现了org.apache.flume.interceptor.Interceptor 接口的类;  
拦截器可以根据配置 修改 甚至 丢弃 event;   
Flume也支持链式的拦截器执行方式，在配置文件里面配置多个拦截器就可以了;   
拦截器的顺序取决于它们配置的顺序，Event 按照顺序经过每一个拦截器;

- Timestamp Interceptor<br>
![](/resource/flume/assets/EFB760E9-0A1B-4B10-ADB5-B6D4E356DDC0.png)
  这个拦截器会向每个event的header中添加一个时间戳属性进去，key默认是 “timestamp ”(也可以通过下面表格中的header来自定义)，value就是当前的毫秒 值(其实就是用System.currentTimeMillis()方法得到的)。如果event已经存在同名 的属性，可以选择是否保留原始的值。

	- 配置文件
	  ```sh  
	  # 这部分是新增 时间拦截器的 内容 a1.sources.r1.interceptors = i1 a1.sources.r1.interceptors.i1.type = timestamp  
	  # 是否保留Event header中已经存在的同名时间戳，缺省值false a1.sources.r1.interceptors.i1.preserveExisting= false # 这部分是新增 时间拦截器的 内容  
	  ```

- Host Interceptor<br>
![](/resource/flume/assets/5C0FA803-952A-4433-9680-9569995E2DD7.png)
  这个拦截器会把当前Agent的 hostname 或者 IP 地址写入到Event的header中，key 默认是“host”(也可以通过配置自定义key)，value可以选择使用hostname或者IP 地址。

	- 配置文件
	  ```sh  
	  a1.sources = r1  
	  a1.channels = c1  
	  a1.sources.r1.interceptors = i1  
	  a1.sources.r1.interceptors.i1.type = host  
	  # 如果header中已经存在同名的属性是否保留 a1.sources.r1.interceptors.i1.preserveExisting= false   
	  # true:使用IP地址;false:使用hostname a1.sources.r1.interceptors.i1.useIP = false  
	  ```

### 选择器 selector

source可以向多个channel同时写数据，所以也就产生了以何种方式向多个channel写的问题:  
* replication(复制，缺省)。数据完整地发送到每一个channel;  
* multiplexing(多路复用)。通过配置来按照一定的规则进行分发;

- 复制选择器 replicating<br>
![](/resource/flume/assets/BEEF88D4-CC2A-49A9-8461-48C34F0853E5.png)
  ```sh  
  a1.sources = r1  
  a1.channels = c1 c2 c3  
  a1.sources.r1.selector.type = replicating  
  a1.sources.r1.channels = c1 c2 c3  
  a1.sources.r1.selector.optional = c3  
  ```  
    
  上面这个例子中，c3配置成了可选的。向c3发送数据如果失败了会被忽略。c1和c2 没有配置成可选的，向c1和c2写数据失败会导致事务失败回滚。

- 多路复用选择器 multiplexing<br>
![](/resource/flume/assets/0CF80291-0EE4-414C-BD24-97EF01F02ECF.png)
  ```sh  
  a1.sources = r1  
  a1.channels = c1 c2 c3 c4 a1.sources.r1.selector.type = multiplexing   
    
  #以每个Event的header中的state这个属性的值作为选择channel的依据   
  a1.sources.r1.selector.header = state   
    
   #如果state=CZ，则选择c1这个channel   
  a1.sources.r1.selector.mapping.CZ = c1   
    
   #如果state=US，则选择c2 和 c3 这两个channel   
  a1.sources.r1.selector.mapping.US = c2 c3  
    
   #默认使用c4这个channel  
  a1.sources.r1.selector.default = c4  
  ```

- 自定义选择器<br>
![](/resource/flume/assets/DC9A8178-5833-4A05-A006-EC74902B2A94.png)
  自定义选择器就是开发一个 org.apache.flume.ChannelSelector 接口的实现类。实现 类以及依赖的jar包在启动时候都必须放入Flume的classpath。  
    
  ```sh  
  a1.sources = r1  
  a1.channels = c1  
  a1.sources.r1.selector.type =  
  org.flume.channel.MyChannelSelector  
  ```

### 逻辑处理器Sink Processor<br>
![](/resource/flume/assets/8B756232-0795-4952-86F3-83D70C0F1DAA.png)

可以把多个sink分成一个组， Sink组逻辑处理器可以对这同一个组里的几个sink进行负载均衡 或者 其中一个sink发生故障后将输出Event的任务转移到其他的sink上。  
  
N个sink将Event输出到对应的N个目的地的，通过 Sink组逻辑处理器 可以把这N个sink配置成负载均衡或者故障转移的工作方式:  
* 负载均衡是将channel里面的Event，按照配置的负载机制(比如轮询)分别发 送到sink各自对应的目的地   
* 故障转移是这N个sink同一时间只有一个在工作，其余的作为备用，工作的sink 挂掉之后备用的sink顶上

- 默认
  默认的组逻辑处理器就是只有一个sink的情况，这种情况就没必要配置sink组了。前面的例子都是 source - channel - sink这种一对一，单个sink的。

- 故障转移 Failover<br>
![](/resource/flume/assets/D6C8BBB0-CED2-4B8B-A98D-14CAF347E414.png)
  故障转移组逻辑处理器维护了一个发送Event失败的sink的列表，保证有一个sink是 可用的来发送Event。  
    
  故障转移机制的工作原理是将故障sink降级到一个池中，在池中为它们分配冷却期 (超时时间)，在重试之前随顺序故障而增加。 Sink成功发送事件后，它将恢复到 实时池。sink具有与之相关的优先级，数值越大，优先级越高。 如果在发送Event时 Sink发生故障，会继续尝试下一个具有最高优先级的sink。 例如，在优先级为80的 sink之前激活优先级为100的sink。如果未指定优先级，则根据配置中的顺序来选 取。  
    
  要使用故障转移选择器，不仅要设置sink组的选择器为failover，还有为每一个sink 设置一个唯一的优先级数值。 可以使用 maxpenalty 属性设置故障转移时间的上限 (毫秒)。

	- 配置文件
	  ```sh  
	  a1.sinkgroups = g1  
	  a1.sinkgroups.g1.sinks = k1 k2  
	  a1.sinkgroups.g1.processor.type = failover  
	  a1.sinkgroups.g1.processor.priority.k1 = 5  
	  a1.sinkgroups.g1.processor.priority.k2 = 10  
	  a1.sinkgroups.g1.processor.maxpenalty = 10000  
	  ```

- 负载均衡 Load balancing<br>
![](/resource/flume/assets/9518A008-F7CB-4D48-8D17-1C3C0FEEF3B9.png)
  负载均衡Sink 选择器提供了在多个sink上进行负载均衡流量的功能。 它维护一个活 动sink列表的索引来实现负载的分配。 支持轮询( round_robin )【默认值】和随 机( random )两种选择机制分配负载。  
    
  工作时，此选择器使用其配置的选择机制选择下一个sink并调用它。 如果所选sink无 法正常工作，则处理器通过其配置的选择机制选择下一个可用sink。 此实现不会将 失败的Sink列入黑名单，而是继续乐观地尝试每个可用的Sink。  
    
  如果所有sink调用都失败了，选择器会将故障抛给sink的运行器。  
    
  如果 backoff 设置为true则启用了退避机制，失败的sink会被放入黑名单，达到一定 的超时时间后会自动从黑名单移除。 如从黑名单出来后sink仍然失败，则再次进入 黑名单而且超时时间会翻倍，以避免在无响应的sink上浪费过长时间。 如果没有启 用退避机制，在禁用此功能的情况下，发生sink传输失败后，会将本次负载传给下一 个sink继续尝试，因此这种情况下是不均衡的。

	- 配置文件
	  ```sh  
	  a1.sinkgroups = g1  
	  a1.sinkgroups.g1.sinks = k1 k2  
	  a1.sinkgroups.g1.processor.type = load_balance  
	  a1.sinkgroups.g1.processor.backoff = true  
	  a1.sinkgroups.g1.processor.selector = random  
	  ```

### 事务机制与可靠性

一提到事务，首先就想到的是关系型数据库中的事务，事务一个典型的特征就是将一批操作做成原子性的，要么都成功，要么都失败。  
  
在Flume中一共有两个事务:  
* Put事务。在Source到Channel之间 * Take事务。Channel到Sink之间  
  
从 Source 到 Channel 过程中，数据在 Flume 中会被封装成 Event 对象，也就是一 批 Event ，把这批 Event 放到一个事务中，把这个事务也就是这批event一次性的放 入Channel 中。同理，Take事务的时候，也是把这一批event组成的事务统一拿出来 到sink放到HDFS上。

- Flume中的 Put 事务
  * 事务开始的时候会调用一个 doPut 方法， doPut 方法将一批数据放在putList中;  
  	* putList在向 Channel 发送数据之前先检查 Channel 的容量能否放得下，如 果放不下一个都不放，只能doRollback;  
  	* 数据批的大小取决于配置参数 batch size 的值;   
  	* putList的大小取决于配置 Channel 的参数 transaction capacity 的大 小，该参数大小就体现在putList上;(Channel的另一个参数 capacity 指 的是 Channel 的容量);  
  * 数据顺利的放到putList之后，接下来可以调用 doCommit 方法，把putList中所有 的 Event 放到 Channel 中，成功放完之后就清空putList;

	- doRollback
	  在doCommit提交之后，事务在向 Channel 存放数据的过程中，事务容易出问题。 如 Sink取数据慢，而 Source 放数据速度快，容易造成 Channel 中数据的积压，如果 putList 中的数据放不进去，会如何呢?  
	    
	  此时会调用 doRollback 方法，doRollback方法会进行两项操作:将putList清空; 抛出 ChannelException异常。source会捕捉到doRollback抛出的异常，然后source 就将刚才的一批数据重新采集，然后重新开始一个新的事务，这就是事务的回滚。

- Flume中的 Take 事务<br>
![](/resource/flume/assets/77250D30-8C15-4B6E-9139-DDEB04FC9B93.png)
  Take事务同样也有takeList，HDFS sink配置有一个 batch size，这个参数决定 Sink 从 Channel 取数据的时候一次取多少个，所以该 batch size 得小于 takeList 的大 小，而takeList的大小取决于 transaction capacity 的大小，同样是channel 中的 参数。  
    
  Take事务流程:  
  * doTake方法会将channel中的event剪切到takeList中。如果后面接的是HDFS Sink的话，在把Channel中的event剪切到takeList中的同时也往写入HDFS的IO 缓冲流中放一份event(数据写入HDFS是先写入IO缓冲流然后flush到HDFS);  
  * 当takeList中存放了batch size 数量的event之后，就会调用doCommit方法， doCommit方法会做两个操作:  
  	* 针对HDFS Sink，手动调用IO流的flush方法，将IO流缓冲区的数据写入到 HDFS磁盘中;  
  	* 清空takeList中的数据

	- doRollback
	  flush到HDFS的时候组容易出问题。flush到HDFS的时候，可能由于网络原因超时导 致数据传输失败，这个时候调用doRollback方法来进行回滚，回滚的时候由于 takeList 中还有备份数据，所以将takeList中的数据原封不动地还给channel，这时 候就完成了事务的回滚。  
	    
	  但是，如果flush到HDFS的时候，数据flush了一半之后出问题了，这意味着已经有 一半的数据已经发送到HDFS上面了，现在出了问题，同样需要调用doRollback方法 来进行回滚，回滚并没有“一半”之说，它只会把整个takeList中的数据返回给 channel，然后继续进行数据的读写。这样开启下一个事务的时候容易造成数据重复 的问题。  
	    
	  Flume在数据进行采集传输的时候，有可能会造成数据的重复，但不会丢失数据。

- Flume数据传输的可靠性
  Flume在数据传输的过程中是否可靠，还需要考虑具体使用Source、Channel、Sink 的类型。  
    
  * 分析Source  
  	* exec Source ，后面接 tail -f ，这个数据也是有可能丢的  
  	* TailDir Source ，这个是不会丢数据的，它可以保证数据不丢失  
    
  * 分析sink  
  	* Hdfs Sink，数据有可能重复，但是不会丢失  
  * 最后，分析channel。理论上说:要想数据不丢失的话，还是要用 File channel;memory channel 在 Flume 挂掉的时候是有可能造成数据的丢失 的。  
  * 如果使用 TailDir source 和 HDFS sink，所以数据会重复但是不会丢失

## 高可用案例<br>
![](/resource/flume/assets/6839E746-C42A-493C-84D8-355DBD93F875.png)

案例:实现Agent的故障转移

### 1. 配置环境

在centos7-1、centos7-2上部署Flume、修改环境变量  
  
```sh  
# 在centos7-3上执行 /opt/lagou/servers  
scp -r flume-1.9.0/ centos7-1:$PWD   
  
scp -r flume-1.9.0/ centos7-2:$PWD  
  
cd /etc  
scp profile centos7-1:$PWD  
scp profile centos7-2:$PWD  
  
# 在centos7-1、centos7-2上分别执行 source /etc/profile  
```

### 2. centos-3配置文件

flume-taildir-avro.conf  
  
```sh  
# agent name  
a1.sources = r1  
a1.channels = c1  
a1.sinks = k1 k2  
  
# source  
a1.sources.r1.type = TAILDIR  
a1.sources.r1.positionFile = /root/flume_log/taildir_position.json  
a1.sources.r1.filegroups = f1  
a1.sources.r1.filegroups.f1 = /tmp/root/.*log  
a1.sources.r1.fileHeader = true  
  
  
# interceptor  
a1.sources.r1.interceptors = i1 i2   
a1.sources.r1.interceptors.i1.type = static   
a1.sources.r1.interceptors.i1.key = Type   
a1.sources.r1.interceptors.i1.value = LOGIN  
# 在event header添加了时间戳   
a1.sources.r1.interceptors.i2.type = timestamp  
  
# channel  
a1.channels.c1.type = memory  
a1.channels.c1.capacity = 10000  
a1.channels.c1.transactionCapacity = 500  
  
# sink group  
a1.sinkgroups = g1  
a1.sinkgroups.g1.sinks = k1 k2  
  
  
# set sink1  
a1.sinks.k1.type = avro  
a1.sinks.k1.hostname = centos7-1  
a1.sinks.k1.port = 9999  
  
# set sink2  
a1.sinks.k2.type = avro  
a1.sinks.k2.hostname = centos7-2  
a1.sinks.k2.port = 9999  
  
# set failover  
a1.sinkgroups.g1.processor.type = failover  
a1.sinkgroups.g1.processor.priority.k1 = 100  
a1.sinkgroups.g1.processor.priority.k2 = 60  
a1.sinkgroups.g1.processor.maxpenalty = 10000  
  
a1.sources.r1.channels = c1  
a1.sinks.k1.channel = c1  
a1.sinks.k2.channel = c1  
```

### 3. centos-1配置文件

flume-avro-hdfs.conf  
  
```sh  
# set Agent name  
a2.sources = r1  
a2.channels = c1  
a2.sinks = k1  
  
# Source  
a2.sources.r1.type = avro  
a2.sources.r1.bind = centos7-1  
a2.sources.r1.port = 9999  
  
# interceptor  
a2.sources.r1.interceptors = i1  
a2.sources.r1.interceptors.i1.type = static  
a2.sources.r1.interceptors.i1.key = Collector  
a2.sources.r1.interceptors.i1.value = centos7-1  
  
# set channel  
a2.channels.c1.type = memory  
a2.channels.c1.capacity = 10000  
a2.channels.c1.transactionCapacity = 500  
  
# HDFS Sink  
a2.sinks.k1.type=hdfs  
a2.sinks.k1.hdfs.path=hdfs://centos7-1:9000/flume/failover/  
a2.sinks.k1.hdfs.fileType=DataStream  
a2.sinks.k1.hdfs.writeFormat=TEXT  
a2.sinks.k1.hdfs.rollInterval=60  
a2.sinks.k1.hdfs.filePrefix=%Y-%m-%d  
a2.sinks.k1.hdfs.minBlockReplicas=1  
a2.sinks.k1.hdfs.rollSize=0  
a2.sinks.k1.hdfs.rollCount=0  
a2.sinks.k1.hdfs.idleTimeout=0  
  
a2.sources.r1.channels = c1  
a2.sinks.k1.channel=c1  
```

### 4. centos-2配置文件

flume-avro-hdfs.conf  
  
```sh  
# set Agent name  
a3.sources = r1  
a3.channels = c1  
a3.sinks = k1  
  
# Source  
a3.sources.r1.type = avro  
a3.sources.r1.bind = centos7-2  
a3.sources.r1.port = 9999  
  
# interceptor  
a3.sources.r1.interceptors = i1  
a3.sources.r1.interceptors.i1.type = static  
a3.sources.r1.interceptors.i1.key = Collector  
a3.sources.r1.interceptors.i1.value = centos7-2  
  
# set channel  
a3.channels.c1.type = memory  
a3.channels.c1.capacity = 10000  
a3.channels.c1.transactionCapacity = 500  
  
# HDFS Sink  
a3.sinks.k1.type=hdfs  
a3.sinks.k1.hdfs.path=hdfs://centos7-1:9000/flume/failover/  
a3.sinks.k1.hdfs.fileType=DataStream  
a3.sinks.k1.hdfs.writeFormat=TEXT  
a3.sinks.k1.hdfs.rollInterval=60  
a3.sinks.k1.hdfs.filePrefix=%Y-%m-%d  
a3.sinks.k1.hdfs.minBlockReplicas=1  
a3.sinks.k1.hdfs.rollSize=0  
a3.sinks.k1.hdfs.rollCount=0  
a3.sinks.k1.hdfs.idleTimeout=0  
  
a3.sources.r1.channels = c1  
a3.sinks.k1.channel=c1  
  
```

### 5. 按顺序启动flume

分别在centos7-1、centos7-2、centos7-3上启动对应服务(先启动下游的agent)  
  
```sh  
# centos7-1  
flume-ng agent --name a2 --conf-file ~/conf/flume-avro-hdfs.conf  
  
# centos7-2  
flume-ng agent --name a3 --conf-file ~/conf/flume-avro-hdfs.conf  
  
# centos7-3  
flume-ng agent --name a1 --conf-file ~/conf/flume-taildir-  
avro2.conf  
```

### 6. 先hive.log中写入数据，检查HDFS目录

### 7. 杀掉一个Agent，看看另外Agent是否能启动

