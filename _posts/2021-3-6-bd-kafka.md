---
layout: post
title:  "Kfaka--高吞吐消息中间件"
date:   2021-3-6
categories: big data
---
##  Kafka架构与实战

### 概念和基本架构

- 介绍
  Kafka是最初由Linkedin公司开发，是一个分布式、分区的、多副本的、多生产者、多订阅者，基 于zookeeper协调的分布式日志系统(也可以当做MQ系统)，常见可以用于web/nginx日志、访问日 志，消息服务等等  
  主要应用场景是:日志收集系统和消息系统。

	- Kafka主要设计目标
	  * 以时间复杂度为O(1)的方式提供消息持久化能力，即使对TB级以上数据也能保证常数时间的 访问性能。  
	  * 高吞吐率。即使在非常廉价的商用机器上也能做到单机支持每秒100K条消息的传输。  
	  * 支持Kafka Server间的消息分区，及分布式消费，同时保证每个partition内的消息顺序传输。  
	  * 同时支持离线数据处理和实时数据处理。  
	  * 支持在线水平扩展

	- 架构<br>
![](/resource/kafka/assets/8FEDCF16-2568-4026-AE1D-D236C208DF65.png)
	  有两种主要的消息传递模式:点对点传递模式、发布-订阅模式。大部分的消息系统选用发布-订阅 模式。Kafka就是一种发布-订阅模式。  
	  对于消息中间件，消息分推拉两种模式。Kafka只有消息的拉取，没有推送，可以通过轮询实现消 息的推送。  
	    
	  1. Kafka在一个或多个可以跨越多个数据中心的服务器上作为集群运行。  
	  2. Kafka集群中按照主题分类管理，一个主题可以有多个分区，一个分区可以有多个副本分区。   
	  3. 每个记录由一个键，一个值和一个时间戳组成。

		- 四个核心API

			- Producer API
			  允许应用程序将记录流发布到一个或多个Kafka主题。

			- Consumer API
			  允许应用程序订阅一个或多个主题并处理为其生成的记录流

			- Streams API
			  允许应用程序充当流处理器，使用一个或多个主题的输入流，并生成一个或多个输出主题的输出流，从而有效地将输入流转换为输出流。

			- Connector API
			  允许构建和运行将Kafka主题连接到现有应用程序或数据系统的可重用生产者或使用者。例如，关系数据库的连接器可能会捕获对表的所有更改。

- Kafka优势

	- 高吞吐量
	  单机每秒处理几十上百万的消息量。即使存储了许多TB的消息，它也保持稳定的性能。

	- 高性能
	  单节点支持上千个客户端，并保证零停机和零数据丢失。

	- 持久化数据存储
	  将消息持久化到磁盘。通过将数据持久化到硬盘以及replication防止数据丢 失。  
	  1. 零拷贝  
	  2. 顺序读，顺序写  
	  3. 利用Linux的页缓存

	- 分布式系统，易于向外扩展
	  所有的Producer、Broker和Consumer都会有多个，均为分布 式的。无需停机即可扩展机器。多个Producer、Consumer可能是不同的应用。

	- 可靠性
	   Kafka是分布式，分区，复制和容错的

	- 客户端状态维护
	  消息被处理的状态是在Consumer端维护，而不是由server端维护。当失败  
	  时能自动平衡。

	- 支持online和offline的场景

	- 支持多种客户端语言
	  Kafka支持Java、.NET、PHP、Python等多种语言

- Kafka应用场景

	- 日志收集
	  一个公司可以用Kafka可以收集各种服务的Log，通过Kafka以统一接口服务的方式开放给各种Consumer

	- 消息系统
	  解耦生产者和消费者、缓存消息等

	- 用户活动跟踪
	  Kafka经常被用来记录Web用户或者App用户的各种活动，如浏览网页、搜索、点 击等活动，这些活动信息被各个服务器发布到Kafka的Topic中，然后消费者通过订阅这些Topic来做实 时的监控分析，亦可保存到数据库;

	- 运营指标
	  Kafka也经常用来记录运营监控数据。包括收集各种分布式应用的数据，生产各种操作 的集中反馈，比如报警和报告

	- 流式处理
	  比如Spark Streaming和Storm

- 基本架构

	- 消息和批次
	  Kafka的数据单元称为消息。可以把消息看成是数据库里的一个“数据行”或一条“记录”。消息由字节数组组成。  
	  消息有键，键也是一个字节数组。当消息以一种可控的方式写入不同的分区时，会用到键。  
	  为了提高效率，消息被分批写入Kafka。批次就是一组消息，这些消息属于同一个主题和分区。  
	  把消息分成批次可以减少网络开销。批次越大，单位时间内处理的消息就越多，单个消息的传输时间就越长。批次数据会被压缩，这样可以提升数据的传输和存储能力，但是需要更多的计算处理。

	- 模式
	  消息模式(schema)有许多可用的选项，以便于理解。如JSON和XML，但是它们缺乏强类型处理 能力。Kafka的许多开发者喜欢使用Apache Avro。Avro提供了一种紧凑的序列化格式，模式和消息体 分开。当模式发生变化时，不需要重新生成代码，它还支持强类型和模式进化，其版本既向前兼容，也向后兼容。  
	  数据格式的一致性对Kafka很重要，因为它消除了消息读写操作之间的耦合性。

	- 主题和分区
![](/resource/kafka/assets/2A28F42D-D3BA-410E-B02E-09980B3E7AF9.png)
	  Kafka的消息通过主题进行分类。主题可比是数据库的表或者文件系统里的文件夹。主题可以被分 为若干分区，一个主题通过分区分布于Kafka集群中，提供了横向扩展的能力。

	- 生产者和消费者<br>
![](/resource/kafka/assets/10AB1C1A-4E73-4FE2-946A-F33D0F4CD0F9.png)
	  生产者创建消息。消费者消费消息。  
	  一个消息被发布到一个特定的主题上。  
	  生产者在默认情况下把消息均衡地分布到主题的所有分区上:  
	  1. 直接指定消息的分区  
	  2. 根据消息的key散列取模得出分区 3. 轮询指定分区。  
	  消费者通过偏移量来区分已经读过的消息，从而消费消息。  
	  消费者是消费组的一部分。消费组保证每个分区只能被一个消费者使用，避免重复消费。

	- broker和集群<br>
![](/resource/kafka/assets/304745D1-F17E-44D4-B3AD-78F249A9951E.png)
	  一个独立的Kafka服务器称为broker。broker接收来自生产者的消息，为消息设置偏移量，并提交 消息到磁盘保存。broker为消费者提供服务，对读取分区的请求做出响应，返回已经提交到磁盘上的消 息。单个broker可以轻松处理数千个分区以及每秒百万级的消息量。  
	  每个集群都有一个broker是集群控制器(自动从集群的活跃成员中选举出来)。   
	  控制器负责管理工作:  
	  * 将分区分配给broker   
	  * 监控broker  
	    
	  集群中一个分区属于一个broker，该broker称为分区首领。 一个分区可以分配给多个broker，此时会发生分区复制。 分区的复制提供了消息冗余，高可用。副本分区不负责处理消息的读写。

- 核心概念

	- Producer
	  生产者创建消息。 该角色将消息发布到Kafka的topic中。broker接收到生产者发送的消息后，broker将该消息追加到当前用于追加数据的 segment 文件中。  
	  一般情况下，一个消息会被发布到一个特定的主题上:  
	  1. 默认情况下通过轮询把消息均衡地分布到主题的所有分区上。  
	  2. 在某些情况下，生产者会把消息直接写到指定的分区。这通常是通过消息键和分区器来实现的，分区器为键生成一个散列值，并将其映射到指定的分区上。这样可以保证包含同一个键的消息会被写到同一个分区上。  
	  3. 生产者也可以使用自定义的分区器，根据不同的业务规则将消息映射到分区。

	- Consumer
![](/resource/kafka/assets/DBB6A2EF-8E42-40CF-A63E-D098F819A465.png)
	  消费者读取消息。  
	  1. 消费者订阅一个或多个主题，并按照消息生成的顺序读取它们。  
	  2. 消费者通过检查消息的偏移量来区分已经读取过的消息。偏移量是另一种元数据，它是一个不断递增的整数值，在创建消息时Kafka 会把它添加到消息里。在给定的分区里，每个消息的 偏移量都是唯一的。消费者把每个分区最后读取的消息偏移量保存在Zookeeper 或Kafka 上，如果消费者关闭或重启，它的读取状态不会丢失。  
	  3. 消费者是消费组的一部分。群组保证每个分区只能被一个消费者使用。  
	  4. 如果一个消费者失效，消费组里的其他消费者可以接管失效消费者的工作，再平衡，分区重新  
	  分配。

	- Broker<br>
![](/resource/kafka/assets/8F187AD4-A5AA-49A4-A113-DF9315B0FD8D.png)
	  一个独立的Kafka 服务器被称为broker。  
	  broker 为消费者提供服务，对读取分区的请求作出响应，返回已经提交到磁盘上的消息。  
	  1. 如果某topic有N个partition，集群有N个broker，那么每个broker存储该topic的一个 partition。  
	  2. 如果某topic有N个partition，集群有(N+M)个broker，那么其中有N个broker存储该topic的 一个partition，剩下的M个broker不存储该topic的partition数据。  
	  3. 如果某topic有N个partition，集群中broker数目少于N个，那么一个broker存储该topic的一 个或多个partition。在实际生产环境中，尽量避免这种情况的发生，这种情况容易导致Kafka集群数据不均衡。  
	    
	  broker 是集群的组成部分。每个集群都有一个broker 同时充当了集群控制器的角色(自动从集群 的活跃成员中选举出来)。  
	  控制器负责管理工作，包括将分区分配给broker 和监控broker。  
	  在集群中，一个分区从属于一个broker，该broker 被称为分区的首领。

	- Topic
	  每条发布到Kafka集群的消息都有一个类别，这个类别被称为Topic。   
	  物理上不同Topic的消息分开存储。   
	  主题就好比数据库的表，尤其是分库分表之后的逻辑表。

	- Partition<br>
![](/resource/kafka/assets/9B273801-CB5A-4FE2-9EA7-84FDE1C4AA54.png)
	  1. 主题可以被分为若干个分区，一个分区就是一个提交日志。  
	  2. 消息以追加的方式写入分区，然后以先入先出的顺序读取。  
	  3. 无法在整个主题范围内保证消息的顺序，但可以保证消息在单个分区内的顺序。   
	  4. Kafka 通过分区来实现数据冗余和伸缩性。  
	  5. 在需要严格保证消息的消费顺序的场景下，需要将partition数目设为1。

	- Replicas
	  Kafka 使用主题来组织数据，每个主题被分为若干个分区，每个分区有多个副本。那些副本被保存 在broker 上，每个broker 可以保存成百上千个属于不同主题和分区的副本。  
	  副本有以下两种类型:

		- 首领副本
		   每个分区都有一个首领副本。为了保证一致性，所有生产者请求和消费者请求都会经过这个副本。

		- 跟随者副本
		  首领以外的副本都是跟随者副本。跟随者副本不处理来自客户端的请求，它们唯一的任务就是从首领那里复制消息，保持与首领一致的状态。如果首领发生崩溃，其中的一个跟随者会被提升为新首领。

	- Offset

		- 生产者Offset<br>
![](/resource/kafka/assets/3D428D54-43BE-4DD5-AD2A-78D4B2FBBF96.png)
		  消息写入的时候，每一个分区都有一个offset，这个offset就是生产者的offset，同时也是这个分区 的最新最大的offset。  
		  有些时候没有指定某一个分区的offset，这个工作kafka帮我们完成。

		- 消费者Offset<br>
![](/resource/kafka/assets/CB05913C-6FB4-4338-8423-E0885EB25D81.png)
		  这是某一个分区的offset情况，生产者写入的offset是最新最大的值是12，而当Consumer A进行消 费时，从0开始消费，一直消费到了9，消费者的offset就记录在9，Consumer B就纪录在了11。等下一 次他们再来消费时，他们可以选择接着上一次的位置消费，当然也可以选择从头消费，或者跳到最近的 记录并从“现在”开始消费。

	- 副本
	  Kafka通过副本保证高可用。副本分为首领副本(Leader)和跟随者副本(Follower)。  
	    跟随者副本包括同步副本和不同步副本，在发生首领副本切换的时候，只有同步副本可以切换为首领副本。

		- AR
		  分区中的所有副本统称为AR(Assigned Repllicas)。  
		  AR=ISR+OSR

		- ISR
		  所有与leader副本保持一定程度同步的副本(包括Leader)组成ISR(In-Sync Replicas)，ISR集 合是AR集合中的一个子集。消息会先发送到leader副本，然后follower副本才能从leader副本中拉取消 息进行同步，同步期间内follower副本相对于leader副本而言会有一定程度的滞后。前面所说的“一定程 度”是指可以忍受的滞后范围，这个范围可以通过参数进行配置。

		- OSR
		  与leader副本同步滞后过多的副本(不包括leader)副本，组成OSR(Out-Sync Relipcas)。在正常 情况下，所有的follower副本都应该与leader副本保持一定程度的同步，即AR=ISR,OSR集合为空。

		- HW & LEO<br>
![](/resource/kafka/assets/1FC6063D-02B8-47F7-96FB-354A2ADFE40D.png)
		  **HW**是High Watermak的缩写， 俗称高水位，它表示了一个特定消息的偏移量(offset)，消费之 只能拉取到这个offset之前的消息。  
		    
		  **LEO**是Log End Offset的缩写，它表示了当前日志文件中下一条待写入消息的offset。

### Kafka安装与配置

环境准备 jdk8， zookeeper-3.4.14

- kafka 1.0.2安装
  ```sh  
  # 解压安装包  
  tar -zxvf kafka_2.12-1.0.2.tgz -C /opt/lagou/servers/kafka_2.12-1.0.2  
    
  # 添加path  
    
  vim /etc/profile  
    
  # Kafka  
  export KAFKA_HOME=/opt/lagou/servers/kafka_2.12-1.0.2  
  export PATH=$PATH:$KAFKA_HOME/bin  
    
  ```

- 修改配置文件conf/server.properties
  ```sh  
  vim conf/server.properties  
    
  # 修改zookeeper目录  
  zookeeper.connect=localhost:2181/mykafka  
  # 修改消息存放目录  
  log.dirs=/var/lagou/kafka/kafka-logs  
    
    
    
  # 创建目录  
  mkdir -p /var/lagou/kafka/kafka-logs  
  ```

- 启动kafka

	- kafka-server-start.sh
	  ```sh  
	  # 启动zookeeper  
	  zkServer.sh start  
	    
	  # 后台模式启动kafka  
	  kafka-server-start.sh -daemon $KAFKA_HOME/config/server.properties  
	  # log模式  
	  kafka-server-start.sh $KAFKA_HOME/config/server.properties   
	  ```

- 停止kafka

	- kafka-server-stop.sh

### 生产与消费

- kafka-topics.sh
  用于管理主题  
    
  ```sh  
  # 查看现有列表  
  kafka-topics.sh --zookeeper localhost:2181/mykafka --list  
    
  # 创建topic， --partitions 分区数 --replication-factor 副本数  
  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_1 --partitions 1 --replication-factor 1  
    
  # 看topic信息  
  kafka-topics.sh --zookeeper localhost:2181/mykafka --describe --topic topic_1  
    
  # 删除topic  
  kafka-topics.sh --zookeeper localhost:2181/mykafka --delete --topic topic_1  
    
  # 创建一个有5个分区的topic2  
  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_2 --partitions 5 --replication-factor 1  
  ```

- kafka-console-producer.sh
  用于生产消息  
    
  ```sh  
  # 链接上topic2，接下来可以在终端直接发布消息  
  kafka-console-producer.sh --broker-list localhost:9092 --topic topic_2  
  ```  
    
  ```sh  
  [2021-02-22 17:03:32,354] WARN [Producer clientId=console-producer] Connection to node -1 could not be established. Broker may not be available. (org.apache.kafka.clients.NetworkClient)  
    
    
  # 检查host的准确性  
  conf/server.properties 下面的listeners是否没有屏蔽，开启的话写了什么？  
    
  listeners=PLAINTEXT://localhost:9092  
  ```

- kafka-console-consumer.sh
  用于消费消息  
    
  ```sh  
  kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic topic_2  
    
  # 从头开始读取消息  
  kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic topic_2 --from-beginning  
  ```

### Kafka开发实战

- 消息的发送与接收<br>
![](/resource/kafka/assets/54642997-F6E7-4B3B-B8D2-0547D6507F22.png)

	- 生产者
	  生产者主要的对象有: KafkaProducer ， ProducerRecord 。  
	  其中 KafkaProducer 是用于发送消息的类， ProducerRecord 类用于封装Kafka的消息。  
	  消费者生产消息后，需要broker端的确认，可以同步确认，也可以异步确认。 同步确认效率低，异步确认效率高，但是需要设置回调对象。

		- 相关参数
		  KafkaProducer 的创建需要指定的参数和含义, 其他参数可以从 org.apache.kafka.clients.producer.ProducerConfig 中找到: 

			- bootstrap.servers
			  配置生产者如何与broker建立连接。该参数设置的是初始化参数。如果生产者需要连接的是Kafka集群，则这里配置集群中几个broker的地址，而不是全部，当生产者连接上此处指定的broker之后，在通过该连接发现集群中的其他节点。

			- key.serializer
			  要发送信息的key数据的序列化类。设置的时候可以写类名，也可以使用该类的Class对象。

			- value.serializer
			  要发送消息的value数据的序列化类。设置的时候可以写类名，也可以使用该类的Class对象。

			- acks
			  默认值:all。  
			  acks=0:  
			  生产者不等待broker对消息的确认，只要将消息放到缓冲区，就认为消息已经发送完成。  
			  该情形不能保证broker是否真的收到了消息，retries配置也不会生效。发送的消息的返回的消息偏移量永远是-1。  
			  acks=1:  
			  表示消息只需要写到主分区即可，然后就响应客户端，而不等待副本分区的确认。  
			  在该情形下，如果主分区收到消息确认之后就宕机了，而副本分区还没来得及同步该消息，则该消息丢失。  
			  acks=all:  
			  首领分区会等待所有的ISR副本分区确认记录。  
			  该处理保证了只要有一个ISR副本分区存活，消息就不会丢失。这是Kafka最强的可靠性保证，等效于acks=-1

			- retries
			  retries重试次数  
			  当消息发送出现错误的时候，系统会重发消息。  
			  跟客户端收到错误时重发一样。  
			  如果设置了重试，还想保证消息的有序性，需要设置MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION=1  
			  否则在重试此失败消息的时候，其他的消息可能发送成功了

		- 示例代码
		  使用到的依赖  
		    
		  ```xml  
		  <!-- 版本需与服务器安装的版本一致，高版本兼容低版本 -->  
		  <dependency>  
		      <groupId>org.apache.kafka</groupId>  
		      <artifactId>kafka-clients</artifactId>  
		      <version>1.0.2</version>  
		  </dependency>  
		  ```

			- 生产者producer
			  ```java  
			  import org.apache.kafka.clients.producer.Callback;  
			  import org.apache.kafka.clients.producer.KafkaProducer;  
			  import org.apache.kafka.clients.producer.ProducerRecord;  
			  import org.apache.kafka.clients.producer.RecordMetadata;  
			  import org.apache.kafka.common.header.Header;  
			  import org.apache.kafka.common.header.internals.RecordHeader;  
			  import org.apache.kafka.common.serialization.IntegerSerializer;  
			  import org.apache.kafka.common.serialization.StringSerializer;  
			    
			  public class MyProducer1 {  
			      public static void main(String[] args) throws ExecutionException, InterruptedException {  
			    
			          Map<String, Object> config = new HashMap<String, Object>();  
			          // broker所在地址  
			          config.put("bootstrap.servers", "centos7-3:9092");  
			          // 序列化的类  
			          config.put("key.serializer", IntegerSerializer.class);  
			          config.put("value.serializer", StringSerializer.class);  
			    
			          KafkaProducer<Integer, String> producer = new KafkaProducer<Integer, String>(config);  
			    
			          List<Header> headers = new ArrayList<Header>();  
			          headers.add(new RecordHeader("client", "java".getBytes()));  
			    
			  //        (String topic, Integer partition, Long timestamp, K key, V value, Iterable<Header> headers)  
			          ProducerRecord<Integer, String> producerRecord = new ProducerRecord<Integer, String>(  
			                  "topic_1",  
			                  0,  
			                  System.currentTimeMillis(),  
			                  0,  
			                  "kafka_java",  
			                  headers  
			                  );  
			    
			          //同步读取ack  
			  //        Future<RecordMetadata> metadataFuture = producer.send(producerRecord);  
			  //        RecordMetadata recordMetadata = metadataFuture.get();  
			  //        System.out.println(recordMetadata.toString());  
			    
			    
			          // 异步读取ack  
			          producer.send(producerRecord, new Callback() {  
			              public void onCompletion(RecordMetadata recordMetadata, Exception e) {  
			                  if (e != null) {  
			                      e.printStackTrace();  
			                  }  
			                  System.out.println(recordMetadata.toString());  
			              }  
			          });  
			    
			    
			          producer.close();  
			      }  
			  }  
			    
			  ```

	- 消费者
	  消息消费:  
	  Kafka不支持消息的推送，我们可以自己实现。  
	  Kafka采用的是消息的拉取(poll方法)  
	  消费者主要的对象有:`Kafkaconsumer`用于消费消息的类。

		- 相关参数
		  `ConsumerConfig`类中包含了所有的可以给`KafkaConsumer`配置的参数。  
		  `Kafkaconsumer`的创建需要指定的参数和含义:

			- bootstrap.servers
			  与Kafka建立初始连接的broker地址列表

			- key.deserializer
			  key的反序列化器

			- value.deserializer
			  value的反序列化器

			- group.id
			  指定消费组id，用于标识该消费者所属的消费组

			- auto.offset.reset
			  当Kafka中没有初始偏移量或当前偏移量在服务器中不存在(如，数据被删除了)，该如何处理?  
			  earliest:自动重置偏移量到最早的偏移量  
			  latest:自动重置偏移量为最新的偏移量  
			  none:如果消费组原来的(previous)偏移量不存在，则向消费者抛异常  
			  anything:向消费者抛异常

		- 示例代码
		  ```java  
		  import org.apache.kafka.clients.consumer.ConsumerConfig;  
		  import org.apache.kafka.clients.consumer.ConsumerRecord;  
		  import org.apache.kafka.clients.consumer.ConsumerRecords;  
		  import org.apache.kafka.clients.consumer.KafkaConsumer;  
		  import org.apache.kafka.common.serialization.IntegerDeserializer;  
		  import org.apache.kafka.common.serialization.StringDeserializer;  
		    
		  public class MyConsumer1 {  
		      public static void main(String[] args) {  
		          Map<String, Object> configs = new HashMap<String, Object>();  
		          configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
		          // 反序列化的类  
		          configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, IntegerDeserializer.class);  
		          configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);  
		          // 群组id，群组内不会重复消费相同的消息  
		          configs.put(ConsumerConfig.GROUP_ID_CONFIG, "consumer_demo1");  
		          // 没有找到offset，就从能找到的第一条消息开始消费  
		          configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");  
		    
		          KafkaConsumer<Integer, String> consumer = new KafkaConsumer<Integer, String>(configs);  
		    
		          // 订阅主题  
		          consumer.subscribe(Arrays.asList("topic_1"));  
		    
		          while (true) {  
		              // 拉去消息，窗口时间3s  
		              ConsumerRecords<Integer, String> records = consumer.poll(3_000);  
		                
		              for (ConsumerRecord<Integer, String> record : records) {  
		                  String topic = record.topic();  
		                  String value = record.value();  
		                  System.out.println("topic: " + topic + " " + record.offset() + " " + record.key() + ", value: " + value);  
		              }  
		          }  
		      }  
		  }  
		    
		  ```

	- SpringBoot Kafka
	  使用springboot整合web+kafka

		- 项目配置<br>
![](/resource/kafka/assets/FEA8E5A2-E005-4045-AB50-CC4BED9052FB.png)

		- 目录结构<br>
![](/resource/kafka/assets/A8C2254E-0858-4D61-8C53-1A45B6C5ED4F.png)

		- 配置文件application.properties
		  ```sh  
		  spring.application.name=springboot-kafka-02  
		  # web项目端口  
		  server.port=8090  
		    
		  #kafka 配置  
		  spring.kafka.bootstrap-servers=centos7-3:9092  
		    
		  #producer  
		  spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.IntegerSerializer  
		  spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer  
		  #每个批次最多可以放多少条记录  
		  spring.kafka.producer.batch-size=16384  
		  spring.kafka.producer.buffer-memory=33554432  
		    
		  #consumer  
		  spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.IntegerDeserializer  
		  spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer  
		  spring.kafka.consumer.group-id=springboot-consumer02  
		  spring.kafka.consumer.auto-offset-reset=earliest  
		  spring.kafka.consumer.enable-auto-commit=true  
		  spring.kafka.consumer.auto-commit-interval=1000  
		  ```

		- producers

			- sync
			  ```java  
			  package com.lagou.kafka.demo.controller;  
			    
			  import org.apache.kafka.clients.producer.ProducerRecord;  
			  import org.springframework.beans.factory.annotation.Autowired;  
			  import org.springframework.kafka.core.KafkaTemplate;  
			  import org.springframework.kafka.support.SendResult;  
			  import org.springframework.util.concurrent.ListenableFuture;  
			  import org.springframework.web.bind.annotation.PathVariable;  
			  import org.springframework.web.bind.annotation.RequestMapping;  
			  import org.springframework.web.bind.annotation.RestController;  
			    
			  import java.util.concurrent.ExecutionException;  
			    
			  @RestController  
			  public class KafkaSyncProducerController {  
			    
			      // springboot 提供的producer，会自动加载配置文件的参数  
			      @Autowired  
			      private KafkaTemplate<Integer, String> template;  
			    
			      @RequestMapping("send/sync/{message}")  
			      public String sendSync(@PathVariable String message) {  
			          ListenableFuture<SendResult<Integer, String>> future = template.send(new ProducerRecord<Integer, String>(  
			                  "topic-spring-02",  
			                  0,  
			                  1,  
			                  message  
			          ));  
			    
			          try {  
			              SendResult<Integer, String> sendResult = future.get();  
			    
			              System.out.println("sync: "+sendResult.getRecordMetadata().topic()  
			                      + " " + sendResult.getRecordMetadata().partition()  
			                      + " " + sendResult.getRecordMetadata().offset());  
			    
			          } catch (InterruptedException e) {  
			              e.printStackTrace();  
			          } catch (ExecutionException e) {  
			              e.printStackTrace();  
			          }  
			          return "success";  
			      }  
			  }  
			    
			  ```

			- async
			  ```java  
			  package com.lagou.kafka.demo.controller;  
			    
			  import org.apache.kafka.clients.producer.ProducerRecord;  
			  import org.springframework.beans.factory.annotation.Autowired;  
			  import org.springframework.kafka.core.KafkaTemplate;  
			  import org.springframework.kafka.support.SendResult;  
			  import org.springframework.util.concurrent.ListenableFuture;  
			  import org.springframework.util.concurrent.ListenableFutureCallback;  
			  import org.springframework.web.bind.annotation.PathVariable;  
			  import org.springframework.web.bind.annotation.RequestMapping;  
			  import org.springframework.web.bind.annotation.RestController;  
			    
			    
			  @RestController  
			  public class KafkaAsyncProducerController {  
			      @Autowired  
			      private KafkaTemplate<Integer, String> template;  
			    
			      @RequestMapping("send/async/{message}")  
			      public String sendSync(@PathVariable String message) {  
			          ProducerRecord<Integer, String> producerRecord = new ProducerRecord<>(  
			                  "topic-spring-02",  
			                  0,  
			                  1,  
			                  message  
			          );  
			    
			          ListenableFuture<SendResult<Integer, String>> future = template.send(producerRecord);  
			    
			          future.addCallback(new ListenableFutureCallback<SendResult<Integer, String>>() {  
			              @Override  
			              public void onFailure(Throwable ex) {  
			                  System.out.println("fail with:" + ex.getMessage());  
			              }  
			    
			              @Override  
			              public void onSuccess(SendResult<Integer, String> result) {  
			                  System.out.println("async: "+result.getRecordMetadata().topic()  
			                          + " " + result.getRecordMetadata().partition()  
			                          + " " + result.getRecordMetadata().offset());  
			              }  
			          });  
			    
			          return "success";  
			      }  
			  }  
			    
			  ```

		- consumer
		  ```java  
		  package com.lagou.kafka.demo.consumer;  
		  import org.apache.kafka.clients.consumer.ConsumerRecord;  
		  import org.springframework.kafka.annotation.KafkaListener;  
		  import org.springframework.stereotype.Component;  
		    
		  import java.util.Optional;  
		    
		  @Component  
		  public class MyConsumer {  
		    
		      @KafkaListener(topics = "topic-spring-02")  
		      public void onMessage(ConsumerRecord<Integer, String> record) {  
		          Optional<ConsumerRecord<Integer, String>> optional = Optional.ofNullable(record);  
		    
		          if (optional.isPresent()) {  
		              System.out.println(  
		                              record.topic() + " "  
		                              + record.partition() + " "  
		                              + record.offset() + " "  
		                              + record.key() + " "  
		                              + record.value());  
		          }  
		      }  
		  }  
		  ```

		- 配置相关
		  ```java  
		  @Configuration  
		  public class KafkaConfig {  
		    
		      // 让客户端启动的时候帮我们创建主题  
		      @Bean  
		      public NewTopic topic1() {  
		          return new NewTopic("ntp-01", 5, (short) 1);  
		      }  
		    
		      @Bean  
		      public NewTopic topic2() {  
		          return new NewTopic("ntp-02", 3, (short) 1);  
		      }  
		  }  
		  ```

- 服务端参数配置
  $KAFKA_HOME/config/server.properties文件中的配置。

	- zookeeper.connect
	  该参数用于配置Kafka要连接的Zookeeper/集群的地址。 它的值是一个字符串，使用逗号分隔Zookeeper的多个地址。Zookeeper的单个地址是 host:port形式的，可以在最后添加Kafka在Zookeeper中的根节点路径。  
	    
	  ```sh  
	  zookeeper.connect=node2:2181,node3:2181,node4:2181/myKafka  
	  ```

	- listeners
	  用于指定当前Broker向外发布服务的地址和端口。  
	  与 advertised.listeners 配合，用于做内外网隔离。

		- 内外网隔离配置
![](/resource/kafka/assets/FC93D0F3-B1CC-4EA2-8E8F-5DD7FA8E76E2.png)

			- listener.security.protocol.map
			  监听器名称和安全协议的映射配置。  
			  比如，可以将内外网隔离，即使它们都使用SSL。 listener.security.protocol.map=INTERNAL:SSL,EXTERNAL:SSL 每个监听器的名称只能在map中出现一次。

			- inter.broker.listener.name
			  用于配置broker之间通信使用的监听器名称，该名称必须在advertised.listeners列表中。 inter.broker.listener.name=EXTERNAL

			- listeners
			  用于配置broker监听的URI以及监听器名称列表，使用逗号隔开多个URI及监听器名称。 如果监听器名称代表的不是安全协议，必须配置listener.security.protocol.map。 每个监听器必须使用不同的网络端口。

			- advertised.listeners
			  需要将该地址发布到zookeeper供客户端使用，如果客户端使用的地址与listeners配置不同。  
			  可以在zookeeper的`get /myKafka/brokers/ids/<broker.id>`中找到。  
			  如果不设置此条目，就使用listeners的配置。跟listeners不同，该条目不能使用0.0.0.0网络端口。 advertised.listeners的地址必须是listeners中配置的或配置的一部分。

	- broker.id
	  该属性用于唯一标记一个Kafka的Broker，它的值是一个任意integer值。  
	  当Kafka以分布式集群运行的时候，尤为重要。  
	  最好该值跟该Broker所在的物理主机有关的，如主机名为 host1.lagou.com ，则 broker.id=1 ， 如果主机名为 192.168.100.101 ，则 broker.id=101 等等。

	- log.dir
	  通过该属性的值，指定Kafka在磁盘上保存消息的日志片段的目录。  
	  它是一组用逗号分隔的本地文件系统路径。  
	  如果指定了多个路径，那么broker 会根据“最少使用”原则，把同一个分区的日志片段保存到同一个 路径下。  
	  broker 会往拥有最少数目分区的路径新增分区，而不是往拥有最小磁盘空间的路径新增分区。

## Kafka高级特性解析

### 生产者

- 消息发送

	- 数据生产流程解析<br>
![](/resource/kafka/assets/3097E7BA-A3C8-4535-8032-36B87B8FA67E.png)
	  1. Producer创建时，会创建一个Sender线程并设置为守护线程。  
	  2. 生产消息时，内部其实是异步流程;生产的消息先经过拦截器->序列化器->分区器，然后将消息缓存在缓冲区(该缓冲区也是在Producer创建时创建)。  
	  3. 批次发送的条件为:缓冲区数据大小达到batch.size或者linger.ms达到上限，哪个先达到就算哪个。  
	  4. 批次发送后，发往指定分区，然后落盘到broker;如果生产者配置了retrires参数大于0并且失败原因允许重试，那么客户端内部会对该消息进行重试。  
	  5. 落盘到broker成功，返回生产元数据给生产者。  
	  6. 元数据返回有两种方式:一种是通过阻塞直接返回，另一种是通过回调返回。

	- 必要参数配置

		- bootstrap.servers
		  生产者客户端与broker集群建立初始连接需要的broker地址列表，由该初始连接发现Kafka集群中其他的所有broker。该地址列表不需要写全部的Kafka集群中broker的地址，但也不要写一个，以防该节点宕机的时候不可用。形式为:host1:port1,host2:port2,..

		- key.serializer
		  实现了接口  
		  org.apache.kafka.common.serialization.Serializer的key序列化类。

		- value.serializer
		  实现了接口org.apache.kafka.common.serialization.serializer的value序列化类。

		- acks
		  该选项控制着已发送消息的持久性。  
		  acks=0: 生产者不等待broker的任何消息确认。只要将消息放到了socket的缓冲区，就认为消息已发送。不能保证服务器是否收到该消息，retries设置也不起作用，因为客户端不关心消息是否发送失败。客户端收到的消息偏移量永远是-1。  
		  acks=1:leader将记录写到它本地日志，就响应客户端确认消息，而不等待ollower副本的确认。如果leader确认了消息就宕机，则可能会丢失消息，因为follower副本可能还没来得及同步该消息。  
		  acks=all:leader等待所有同步的副本确认该消息。保证了只要有一个同步副本存在，消息就不会丢失。这是最强的可用性保证。等价于acks=-1。默认值为1，字符串。可选值:[all,-1,0,1]

		- compression.type
		  生产者生成数据的压缩格式。默认是none(没有压缩)。允许的值:none，gzip，snappy和lz4。压缩是对整个消息批次来讲的。消息批的效率也影响压缩的比例。消息批越大，压缩效率越好。字符串类型的值。默认是none。

		- retries
		  设置该属性为一个大于1的值，将在消息发送失败的时候重新发送消息。该重试与客户端收到异常重新发送并无二至。允许重试但是不设置max.in.f1ight.requests.per.connection为1，存在消息乱序的可能，因为如果两个批次发送到同一个分区，第一个失败了重试，第二个成功了，则第一个消息批在第二个消息批后。int类型的值，默认:0，可选值:[0..217483647]

	- 补充参数配置

		- retry.backoff.ms
		  在向一个指定的主题分区重发消息的时候，重试之间的等待时间。  
		  比如3次重试，每次重试之后等待该时间长度，再接着重试。在一些失败的场景，避免了密集循环的重新发送请求。  
		  long型值，默认100。可选值:[0...]

		- request.timeout.ms
		  客户端等待请求响应的最大时长。如果服务端响应超时，则会重发请求，除非达到重试次数。该设置应该比rep1ica.1ag.time.max.ms (a broker configuration)要大，以免在服务器延迟时间内重发消息。int类型值，默认: 30000，可选值:[0...]

		- interceptor.classes
		  在生产者接收到该消息，向Kafka集群传输之前，由序列化器处理之前，可以通过拦截器对消息进行处理。要求拦截器类必须实现  
		  org.apache.kafka.clients.producer. producerInterceptor接口。 默认没有拦截器。Map<String, Object> configs中通过List集合配置多个拦截器类名。

		- batch.size
		  当多个消息发送到同一个分区的时候，生产者尝试将多个记录作为一个批来处理。批处理提高了客户端和服务器的处理效率。  
		  该配置项以字节为单位控制默认批的大小。  
		  所有的批小于等于该值。  
		  发送给broker的请求将包含多个批次，每个分区一个，并包含可发送的数据。  
		  如果该值设置的比较小，会限制吞吐量(设置为0会完全禁用批处理)。如果设置的很大，又有一点浪费内存，因为Kafka会永远分配这么大的内存来参与到消息的批整合中。

		- client.id
		  生产者发送请求的时候传递给broker的id字符串。  
		  用于在broker的请求日志中追踪什么应用发送了什么消息。一般该id是跟业务有关的字符串。

		- send.buffer.bytes
		  TCP发送数据的时候使用的缓冲区(SO_SNDBUF)大小。如果设置为0，则使用操作系统默认的。

		- buffer.memory
		  生产者可以用来缓存等待发送到服务器的记录的总内存字节。如果记录的发送速度超过了将记录发送到服务器的速度，则生产者将阻塞max.block.ms的时间，此后它将引发异常。此设置应大致对应于生产者将使用的总内存，但并非生产者使用的所有内存都用于缓冲。一些额外的内存将用于压缩(如果启用了压缩)以及维护运行中的请求。long型数据。默认值:33554432，可选值:[0....]

		- connections.max.idle.ms
		  当连接空闲时间达到这个值，就关闭连接。Iong型数据，默认:540000

		- linger.ms
		  生产者在发送请求传输间隔会对需要发送的消息进行累积，然后作为一个批次发送。一般情况是消息的发送的速度比消息累积的速度慢。有时客户端需要减少请求的次数，即使是在发送负载不大的情况下。该配置设置了一个延迟，生产者不会立即将消息发送到broker，而是等待这么一段时间以累积消息，然后将这段时间之内的消息作为一个批次发送。该设置是批处理的另一个上限:一旦批消息达到了batch.size指定的值，消息批会立即发送，如果积累的消息字节数达不到batch.size的值，可以设置该毫秒值，等待这么长时间之后，也会发送消息批。该属性默认值是0(没有延迟)。如果设置linger.ms=5，则在一个请求发送之前先等待5ms。long型值，默认:0，可选值:[0....]

		- max.block.ms
		  控制Kafkaproducer. send()和Kafkaproducer. partitionsFor()阻塞的时长。当缓存满了或元数据不可用的时候，这些方法阻塞。在用户提供的序列化器和分区器的阻塞时间不计入。Iong型值，默认:60000，可选值:[0....]

		- max.request.size
		  单个请求的最大字节数。该设置会限制单个请求中消息批的消息个数，以免单个请求发送太多的数据。服务器有自己的限制批大小的设置，与该配置可能不一样。int类型值，默认1048576，可选值:[0...]

		- partitioner.class
		  实现了接口org.apache.kafka.clients.producer. Partitioner 的分区器实现类。默认值为:org.apache.kafka.clients.producer.internals.DefaultPartitioner

		- receive.buffer.bytes
		  TCP接收缓存(SO_RCVBUF)，如果设置为-1，则使用操作系统默认的值。 int类型值，默认32768，可选值:[-1...]

		- security.protocol
		  跟broker通信的协议:PLAINTEXT, SSL, SASL_PLAINTEXT, SASL_SSLstring类型值，默认:PLAINTEXT

		- max.in.flight.requests.per.connection
		  单个连接上未确认请求的最大数量。达到这个数量，客户端阻塞。如果该值大于1，且存在失败的请求，在重试的时候消息顺序不能保证。  
		  int类型值，默认5。可选值:[1,...]

		- reconnect.backoff.max.ms
		  对于每个连续的连接失败，每台主机的退避将成倍增加，直至达到此最大值。  
		  在计算退避增量之后，添加20%的随机抖动以避免连接风暴。long型值，默认1000，可选值:[0....]

		- reconnect.backoff.ms
		  尝试重连指定主机的基础等待时间。避免了到该主机的密集重连。该退避时间应用于该客户端到broker的所有连接。long型值，默认50。可选值:[0,...]

	- 序列化器<br>
![](/resource/kafka/assets/813A0A46-7BBF-4353-A9DC-1FD7B8EC2792.png)
	  由于Kafka中的数据都是字节数组，在将消息发送到Kafka之前需要先将数据序列化为字节数组。 序列化器的作用就是用于序列化要发送的消息的。  
	  Kafka使用 org.apache.kafka.common.serialization.Serializer 接口用于定义序列化器，将 泛型指定类型的数据转换为字节数组。

		- 自定义序列化器
		  数据的序列化一般生产中使用avro。  
		  自定义序列化器需要实现org.apache.kafka.common.serialization.Serializer<T>接口，并实现其中的 serialize 方法。

			- user
			  ```java  
			  public class User {  
			      private Integer userId;  
			      private String username;  
			  }  
			  ```

			- UserSerializer
			  ```java  
			  import org.apache.kafka.common.errors.SerializationException;  
			  import org.apache.kafka.common.serialization.Serializer;  
			    
			  import java.io.UnsupportedEncodingException;  
			  import java.nio.ByteBuffer;  
			  import java.util.Map;  
			    
			  public class UserSerializer implements Serializer<User> {  
			      public void configure(Map<String, ?> map, boolean b) {  
			    
			      }  
			    
			      public byte[] serialize(String s, User user) {  
			          if (user == null)  
			              return new byte[0];  
			    
			          try {  
			              String username = user.getUsername();  
			              Integer userId = user.getUserId();  
			              int length = 0;  
			              byte[] bytes = null;  
			              if (username != null) {  
			                  bytes = username.getBytes("UTF-8");  
			                  length = bytes.length;  
			              }  
			    
			              ByteBuffer byteBuffer = ByteBuffer.allocate(4 + 4 + length);  
			              // 记录字符串长度，反序列化的时候需要  
			              byteBuffer.putInt(userId);  
			              byteBuffer.putInt(length);  
			              byteBuffer.put(bytes);  
			    
			              return byteBuffer.array();  
			          } catch (UnsupportedEncodingException e) {  
			              throw new SerializationException(e.getMessage());  
			          }  
			      }  
			    
			      public void close() {  
			    
			      }  
			  }  
			    
			  ```

			- MyProducer
			  ```java  
			  import org.apache.kafka.clients.producer.*;  
			  import org.apache.kafka.common.serialization.StringSerializer;  
			    
			  import java.util.HashMap;  
			  import java.util.Map;  
			  import java.util.concurrent.ExecutionException;  
			  import java.util.concurrent.Future;  
			    
			  public class MyProducer {  
			      public static void main(String[] args) throws ExecutionException, InterruptedException {  
			          Map<String, Object> configs = new HashMap<String, Object>();  
			          configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
			          configs.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
			          configs.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, UserSerializer.class);  
			    
			          Producer<String, User> producer = new KafkaProducer<String, User>(configs);  
			    
			          User user = new User(10071, "张飞");  
			          ProducerRecord<String, User> producerRecord = new ProducerRecord(  
			                  "tp-user-01",  
			                  user.getUsername(),  
			                  user  
			          );  
			    
			          Future<RecordMetadata> send = producer.send(producerRecord);  
			          RecordMetadata recordMetadata = send.get();  
			          System.out.println(recordMetadata.topic() + "\t" + recordMetadata.partition() + "\t" + recordMetadata.offset());  
			    
			          producer.close();  
			    
			      }  
			  }  
			    
			  ```

	- 分区器<br>
![](/resource/kafka/assets/DA633DF7-9A58-45AF-B576-F744BCBC6374.png)
	  默认(DefaultPartitioner)分区计算:  
	  1. 如果record提供了分区号，则使用record提供的分区号  
	  2. 如果record没有提供分区号，则使用key的序列化后的值的hash值对分区数量取模   
	  3. 如果record没有提供分区号，也没有提供key，则使用轮询的方式分配分区号:  
	  	1. 会首先在可用的分区中分配分区号  
	  	2. 如果没有可用的分区，则在该主题所有分区中分配分区号。

		- 自定义分区器
		  如果要自定义分区器，则需要  
		  1. 首先开发Partitioner接口的实现类  
		  2. 在KafkaProducer中进行设置:configs.put("partitioner.class", "xxx.xx.Xxx.class")  
		    
		  ```java  
		  import org.apache.kafka.clients.producer.Partitioner;  
		  import org.apache.kafka.common.Cluster;  
		    
		  import java.util.Map;  
		    
		  public class MyPartitioner implements Partitioner {  
		      public int partition(String topic, Object key, byte[] keyBytes, Object value, byte[] valueBytes, Cluster cluster) {  
		          return 2;  
		      }  
		    
		      public void close() {  
		    
		      }  
		    
		      public void configure(Map<String, ?> configs) {  
		    
		      }  
		  }  
		    
		    
		  // 指定分区器  
		  configs.put(ProducerConfig.PARTITIONER_CLASS_CONFIG, MyPartitioner.class);  
		  ```

	- 拦截器<br>
![](/resource/kafka/assets/25A7F84C-FADF-4FE5-A4D3-E849D3F65907.png)
	  Producer拦截器(interceptor)和Consumer端Interceptor是在Kafka 0.10版本被引入的，主要用 于实现Client端的定制化控制逻辑。  
	  对于Producer而言，Interceptor使得用户在消息发送前以及Producer回调逻辑前有机会对消息做 一些定制化需求，比如修改消息等。同时，Producer允许用户指定多个Interceptor按序作用于同一条消 息从而形成一个拦截链(interceptor chain)。Intercetpor的实现接口是 org.apache.kafka.clients.producer.ProducerInterceptor

		- ProducerInterceptor
		  Interceptor可能被运行在多个线程中，因此在具体实现时用户需要自行确保线程安全。 另外倘若指定了多个Interceptor，则Producer将按照指定顺序调用它们，并仅仅是捕获每个 Interceptor可能抛出的异常记录到错误日志中而非在向上传递。这在使用过程中要特别留意。

			- onSend(ProducerRecord)
			  该方法封装进KafkaProducer.send方法中，即运行在用户主线程 中。Producer确保在消息被序列化以计算分区前调用该方法。用户可以在该方法中对消息做任 何操作，但最好保证不要修改消息所属的topic和分区，否则会影响目标分区的计算。

			- onAcknowledgement(RecordMetadata, Exception)
			  该方法会在消息被应答之前或消息发送 失败时调用，并且通常都是在Producer回调逻辑触发之前。onAcknowledgement运行在Producer的IO线程中，因此不要在该方法中放入很重的逻辑，否则会拖慢Producer的消息发 送效率。

			- close
			  关闭Interceptor，主要用于执行一些资源清理工作。

		- 自定义拦截器
		  1. 实现org.apache.kafka.clients.producer.ProducerInterceptor接口  
		  2. 在KafkaProducer的设置中设置自定义的拦截器, 多个拦截器用”,”隔开，例如:  
		  ```java  
		  config.put(ProducerConfig.INTERCEPTOR_CLASSES_CONFIG,  
		          "com.lagou.kafka.demo.InterceptorOne," +  
		                  "com.lagou.kafka.demo.InterceptorTwo," +  
		                  "com.lagou.kafka.demo.InterceptorThree");  
		  ```  
		    
		  拦截顺序如下:  
		  ```java  
		  onSend --- 1  
		  onSend --- 2  
		  onSend --- 3  
		  onAcknowledgement --- 1  
		  onAcknowledgement --- 2  
		  onAcknowledgement --- 3  
		  ```

- 原理剖析<br>
![](/resource/kafka/assets/D9A5AFFE-D56A-4524-BBA4-A10EF036B06E.png)
  由上图可以看出:KafkaProducer有两个基本线程:

	- 主线程
	  负责消息创建，拦截器，序列化器，分区器等操作，并将消息追加到消息收集器RecoderAccumulator中;  
	  * 消息收集器RecoderAccumulator为每个分区都维护了一个 Deque<ProducerBatch> 类型的双端队列。  
	  * ProducerBatch 可以理解为是 ProducerRecord 的集合，批量发送有利于提升吞吐 量，降低网络影响;  
	  * 由于生产者客户端使用 java.io.ByteBuffer 在发送消息之前进行消息保存，并维护了 一个 BufferPool 实现 ByteBuffer 的复用;该缓存池只针对特定大小( batch.size 指定)的 ByteBuffer进行管理，对于消息过大的缓存，不能做到重复利用。  
	  * 每次追加一条ProducerRecord消息，会寻找/新建对应的双端队列，从其尾部获取一 个ProducerBatch，判断当前消息的大小是否可以写入该批次中。若可以写入则写 入;若不可以写入，则新建一个ProducerBatch，判断该消息大小是否超过客户端参 数配置 batch.size 的值，不超过，则以 batch.size建立新的ProducerBatch，这样方 便进行缓存重复利用;若超过，则以计算的消息大小建立对应的 ProducerBatch， 缺点就是该内存不能被复用了。

	- Sender线程
	  * 该线程从消息收集器获取缓存的消息，将其处理为 <Node,List<ProducerBatch> 的 形式， Node 表示集群的broker节点。  
	  * 进一步将<Node,List<ProducerBatch>转化为<Node, Request>形式，此时才可以 向服务端发送数据。  
	  * 在发送之前，Sender线程将消息以 Map<NodeId, Deque<Request>> 的形式保存到 InFlightRequests 中进行缓存，可以通过其获取 leastLoadedNode ,即当前Node中负载压力最小的一个，以实现消息的尽快发出。

### 消费者

- 概念

	- 消费者&消费组<br>
![](/resource/kafka/assets/8FA047B2-1840-42C3-96D3-B033C1552423.png)
	  消费者从订阅的主题消费消息，消费消息的偏移量保存在Kafka的名字是 __consumer_offsets 的主题中。  
	    
	  消费者还可以将自己的偏移量存储到Zookeeper，需要设置offset.storage=zookeeper。  
	  推荐使用Kafka存储消费者的偏移量。因为Zookeeper不适合高并发。  
	    
	  多个从同一个主题消费的消费者可以加入到一个消费组中。 消费组中的消费者共享group_id。  
	  `configs.put("group.id", "xxx”);`  
	    
	  group_id一般设置为应用的逻辑名称。比如多个订单处理程序组成一个消费组，可以设置group_id 为"order_process"。  
	  group_id通过消费者的配置指定: group.id=xxxxx 消费组均衡地给消费者分配分区，每个分区只由消费组中一个消费者消费。

	- 心跳机制
	  Kafka 的心跳是 Kafka Consumer 和 Broker 之间的健康检查，只有当 Broker Coordinator 正常时，Consumer 才会发送心跳。

- 消息接收

	- 必要参数配置

		- bootstrap.servers
		  向Kafka集群建立初始连接用到的host/port列表。  
		  客户端会使用这里列出的所有服务器进行集群其他服务器的发现，而不管是否指定了哪个服务器用作引导。这个列表仅影响用来发现集群所有服务器的初始主机。  
		  字符串形式:host1:port1,host2:port2,  
		  由于这组服务器仅用于建立初始链接，然后发现集群中的所有服务器，因此没有必要将集群中的所有地址写在这里。一般最好两台，以防其中一台宕掉。

		- key.deserializer
		  key的反序列化类，该类需要实现  
		  org.apache.kafka.common.serialization.Deserializer接口。

		- value.deserializer
		  实现了org.apache.kafka.common.serialization.Deserializer接口的反序列化器，用于对消息的value进行反序列化。

		- client.id
		  当从服务器消费消息的时候向服务器发送的id字符串。在ip/port基础上提供应用的逻辑名称，记录在服务端的请求日志中，用于追踪请求的源。

		- group.id
		  用于唯一标志当前消费者所属的消费组的字符串。  
		  如果消费者使用组管理功能如subscribe(topic)或使用基于Kafka的偏移量管理策略，该项必须设置。

		- auto.offset.reset
		  当Kafka中没有初始偏移量或当前偏移量在服务器中不存在(如，数据被删除了)，该如何处理?  
		  earliest:自动重置偏移量到最早的偏移量  
		  latest:自动重置偏移量为最新的偏移量  
		  none:如果消费组原来的(previous)偏移量不存在，则向消费者抛异常  
		  anything:向消费者抛异常

		- enable.auto.commit
		  如果设置为true，消费者会自动周期性地向服务器提交偏移量。

	- 订阅
	  consumer 采用 pull 模式从 broker 中读取数据。  
	  采用 pull 模式，consumer 可自主控制消费消息的速率， 可以自己控制消费方式(批量消费/逐条  
	  消费)，还可以选择不同的提交方式从而实现不同的传输语义。 

		- 主题和分区<br>
![](/resource/kafka/assets/5E99795F-1A1D-4760-A01D-EC0DC1788B50.png)

			- Topic
			  Kafka用于分类管理消息的逻辑单元，类似与MySQL的数据库。

			- Partition
			  是Kafka下数据存储的基本单元，这个是物理上的概念。同一个topic的数据，会 被分散的存储到多个partition中，这些partition可以在同一台机器上，也可以是在多台机器 上。优势在于:有利于水平扩展，避免单台机器在磁盘空间和性能上的限制，同时可以通过复 制来增加数据冗余性，提高容灾能力。为了做到均匀分布，通常partition的数量通常是Broker Server数量的整数倍。

			- Consumer Group
			  同样是逻辑上的概念，是Kafka实现单播和广播两种消息模型的手段。 保证一个消费组获取到特定主题的全部的消息。在消费组内部，若干个消费者消费主题分区的 消息，消费组可以保证一个主题的每个分区只被消费组中的一个消费者消费。

	- 反序列化
	  Kafka的broker中所有的消息都是字节数组，消费者获取到消息之后，需要先对消息进行反序列化  
	  处理，然后才能交给用户程序消费处理。 消费者的反序列化器包括key的和value的反序列化器。  
	  key.deserializer, value.deserializer

		- 自定义反序列化
		  自定义反序列化类，需要实现 org.apache.kafka.common.serialization.Deserializer<T> 接口。

			- User
			  ```java  
			  public class User {  
			      private Integer userId;  
			      private String username;  
			  }  
			  ```

			- UserConsumer
			  ```java  
			  import org.apache.kafka.clients.consumer.ConsumerConfig;  
			  import org.apache.kafka.clients.consumer.ConsumerRecord;  
			  import org.apache.kafka.clients.consumer.ConsumerRecords;  
			  import org.apache.kafka.clients.consumer.KafkaConsumer;  
			  import org.apache.kafka.common.serialization.StringDeserializer;  
			  import java.util.Arrays;  
			  import java.util.HashMap;  
			  import java.util.Map;  
			    
			  public class UserConsumer {  
			      public static void main(String[] args) {  
			    
			          Map<String, Object> configs = new HashMap<String, Object>();  
			          configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
			          configs.put(ConsumerConfig.GROUP_ID_CONFIG, "consumer1");  
			          configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);  
			          configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, UserDeserializer.class);  
			          configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "con1");  
			          configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");  
			    
			    
			          KafkaConsumer<String, User> consumer = new KafkaConsumer<String, User>(configs);  
			    
			          consumer.subscribe(Arrays.asList("tp-user-01"));  
			    
			          while (true) {  
			              ConsumerRecords<String, User> consumerRecords = consumer.poll(3_000);  
			              for (ConsumerRecord<String, User> record : consumerRecords) {  
			                  System.out.println(record.topic() + "\t" + record.partition() + "\t" + record.offset() + "\t" + record.key() + ":" + record.value());  
			              }  
			          }  
			    
			      }  
			  }  
			    
			  ```

			- UserDeserializer
			  ```java  
			  import org.apache.kafka.common.serialization.Deserializer;  
			  import java.nio.ByteBuffer;  
			  import java.util.Map;  
			    
			  public class UserDeserializer implements Deserializer<User> {  
			      @Override  
			      public void configure(Map<String, ?> configs, boolean isKey) {  
			    
			      }  
			    
			      @Override  
			      public User deserialize(String topic, byte[] data) {  
			          // 安装序列化的顺序拆包  
			          if (data.length < 8) {  
			              return new User(-1, new String(data));  
			          }  
			          ByteBuffer byteBuffer = ByteBuffer.allocate(data.length);  
			          byteBuffer.put(data);  
			    
			          //把指针设置到0  
			          byteBuffer.flip();  
			          Integer userid = byteBuffer.getInt();  
			          Integer len = byteBuffer.getInt();  
			    
			          byteBuffer.get();  
			          String userName = new String(data, 8, len);  
			    
			          return new User(userid, userName);  
			      }  
			    
			      @Override  
			      public void close() {  
			    
			      }  
			  }  
			  ```

	- 位移提交
	  1. Consumer需要向Kafka记录自己的位移数据，这个汇报过程称为提交位移(Committing offsets)  
	  2. Consumer需要为分配给它的每个分区提交各自的位移数据  
	  3.位移提交的由Consumer端负责的，Kafka只负责保管._consumer_offsets  
	  4.位移提交分为自动提交和手动提交  
	  5.位移提交分为同步提交和异步提交

		- 自动提交
		  Kafka Consumer 后台提交  
		  * 开启自动提交:enable.auto.commit=true  
		  * 配置自动提交间隔:Consumer端:auto.commit.interval.ms，默认5s

			- 自动提交位移的顺序
			  * 配置enable.auto.commit= true  
			  * Kafka会保证在开始调用pol方法时，提交上次poll返回的所有消息  
			  * 因此自动提交不会出现消息丢失，但会重复消费

			- 重复消费举例
			  * Consumer 每 5s 提交 offset  
			  * 假设提交 offset 后的 3s 发生了 Rebalance  
			  * Rebalance 之后的所有 Consumer 从上一次提交的 offset 处继续消费   
			  * 因此 Rebalance 发生前 3s 的消息会被重复消费

		- 手动提交

			- 同步提交
			  * 使用 KafkaConsumer#commitSync():会提交 KafkaConsumer#poll() 返回的最新 offset  
			  * 该方法为同步操作，等待直到 offset 被成功提交才返回  
			    
			  ```java  
			  while (true) {  
			      ConsumerRecords<String, String> records =  
			  consumer.poll(Duration.ofSeconds(1)); process(records); // 处理消息  
			  try {  
			          consumer.commitSync();  
			      } catch (CommitFailedException e) {  
			  handle(e); // 处理提交失败异常 }  
			  }  
			  ```  
			    
			  * commitSync 在处理完所有消息之后 * 手动同步提交可以控制offset提交的时机和频率  
			  * 手动同步提交会:  
			  	* 调用 commitSync 时，Consumer 处于阻塞状态，直到 Broker 返回结果  
			  	* 会影响 TPS  
			  	* 可以选择拉长提交间隔，但有以下问题  
			  		* 会导致 Consumer 的提交频率下降  
			  		* Consumer 重启后，会有更多的消息被消费

			- 异步提交
			  KafkaConsumer#commitAsync()  
			    
			  ```java  
			  while (true) {  
			  ConsumerRecords<String, String> records = consumer.poll(3_000); process(records); // 处理消息  
			  consumer.commitAsync((offsets, exception) -> {  
			          if (exception != null) {  
			              handle(exception);  
			  } });  
			  }  
			  ```  
			    
			  commitAsync出现问题不会自动重试,  
			  处理方式:  
			    
			  ```java  
			  try {  
			      while(true) {  
			      ConsumerRecords<String, String> records =  
			  consumer.poll(Duration.ofSeconds(1));  
			  process(records); // 处理消息 commitAysnc(); // 使用异步提交规避阻塞 }  
			  } catch(Exception e) { handle(e); // 处理异常  
			  } finally {  
			      try {  
			  consumer.commitSync(); // 最后一次提交使用同步阻塞式提交 } finally {  
			          consumer.close();  
			      }  
			  }  
			  ```

	- 消费者位移管理
	  Kafka中，消费者根据消息的位移顺序消费消息。  
	  消费者的位移由消费者管理，可以存储于zookeeper中，也可以存储于Kafka主题 __consumer_offsets中。  
	  Kafka提供了消费者API，让消费者可以管理自己的位移。  
	  offset一旦提交后就会被kafka记录，同一group再次消费会在原先的位置继续消费

		- 数据准备
		  ```sh  
		  # 生成60条带序号的字符串到nm.txt  
		  for i in `seq 60`; do echo "hello April $i" >> nm.txt; done   
		  # 创建主题 tp_demo_01  
		  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic tp_demo_01 --partitions 3 --replication-factor 1  
		  # 把文本中的数据逐条发布到主题 tp_demo_01  
		  kafka-console-producer.sh --broker-list centos7-3:9092 --topic tp_demo_01 < nm.txt  
		  # 查看数据  
		  kafka-console-consumer.sh --bootstrap-server centos7-3:9092 --topic tp_demo_01 --from-beginning  
		  ```

		- 手动设置的api

			- public void assign(Collection<TopicPartition> partitions)

			- public Set<TopicPartition> assignment()

			- public Map<String, List<PartitionInfo>> listTopics()

			- public List<PartitionInfo> partitionsFor(String topic)

			- public Map<TopicPartition, Long> beginningOffsets(Collection<TopicPartition> partitions)

			- public void seekToEnd(Collection<TopicPartition> partitions)

			- public void seek(TopicPartition partition, long offset)

			- public long position(TopicPartition partition)

			- public void seekToBeginning(Collection<TopicPartition> partitions)

	- 再均衡
	  重平衡其实就是一个协议，它规定了如何让消费者组下的所有消费者来分配topic中的每一个分区。 比如一个topic有100个分区，一个消费者组内有20个消费者，在协调者的控制下让组内每一个消费者分 配到5个分区，这个分配的过程就是重平衡。

		- 触发再平衡的场景

			- 费者宕机，退出消费组，触发再平衡，重新给消费组中的消费者分配分区<br>
![](/resource/kafka/assets/3CA6FB41-55C2-4247-A5D9-31629F2EE70A.png)

			- 由于broker宕机，主题X的分区3宕机，此时分区3没有Leader副本，触发再平衡，消费者4没有对 应的主题分区，则消费者4闲置<br>
![](/resource/kafka/assets/EAEBA0DC-0EB5-46A7-91BC-667A169C316C.png)

			- 主题增加分区，需要主题分区和消费组进行再均衡<br>
![](/resource/kafka/assets/2C01C155-6A3E-421D-966F-21FA0340586C.png)

			- 由于使用正则表达式订阅主题，当增加的主题匹配正则表达式的时候，也要进行再均衡<br>
![](/resource/kafka/assets/49BB6B22-F2B9-4AB4-85F6-A89272AA91EB.png)

		- 再平衡产生的问题
		  重平衡过程中，消费者无法从kafka消费消息，这对kafka的TPS 影响极大，而如果kafka集内节点较多，比如数百个，那重平衡可能会耗时极多。数分钟到数小时都有 可能，而这段时间kafka基本处于不可用状态。所以在实际环境中，应该尽量避免重平衡发生

		- 避免重平衡
		  要说完全避免重平衡，是不可能，因为你无法完全保证消费者不会故障。而消费者故障其实也是最 常见的引发重平衡的地方，所以我们需要保证尽力避免消费者故障。  
		    而其他几种触发重平衡的方式，增加分区，或是增加订阅的主题，抑或是增加消费者，更多的是主  
		  动控制。  
		  如果消费者真正挂掉了，就没办法了，但实际中，会有一些情况，kafka错误地认为一个正常的消 费者已经挂掉了，我们要的就是避免这样的情况出现。  
		  首先要知道哪些情况会出现错误判断挂掉的情况。 在分布式系统中，通常是通过心跳来维持分布式系统的，kafka也不例外。  
		  在分布式系统中，由于网络问题你不清楚没接收到心跳，是因为对方真正挂了还是只是因为负载过 重没来得及发生心跳或是网络堵塞。所以一般会约定一个时间，超时即判定对方挂了。**而在kafka消费 者场景中，session.timout.ms参数就是规定这个超时时间是多少。**  
		    
		  还有一个参数，**heartbeat.interval.ms**，这个参数控制发送心跳的频率，频率越高越不容易被误 判，但也会消耗更多资源。  
		  此外，还有最后一个参数，max.poll.interval.ms，消费者poll数据后，需要一些处理，再进行拉 取。如果两次拉取时间间隔超过这个参数设置的值，那么消费者就会被踢出消费者组。也就是说，拉 取，然后处理，这个处理的时间不能超过 **max.poll.interval.ms** 这个参数的值。这个参数的默认值是 5分钟，而如果消费者接收到数据后会执行耗时的操作，则应该将其设置得大一些。  
		    
		  这里给出一个相对较为合理的配置，如下:  
		  session.timout.ms:设置为6s  
		  heartbeat.interval.ms:设置2s max.poll.interval.ms:推荐为消费者处理消息最长耗时再加1分钟

			- session.timout.ms控制心跳超时时间

			- heartbeat.interval.ms控制心跳发送频率

			- max.poll.interval.ms控制poll的间隔

	- 消费者拦截器
	  消费者在拉取了分区消息之后，要首先经过反序列化器对key和value进行反序列化处理。  
	    处理完之后，如果消费端设置了拦截器，则需要经过拦截器的处理之后，才能返回给消费者应用程序进行处理。  
	    
	  消费端定义消息拦截器，需要实现  
	  org.apache.kafka.clients.consumer.ConsumerInterceptor<K, V> 接口  
	  1. 一个可插拔接口，允许拦截甚至更改消费者接收到的消息。首要的用例在于将第三方组件引入 消费者应用程序，用于定制的监控、日志处理等。  
	  2. 该接口的实现类通过config方法获取消费者配置的属性，如果消费者配置中没有指定 clientID，还可以获取KafkaConsumer生成的clientId。获取的这个配置是跟其他拦截器共享 的，需要保证不会在各个拦截器之间产生冲突。  
	  3. ConsumerInterceptor方法抛出的异常会被捕获、记录，但是不会向下传播。如果用户配置了错误的key或value类型参数，消费者不会抛出异常，而仅仅是记录下来。  
	  4. ConsumerInterceptor回调发生在 org.apache.kafka.clients.consumer.KafkaConsumer#poll(long)方法同一个线程。

		- 示例代码
		  ```java  
		  // 配置拦截器类  
		  configs.put(ConsumerConfig.INTERCEPTOR_CLASSES_CONFIG,  
		          "com.lagou.kafka.demo.ConsumerInterceptorOne"  
		                  + ",com.lagou.kafka.demo.ConsumerInterceptorTwo"  
		          + ",com.lagou.kafka.demo.ConsumerInterceptorThree");  
		    
		    
		    
		  import org.apache.kafka.clients.consumer.ConsumerInterceptor;  
		  import org.apache.kafka.clients.consumer.ConsumerRecords;  
		  import org.apache.kafka.clients.consumer.OffsetAndMetadata;  
		  import org.apache.kafka.common.TopicPartition;  
		    
		  import java.util.Map;  
		    
		  public class ConsumerInterceptorOne implements ConsumerInterceptor<String, String> {  
		    
		      /**  
		       *  在接收到consumer接收到消息之前调用  
		       * @param records  
		       * @return  
		       */  
		      @Override  
		      public ConsumerRecords<String, String> onConsume(ConsumerRecords<String, String> records) {  
		    
		          System.out.println("onConsume -- " + this.getClass().getSimpleName());  
		          return records;  
		      }  
		    
		      /**  
		       * 在consumer提交offset之前的时候调用  
		       * @param offsets  
		       */  
		      @Override  
		      public void onCommit(Map<TopicPartition, OffsetAndMetadata> offsets) {  
		          System.out.println("onCommit -- " + this.getClass().getSimpleName());  
		      }  
		    
		      @Override  
		      public void close() {  
		    
		      }  
		    
		      /**  
		       * 初始化的时候调用  
		       * @param configs  
		       */  
		      @Override  
		      public void configure(Map<String, ?> configs) {  
		          System.out.println(this.getClass().getSimpleName()+"-config");  
		          configs.forEach((k, v) -> {  
		              System.out.println(k + " : " + v);  
		          });  
		      }  
		  }  
		    
		  ```

- 消费组管理

	- 什么是消费者组
	  consumer group是kafka提供的可扩展且具有容错性的消费者机制。  
	  三个特性:  
	  1. 消费组有一个或多个消费者，消费者可以是一个进程，也可以是一个线程   
	  2. group.id是一个字符串，唯一标识一个消费组  
	  3. 消费组订阅的主题每个分区只能分配给消费组中的一个消费者。

	- 消费者位移
	  消费者在消费的过程中记录已消费的数据，即消费位移(offset)信息。每个消费组保存自己的位移信息，那么只需要简单的一个整数表示位置就够了;同时可以引入 checkpoint机制定期持久化。

	- 位移管理

		- 自动VS手动
![](/resource/kafka/assets/F5CAF0F5-E200-4522-BD75-AB5F70E86E79.png)
		  Kafka默认定期自动提交位移( enable.auto.commit = true )，也手动提交位移。另外kafka会定 期把group消费情况保存起来，做成一个offset map

		- 位移提交
		  位移是提交到Kafka中的 __consumer_offsets 主题。 __consumer_offsets 中的消息保存了每个消费组某一时刻提交的offset信息。  
		    
		  ```sh  
		  # 查看主题原数据  
		    
		  kafka-console-consumer.sh --topic __consumer_offsets --bootstrap-server centos7-3:9092 --formatter "kafka.coordinator.group.GroupMetadataManager\$OffsetsMessageFormatter" --consumer.config /opt/lagou/servers/kafka_2.12-1.0.2/config/consumer.properties --from-beginning | head  
		  ```  
		    
		  __consumers_offsets 主题配置了compact策略，使得它总是能够保存最新的位移信息，既控制 了该topic总体的日志容量，也能实现保存最新offset的目的。

	- 再谈再均衡

		- 什么是再均衡?
		  再均衡(Rebalance)本质上是一种协议，规定了一个消费组中所有消费者如何达成一致来分配订 阅主题的每个分区。  
		  比如某个消费组有20个消费组，订阅了一个具有100个分区的主题。正常情况下，Kafka平均会为每 个消费者分配5个分区。这个分配的过程就叫再均衡。

		- 什么时候再均衡?
		  再均衡的触发条件:  
		  1. 组成员发生变更(新消费者加入消费组组、已有消费者主动离开或崩溃了)  
		  2. 订阅主题数发生变更。如果正则表达式进行订阅，则新建匹配正则表达式的主题触发再均衡。  
		  3. 订阅主题的分区数发生变更

		- 如何进行组内分区分配?
		  三种分配策略:RangeAssignor和RoundRobinAssignor以及StickyAssignor

		- 谁来执行再均衡和消费组管理?
		  Kafka提供了一个角色:Group Coordinator来执行对于消费组的管理。  
		  Group Coordinator——每个消费组分配一个消费组协调器用于组管理和位移管理。当消费组的第 一个消费者启动的时候，它会去和Kafka Broker确定谁是它们组的组协调器。之后该消费组内所有消费 者和该组协调器协调通信。

		- 如何确定coordinator?
		  两步:  
		  1. 确定消费组位移信息写入 __consumers_offsets 的哪个分区。具体计算公式:  
		  __consumers_offsets partition# = Math.abs(groupId.hashCode() % groupMetadataTopicPartitionCount) 注意:groupMetadataTopicPartitionCount 由 offsets.topic.num.partitions 指定，默认是50个分区。  
		  2. 该分区leader所在的broker就是组协调器。

		- Rebalance Generation<br>
![](/resource/kafka/assets/F3798C00-41A4-4C61-AADF-8A45D776231D.png)
		  它表示Rebalance之后主题分区到消费组中消费者映射关系的一个版本，主要是用于保护消费组， 隔离无效偏移量提交的。如上一个版本的消费者无法提交位移到新版本的消费组中，因为映射关系变 了，你消费的或许已经不是原来的那个分区了。每次group进行Rebalance之后，Generation号都会加 1，表示消费组和分区的映射关系到了一个新版本，如下图所示: Generation 1时group有3个成员，随 后成员2退出组，消费组协调器触发Rebalance，消费组进入Generation 2，之后成员4加入，再次触发 Rebalance，消费组进入Generation 3.

		- 协议(protocol)
		  kafka提供了5个协议来处理与消费组协调相关的问题:  
		  * Heartbeat请求:consumer需要定期给组协调器发送心跳来表明自己还活着   
		  * LeaveGroup请求:主动告诉组协调器我要离开消费组   
		  * SyncGroup请求:消费组Leader把分配方案告诉组内所有成员   
		  * JoinGroup请求:成员请求加入组   
		  * DescribeGroup请求:显示组的所有信息，包括成员信息，协议名称，分配方案，订阅信息等。通常该请求是给管理员使用  
		  组协调器在再均衡的时候主要用到了前面4种请求。

		- liveness
		  消费者如何向消费组协调器证明自己还活着? 通过定时向消费组协调器发送Heartbeat请求。如果 超过了设定的超时时间，那么协调器认为该消费者已经挂了。一旦协调器认为某个消费者挂了，那么它 就会开启新一轮再均衡，并且在当前其他消费者的心跳响应中添加“REBALANCE_IN_PROGRESS”，告诉 其他消费者:重新分配分区。

		- 再均衡过程
![](/resource/kafka/assets/9D942920-D521-4A4D-B8A9-260D9E2C211C.png)
		  再均衡分为2步:Join和Sync  
		  1. Join， 加入组。所有成员都向消费组协调器发送JoinGroup请求，请求加入消费组。一旦所有 成员都发送了JoinGroup请求，协调i器从中选择一个消费者担任Leader的角色，并把组成员信 息以及订阅信息发给Leader。  
		  2. Sync，Leader开始分配消费方案，即哪个消费者负责消费哪些主题的哪些分区。一旦完成分 配，Leader会将这个方案封装进SyncGroup请求中发给消费组协调器，非Leader也会发 SyncGroup请求，只是内容为空。消费组协调器接收到分配方案之后会把方案塞进SyncGroup 的response中发给各个消费者。  
		    
		  注意:消费组的分区分配方案在客户端执行。Kafka交给客户端可以有更好的灵活性。Kafka默认提 供三种分配策略:range和round-robin和sticky。可以通过消费者的参数:  
		  partition.assignment.strategy 来实现自己分配策略。

		- 消费组状态机<br>
![](/resource/kafka/assets/68308FDB-ADF3-4EAE-92D1-9EAD4D6DFC26.png)
		  消费组组协调器根据状态机对消费组做不同的处理:  
		  1. Dead:组内已经没有任何成员的最终状态，组的元数据也已经被组协调器移除了。这种状态 响应各种请求都是一个response: UNKNOWN_MEMBER_ID  
		  2. Empty:组内无成员，但是位移信息还没有过期。这种状态只能响应JoinGroup请求  
		  3. PreparingRebalance:组准备开启新的rebalance，等待成员加入  
		  4. AwaitingSync:正在等待leader consumer将分配方案传给各个成员  
		  5. Stable:再均衡完成，可以开始消费。

### 主题

- 管理
  使用kafka-topics.sh脚本:  
  什么都不输入可以查看简单文档  
  具体配置可以在官网查看：http://kafka.apache.org/documentation/#topicconfigs

	- 创建主题
	  ```sh  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_test_1 --partitions 3 --replication-factor 1  
	    
	  # 添加参数，--config  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --create --topic topic_test_3 --partitions 3 --replication-factor 1 --config cleanup.policy=compact --config max.message.bytes=10000  
	  ```

	- 查看主题
	  可以在zookeeper中查看主题的配置信息`/mykafka/config/topics/`  
	    
	  在/kafka-logs 文件夹中查看对应主题的元数据  
	    
	  ```sh  
	  kafka-topics.sh --zookeeper localhost:2181/myKafka --list  
	    
	  kafka-topics.sh --zookeeper localhost:2181/myKafka --describe --topic topic_x  
	    
	  kafka-topics.sh --zookeeper localhost:2181/myKafka --topics-with-overrides --describe  
	  ```

	- 修改主题
	  ```sh  
	  # —alter  
	    
	  # 添加配置  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --alter --topic topic_test_1 --config max.message.bytes=1048576  
	    
	  # 移除配置  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --alter --topic topic_test_1 --delete-config max.message.bytes  
	  ```

	- 删除主题
	  ```sh  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --delete --topic topic_test_1  
	  ```  
	    
	  执行命令之后先给主题添加删除的标记:  
	  `topic_test_1-0.fd292e8a0b014bb7802139c3b4356844-delete`  
	  要过一段时间才会真正删除

	- 增加分区
	  分区只能增加，不能减少  
	    
	  ```sh  
	  kafka-topics.sh --zookeeper localhost:2181/mykafka --alter --topic topic_test_2 --partitions 4  
	  ```

- 分区副本的分配
  副本分配的三个目标:  
  1. 均衡地将副本分散于各个broker上  
  2. 对于某个broker上分配的分区，它的其他副本只能在其他broker上  
  3. 如果所有的broker都有机架信息，尽量将分区的各个副本分配到不同机架上的broker。  
    
  在不考虑机架信息的情况下:  
  1. 第一个副本分区通过轮询的方式挑选一个broker，进行分配。该轮询从broker列表的随机位置 进行轮询。  
  2. 其余副本通过增加偏移进行分配。

- 必要参数配置<br>
![](/resource/kafka/assets/7E27E3AB-9E9F-40AA-8D0C-A9F9E784675D.png)
  http://kafka.apache.org/documentation/#topicconfigs

- KafkaAdminClient应用
  除了使用Kafka的bin目录下的脚本工具来管理Kafka，还可以使用管理Kafka的API将某些管理查看 的功能集成到系统中。在Kafka0.11.0.0版本之前，可以通过kafka-core包(Kafka的服务端，采用Scala 编写)中的AdminClient和AdminUtils来实现部分的集群管理操作。Kafka0.11.0.0之后，又多了一个 AdminClient，在kafka-client包下，一个抽象类，具体的实现是 org.apache.kafka.clients.admin.KafkaAdminClient。  
    
  主要操作步骤: 客户端根据方法的调用创建相应的协议请求，比如创建Topic的createTopics方法，其内部就是发送  
  CreateTopicRequest请求。  
  客户端发送请求至Kafka Broker。  
  Kafka Broker处理相应的请求并回执，比如与CreateTopicRequest对应的是 CreateTopicResponse。  
  客户端接收相应的回执并进行解析处理。  
  和协议有关的请求和回执的类基本都在org.apache.kafka.common.requests包中， AbstractRequest和AbstractResponse是这些请求和响应类的两个父类。  
    综上，如果要自定义实现一个功能，只需要三个步骤:  
  1. 自定义XXXOptions;  
  2. 自定义XXXResult返回值;  
  3. 自定义Call，然后挑选合适的XXXRequest和XXXResponse来实现Call类中的3个抽象方法。

	- 功能与原理介绍
	  其内部原理是使用Kafka自定义的一套二进制协议来实现，详细可以参见Kafka协议。

		- createTopics

		- deleteTopics

		- listTopics

		- describeTopics

		- describeCluster

		- describeConfigs

		- alterConfigs

		- alterReplicaLogDirs

		- describeLogDirs

		- describeReplicaLogDirs

		- createPartitions

	- 用到的参数<br>
![](/resource/kafka/assets/D65A6433-D065-48F4-900F-710E391E94D7.png)

	- 示例代码
	  ```java  
	  public class MyAdminClient {  
	      private KafkaAdminClient client;  
	    
	      @Before  
	      public void before() {  
	          Map<String, Object> configs = new HashMap<String, Object>();  
	          configs.put("bootstrap.servers", "centos7-3:9092");  
	          configs.put("client.id", "april-1");  
	    
	          client = (KafkaAdminClient) KafkaAdminClient.create(configs);  
	      }  
	    
	      @After  
	      public void after() {  
	          client.close();  
	      }  
	    
	      /**  
	       * 列处所有topic  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testListTopic() throws ExecutionException, InterruptedException {  
	          ListTopicsResult listTopicsResult = client.listTopics();  
	    
	          // 获取名字列表  
	  //        KafkaFuture<Set<String>> names = listTopicsResult.names();  
	  //        Set<String> strings = names.get();  
	  //        System.out.println(strings);  
	    
	    
	          // 名字和信息  
	          Map<String, TopicListing> stringTopicListingMap = listTopicsResult.namesToListings().get();  
	          stringTopicListingMap.forEach((k, v)->{  
	              System.out.println(k + " -> " + v);  
	          });  
	      }  
	    
	      /**  
	       * 创建topic  
	       */  
	      @Test  
	      public void testCreateTopic() {  
	          Map<String, String> configs = new HashMap<>();  
	          configs.put("max.message.bytes", "1048576");  
	    
	          NewTopic newTopic = new NewTopic("client_01", 3, (short) 1);  
	          newTopic.configs(configs);  
	    
	          CreateTopicsResult topicsResult = client.createTopics(Collections.singleton(newTopic));  
	          topicsResult.values().forEach((k, v) -> {  
	              System.out.println(k);  
	          });  
	      }  
	    
	      /**  
	       * 移除topic  
	       */  
	      @Test  
	      public void testDeleteTopic() {  
	          DeleteTopicsOptions deleteTopicsOptions = new DeleteTopicsOptions();  
	          deleteTopicsOptions.timeoutMs(500);  
	    
	          DeleteTopicsResult result = client.deleteTopics(Collections.singleton("client_02"), deleteTopicsOptions);  
	          result.values().forEach((k, v) -> {  
	              System.out.println(k);  
	          });  
	      }  
	    
	      /**  
	       * 给topic增加分区  
	       */  
	      @Test  
	      public void testAlterTopic() {  
	          NewPartitions newPartitions = NewPartitions.increaseTo(5);  
	          Map<String, NewPartitions> map = new HashMap<>();  
	          map.put("client_01", newPartitions);  
	    
	          CreatePartitionsOptions options = new CreatePartitionsOptions();  
	          // Set to true if the request should be validated without creating new partitions  
	  //        options.validateOnly(true);  
	    
	          CreatePartitionsResult result = client.createPartitions(map, options);  
	          result.values().forEach((k, v) -> {  
	              System.out.println(k);  
	          });  
	      }  
	    
	      /**  
	       * 打印topic信息  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testDescribeTopics() throws ExecutionException, InterruptedException {  
	    
	          DescribeTopicsOptions options = new DescribeTopicsOptions();  
	          options.timeoutMs(500);  
	    
	          DescribeTopicsResult topicsResult = client.describeTopics(Collections.singleton("client_01"), options);  
	    
	          Map<String, TopicDescription> descriptionMap = topicsResult.all().get();  
	          descriptionMap.forEach((k, v) -> {  
	              System.out.println(k + " -> " + v.partitions().size());  
	              System.out.println(v);  
	          });  
	      }  
	    
	      /**  
	       * 打印集群信息  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testDescribeCluster() throws ExecutionException, InterruptedException {  
	          DescribeClusterResult clusterResult = client.describeCluster();  
	          String id = clusterResult.clusterId().get();  
	          Node node = clusterResult.controller().get();  
	          Collection<Node> nodes = clusterResult.nodes().get();  
	          System.out.println("id = " + id);  
	          System.out.println("node = " + node);  
	          System.out.println("nodes = " + nodes);  
	      }  
	    
	      /**  
	       * 打印broker配置  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testDescribeConfigs() throws ExecutionException, InterruptedException {  
	          // 获取broker的配置信息  
	          ConfigResource configResource = new ConfigResource(ConfigResource.Type.BROKER, "0");  
	          DescribeConfigsResult configsResult = client.describeConfigs(Collections.singleton(configResource));  
	    
	          Map<ConfigResource, Config> configMap = configsResult.all().get();  
	          configMap.forEach((k, v) -> {  
	              System.out.println(v.entries().size());  
	              v.entries().forEach(entry -> {  
	                  System.out.println(entry);  
	              });  
	          });  
	      }  
	    
	      /**  
	       * 修改topic配置  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testAlterConfig() throws ExecutionException, InterruptedException {  
	    
	          Map<ConfigResource, Config> configMap = new HashMap<>();  
	          ConfigResource resource = new ConfigResource(ConfigResource.Type.TOPIC, "client_01");  
	          Config config = new Config(Collections.singleton(new ConfigEntry("segment.bytes", "120305504")));  
	          configMap.put(resource, config);  
	    
	          AlterConfigsResult result = client.alterConfigs(configMap);  
	          Void aVoid = result.all().get();  
	          System.out.println(aVoid);  
	      }  
	    
	      /**  
	       * 存储目录  
	       * @throws ExecutionException  
	       * @throws InterruptedException  
	       */  
	      @Test  
	      public void testDescribeLogDirs() throws ExecutionException, InterruptedException {  
	          DescribeLogDirsResult logDirsResult = client.describeLogDirs(Collections.singleton(0));  
	          Map<Integer, Map<String, DescribeLogDirsResponse.LogDirInfo>> result = logDirsResult.all().get();  
	    
	          result.forEach((k, v) -> {  
	  //            System.out.println(k);  
	              v.forEach((kk, vv) -> {  
	                  System.out.println("消息存储目录:"+kk);  
	                  System.out.println("-----------------------");  
	                  vv.replicaInfos.forEach((kkk, vvv) -> {  
	                      System.out.println(kkk);  
	                      System.out.println(vvv);  
	                  });  
	              });  
	          });  
	      }  
	  }  
	    
	  ```

- 偏移量管理
  Kafka 1.0.2，__consumer_offsets主题中保存各个消费组的偏移量。  
  早期由zookeeper管理消费组的偏移量。  
    
  查询方法:  
  通过原生 kafka 提供的工具脚本进行查询。 工具脚本的位置与名称为 `bin/kafka-consumer-groups.sh`

	- 示例代码
	  ```sh  
	  # 查看消费组列表  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --list  
	    
	  # 打印消费组offset信息  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --describe --group group  
	    
	  # 把消费offset设置到最前， 添加--execute之后才会立马执行  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --group group --topic tp_demo_02 --reset-offsets --to-earliest --execute  
	    
	  # 把消费offset设置到最后， 添加--execute之后才会立马执行   
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --group group --topic tp_demo_02 --reset-offsets --to-latest --execute  
	    
	  # 把消费offset向前偏移5位， --topic tp_demo_02:1,2 表示对主题tp_demo_02下面的1，2分区进行操作  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --group group --topic tp_demo_02:1,2 --reset-offsets --shift-by -5 --execute  
	  ```

### 分区

- 副本机制<br>
![](/resource/kafka/assets/E42821E4-370B-4ACD-9361-035532644D9D.png)
  Kafka在一定数量的服务器上对主题分区进行复制。 当集群中的一个broker宕机后系统可以自动故障转移到其他可用的副本上，不会造成数据丢失。  
    
  --replication-factor 3 1leader+2follower  
  1. 将复制因子为1的未复制主题称为复制主题。  
  2. 主题的分区是复制的最小单元。  
  3. 在非故障情况下，Kafka中的每个分区都有一个Leader副本和零个或多个Follower副本。   
  4. 包括Leader副本在内的副本总数构成复制因子。  
  5. 所有读取和写入都由Leader副本负责。  
  6. 通常，分区比broker多，并且Leader分区在broker之间平均分配。  
    
  **Follower分区像 Kafka 一样，消费来自Leader分区的消息，并将其持久化到自己的日 志中。**  
    
  允许Follower对日志条目拉取进行**批处理。**

	- 同步节点定义
	  1. 节点必须能够维持与ZooKeeper的会话(通过ZooKeeper的心跳机制)  
	  2. 对于Follower副本分区，它复制在Leader分区上的写入，并且不要延迟太多  
	    
	  Kafka提供的保证是，只要有至少一个同步副本处于活动状态，提交的消息就不会丢失。

	- 宕机如何恢复
	  1. 少部分副本宕机  
	  当leader宕机了，会从follower选择一个作为leader。当宕机的重新恢复时，会把之前commit的数 据清空，重新从leader里pull数据。  
	  2. 全部副本宕机, 当全部副本宕机了有两种恢复方式  
	  	1. 等待ISR中的一个恢复后，并选它作为leader。(等待时间较长，降低可用性)  
	  	2. 选择第一个恢复的副本作为新的leader，无论是否在ISR中。(并未包含之前leader commit的 数据，因此造成数据丢失)

- Leader选举<br>
![](/resource/kafka/assets/5F4A6CDA-B764-42E0-86DA-CDF8F0BEE373.png)
  分区P1的Leader是0，ISR是0和1   
  分区P2的Leader是2，ISR是1和2   
  分区P3的Leader是1，ISR是0，1，2。  
    
    
  生产者和消费者的请求都由Leader副本来处理。Follower副本只负责消费Leader副本的数据和 Leader保持同步。  
  对于P1，如果0宕机会发生什么?  
  Leader副本和Follower副本之间的关系并不是固定不变的，在Leader所在的broker发生故障的时 候，就需要进行分区的Leader副本和Follower副本之间的切换，需要选举Leader副本。

	- 如何选举?
	  Kafka中Leader分区选举，通过维护一个动态变化的ISR集合来实现，一旦Leader分区丢掉，则从 ISR中随机挑选一个副本做新的Leader分区。  
	    
	  如果ISR中的副本都丢失了，则:  
	  1. 可以等待ISR中的副本任何一个恢复，接着对外提供服务，需要时间等待。  
	  2. 从OSR中选出一个副本做Leader副本，此时会造成数据丢失

- 分区重新分配  
  kafka-reassign-partitions.sh
  向已经部署好的Kafka集群里面添加机器，我们需要从已经部署好的Kafka节点中复制相应的配置文 件，然后把里面的broker id修改成全局唯一的，最后启动这个节点即可将它加入到现有Kafka集群中。  
  问题:新添加的Kafka节点并不会自动地分配数据，无法分担集群的负载，除非我们新建一个 topic。  
  需要手动将部分分区移到新添加的Kafka节点上，Kafka内部提供了相关的工具来重新分布某个topic 的分区。

	- 示例代码
	  在重新分布topic分区之前，我们先来看看现在topic的各个分区的分布位置:  
	    
	  ```sh  
	  # 创建一个主题  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --create --topic tp_re_01 --partitions 5 --replication-factor 1  
	    
	  # 查看分区所在broker  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_re_01  
	  Topic:tp_re_01	PartitionCount:5	ReplicationFactor:1	Configs:  
	  	Topic: tp_re_01	Partition: 0	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 1	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 2	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 3	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 4	Leader: 0	Replicas: 0	Isr: 0  
	  ```  
	  创建一个文件，用来传参数  
	    
	  ```sh  
	  vim topic-to-move.json  
	  {  
	  "topics": [ {  
	        "topic":"tp_re_01"  
	      }  
	  ],  
	    "version":1  
	  }  
	  ```  
	    
	  ```sh  
	  # 生成分区计划，--broker-list "0,1" 新的分区计划分布的brokers  
	  kafka-reassign-partitions.sh --zookeeper centos7-3:2181/mykafka --topics-to-move-json-file topic-to-move.json --broker-list "0,1" --generate  
	    
	  # 调整生成的计划到我们想要的效果my-topic.json  
	    
	  # 执行分区重新分配  
	  kafka-reassign-partitions.sh --zookeeper centos7-3:2181/mykafka --reassignment-json-file my-topic.json --execute  
	    
	    
	  # 如果遇到这个问题，There is an existing assignment running. 可以通过删除zookeeper上的节点，强制停止前面的分区计划  
	  delete /mykafka/admin/reassign_partitions  
	    
	  # 查看再分区执行情况  
	  kafka-reassign-partitions.sh --zookeeper centos7-3:2181/mykafka --reassignment-json-file my-topic.json --verify  
	    
	  # 查看最总分区情况  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_re_01  
	  ```

- 自动再均衡  
  kafka-preferred-replica-election.sh
  我们可以在新建主题的时候，手动指定主题各个Leader分区以及Follower分区的分配情况，即什么分区副本在哪个broker节点上。  
  随着系统的运行，broker的宕机重启，会引发Leader分区和Follower分区的角色转换，最后可能 Leader大部分都集中在少数几台broker上，由于Leader负责客户端的读写操作，此时集中Leader分区 的少数几台服务器的网络I/O，CPU，以及内存都会很紧张。  
  Leader和Follower的角色转换会引起Leader副本在集群中分布的不均衡，此时我们需要一种手段， 让Leader的分布重新恢复到一个均衡的状态。

	- 示例代码
	  ```sh  
	  # 创建topic tp_demo_03, 找到分区情况 0:1,1:0,0:1， 三个分区，副本因子2，数字在前面的是leader  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --create --topic tp_demo_03 --replica-assignment "0:1,1:0,0:1"  
	    
	  # 查看分区情况  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_demo_03  
	  Topic:tp_demo_03	PartitionCount:3	ReplicationFactor:2	Configs:  
	  	Topic: tp_demo_03	Partition: 0	Leader: 0	Replicas: 0,1	Isr: 0,1  
	  	Topic: tp_demo_03	Partition: 1	Leader: 1	Replicas: 1,0	Isr: 0,1  
	  	Topic: tp_demo_03	Partition: 2	Leader: 0	Replicas: 0,1	Isr: 0,1  
	    
	  # 手动让broker1宕机，再次查看leader的分布  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_demo_03  
	  Topic:tp_demo_03	PartitionCount:3	ReplicationFactor:2	Configs:  
	  	Topic: tp_demo_03	Partition: 0	Leader: 0	Replicas: 0,1	Isr: 0  
	  	Topic: tp_demo_03	Partition: 1	Leader: 0	Replicas: 1,0	Isr: 0  
	  	Topic: tp_demo_03	Partition: 2	Leader: 0	Replicas: 0,1	Isr: 0  
	    
	    
	  # 可以使用kafka-preferred-replica-election.sh 让leader恢复到创建时候的状态  
	    
	  # 所有topic都重新选leader  
	  kafka-preferred-replica-election.sh --zookeeper centos7-3:2181/mykafka  
	    
	  # 指定特定的分区重新选leader  
	  # 参数文件  
	  vim preferrd-relication.json  
	    
	  {"partitions":                          
	      [  
	          {"topic": "tp_demo_03", "partition": 0},     
	          {"topic": "tp_demo_03", "partition": 1},  
	          {"topic": "tp_demo_03", "partition": 2}  
	      ]  
	  }            
	    
	  # 执行重新选举  
	  kafka-preferred-replica-election.sh --zookeeper centos7-3:2181/mykafka --path-to-json-file preferrd-relication.json  
	  ```

- 修改分区副本  
  kafka-reassign-partitions.sh 
  实际项目中，我们可能由于主题的副本因子设置的问题，需要重新设置副本因子, 或者由于集群的扩展，需要重新设置副本因子。 topic一旦使用又不能轻易删除重建，因此动态增加副本因子就成为最终的选择

	- 示例代码
	  ```sh  
	  # 查看原来的副本情况  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_re_01  
	  Topic:tp_re_01	PartitionCount:5	ReplicationFactor:1	Configs:  
	  	Topic: tp_re_01	Partition: 0	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 1	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 2	Leader: 0	Replicas: 0	Isr: 0  
	  	Topic: tp_re_01	Partition: 3	Leader: 1	Replicas: 1	Isr: 1  
	  	Topic: tp_re_01	Partition: 4	Leader: 1	Replicas: 1	Isr: 1  
	    
	  # 参数文件      
	  vim increment-replication-factor.json  
	  {  
	      "version":1,  
	      "partitions":[  
	          {"topic":"tp_re_01","partition":0,"replicas":[0,1]},  
	          {"topic":"tp_re_01","partition":1,"replicas":[0,1]},  
	          {"topic":"tp_re_01","partition":2,"replicas":[0,1]},  
	          {"topic":"tp_re_01","partition":3,"replicas":[1,0]},  
	          {"topic":"tp_re_01","partition":4,"replicas":[1,0]}  
	      ]   
	  }  
	    
	  # 添加分区  
	  kafka-reassign-partitions.sh --zookeeper centos7-3:2181/mykafka --reassignment-json-file increment-replication-factor.json --execute  
	    
	  # 查看结果  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_re_01  
	  Topic:tp_re_01	PartitionCount:5	ReplicationFactor:2	Configs:  
	  	Topic: tp_re_01	Partition: 0	Leader: 0	Replicas: 0,1	Isr: 0,1  
	  	Topic: tp_re_01	Partition: 1	Leader: 0	Replicas: 0,1	Isr: 0,1  
	  	Topic: tp_re_01	Partition: 2	Leader: 0	Replicas: 0,1	Isr: 0,1  
	  	Topic: tp_re_01	Partition: 3	Leader: 1	Replicas: 1,0	Isr: 1,0  
	  	Topic: tp_re_01	Partition: 4	Leader: 1	Replicas: 1,0	Isr: 1,0  
	  ```

- 分区分配策略
  在Kafka中，每个Topic会包含多个分区，默认情况下一个分区只能被一个消费组下面的一个消费者 消费，这里就产生了分区分配的问题。Kafka中提供了多重分区分配算法(PartitionAssignor)的实现: RangeAssignor、RoundRobinAssignor、StickyAssignor。  
    
  PartitionAssignor接口用于用户定义实现分区分配算法，以实现Consumer之间的分区分配。  
  消费组的成员订阅它们感兴趣的Topic并将这种订阅关系传递给作为订阅组协调者的Broker。协调 者选择其中的一个消费者来执行这个消费组的分区分配并将分配结果转发给消费组内所有的消费者。 Kafka默认采用RangeAssignor的分配算法。

	- RangeAssignor<br>
![](/resource/kafka/assets/3157821F-3605-42EF-8621-16C60D72895D.png)
	  RangeAssignor对每个Topic进行独立的分区分配。对于每一个Topic，首先对分区按照分区ID进行 数值排序，然后订阅这个Topic的消费组的消费者再进行字典排序，之后尽量均衡的将分区分配给消费 者。这里只能是尽量均衡，因为分区数可能无法被消费者数量整除，那么有一些消费者就会多分配到一 些分区。  
	    
	  RangeAssignor策略的原理是按照消费者总数和分区总数进行整除运算来获得一个跨度，然后将分 区按照跨度进行平均分配，以保证分区尽可能均匀地分配给所有的消费者。对于每一个Topic， RangeAssignor策略会将消费组内所有订阅这个Topic的消费者按照名称的字典序排序，然后为每个消费 者划分固定的分区范围，如果不够平均分配，那么字典序靠前的消费者会被多分配一个分区。  
	  这种分配方式明显的一个问题是随着消费者订阅的Topic的数量的增加，不均衡的问题会越来越严 重，比如上图中4个分区3个消费者的场景，C0会多分配一个分区。如果此时再订阅一个分区数为4的 Topic，那么C0又会比C1、C2多分配一个分区，这样C0总共就比C1、C2多分配两个分区了，而且随着 Topic的增加，这个情况会越来越严重。  
	  字典序靠前的消费组中的消费者比较“贪婪”。

	- RoundRobinAssignor<br>
![](/resource/kafka/assets/58491888-FDE2-453A-889C-3F0CE8A8E21D.png)
	  RoundRobinAssignor的分配策略是将消费组内订阅的所有Topic的分区及所有消费者进行排序后尽 量均衡的分配(RangeAssignor是针对单个Topic的分区进行排序分配的)。如果消费组内，消费者订阅 的Topic列表是相同的(每个消费者都订阅了相同的Topic)，那么分配结果是尽量均衡的(消费者之间 分配到的分区数的差值不会超过1)。如果订阅的Topic列表是不同的，那么分配结果是不保证“尽量均 衡”的，因为某些消费者不参与一些Topic的分配。  
	    
	  相对于RangeAssignor，在订阅多个Topic的情况下，RoundRobinAssignor的方式能消费者之间尽 量均衡的分配到分区(分配到的分区数的差值不会超过1——RangeAssignor的分配策略可能随着订阅的 Topic越来越多，差值越来越大)。

		- <br>
![](/resource/kafka/assets/9BEB4D18-2D78-4A8B-8648-29214BBFC440.png)
		  对于消费组内消费者订阅Topic不一致的情况:假设有两个个消费者分别为C0和C1，有2个Topic T1、T2，分别拥有3和2个分区，并且C0订阅T1和T2，C1订阅T2  
		    
		  看上去分配已经尽量的保证均衡了，不过可以发现C0承担了4个分区的消费而C1订阅了T2一个分区，是不是把T2P0交给C1消费能更加的均衡呢?

	- StickyAssignor

		- 动机
		  尽管RoundRobinAssignor已经在RangeAssignor上做了一些优化来更均衡的分配分区，但是在一 些情况下依旧会产生严重的分配偏差，比如消费组中订阅的Topic列表不相同的情况下。  
		  更核心的问题是无论是RangeAssignor，还是RoundRobinAssignor，当前的分区分配算法都没有 考虑上一次的分配结果。显然，在执行一次新的分配之前，如果能考虑到上一次分配的结果，尽量少的 调整分区分配的变动，显然是能节省很多开销的。

		- 目标
		  从字面意义上看，Sticky是“粘性的”，可以理解为分配结果是带“粘性的”: 1. 分区的分配尽量的均衡  
		  2. 每一次重分配的结果尽量与上一次分配结果保持一致 当这两个目标发生冲突时，优先保证第一个目标。第一个目标是每个分配算法都尽量尝试去完成的，而第二个目标才真正体现出StickyAssignor特性的。

		- 
![](/resource/kafka/assets/1E37A014-6CEC-4156-8B44-83E035D39C74.png)
		  有3个Consumer:C0、C1、C2 有4个Topic:T0、T1、T2、T3，每个Topic有2个分区 所有Consumer都订阅了这4个分区  
		    
		  如果消费者1宕机

			- 按照RoundRobin的方式<br>
![](/resource/kafka/assets/35C92724-7CDE-4191-A5B7-0131AB86A00A.png)
			  打乱从新来过，轮询分配

			- 按照Sticky的方式<br>
![](/resource/kafka/assets/581D96F6-5D5D-4CFA-9E5B-CC4E84E84F5E.png)
			  仅对消费者1分配的分区进行重分配，红线部分。最终达到均衡的目的。

### 物理存储

- 日志存储概述<br>
![](/resource/kafka/assets/0C5582F1-F716-42F8-8D5F-97B28A3BFEF5.png)
  Kafka 消息是以主题为单位进行归类，各个主题之间是彼此独立的，互不影响。 每个主题又可以分为一个或多个分区。 每个分区各自存在一个记录消息数据的日志文件。  
    
  图中，创建了一个 tp_demo_01 主题，其存在3个 Parition，对应的每个Parition下存在一个 [Topic-Parition] 命名的消息日志文件。  
    
  在理想情况下，数据流量分摊到各个 Parition 中，实现了负载均衡的效果。在分区日志文件中，你会发现很多类型的文件

	- LogSegment<br>
![](/resource/kafka/assets/00573A7F-2502-4D42-8838-135E9F47181D.png)
	  文件名一致的文件集合称为LogSement  
	    
	  1. 分区日志文件中包含很多的 LogSegment  
	  2. Kafka 日志追加是顺序写入的  
	  3. LogSegment 可以减小日志文件的大小  
	  4. 进行日志删除的时候和数据查找的时候可以快速定位。  
	  5. ActiveLogSegment 是活跃的日志分段，拥有写入权限，其余的LogSegment 只有只读权限  
	    
	  每个 LogSegment 都有一个基准偏移量，表示当前 LogSegment 中第一条消息的 offset。  
	  偏移量是一个 64 位的长整形数，固定是20位数字，长度未达到，用 0 进行填补，索引文件和日志 文件都由该作为文件名命名规则(00000000000000000000.index、 00000000000000000000.timestamp、00000000000000000000.log)。  
	    
	  如果日志文件名为 00000000000000000121.log ，则当前日志文件的一条数据偏移量就是 121(偏移量从 0 开始)。

	- 不同文件的作用<br>
![](/resource/kafka/assets/18A47A79-8DF3-4442-A001-AADAA81E7718.png)
	  日志文件存在多种后缀文件，重点需要关注.index、.timestamp、.log三种类型。

	- 相关配置<br>
![](/resource/kafka/assets/82ACEA93-0D70-43EF-8263-A4C323491515.png)

	- 配置项默认值说明
	  偏移量索引文件用于记录消息偏移量与物理地址之间的映射关系。  
	    时间戳索引文件则根据时间戳查找对应的偏移量。  
	  Kafka 中的索引文件是以稀疏索引的方式构造消息的索引，并不保证每一个消息在索引文件中都有 对应的索引项。  
	    每当写入一定量的消息时，偏移量索引文件和时间戳索引文件分别增加一个偏移量索引项和时间戳索引项。  
	  通过修改 log.index.interval.bytes 的值，改变索引项的密度。

	- 切分文件
	  当满足如下几个条件中的其中之一，就会触发文件的切分:  
	  1. 当前日志分段文件的大小超过了 broker 端参数 log.segment.bytes 配置的值。 log.segment.bytes 参数的默认值为 1073741824，即 1GB。  
	  2. 当前日志分段中消息的最大时间戳与当前系统的时间戳的差值大于 log.roll.ms 或 log.roll.hours 参数配置的值。如果同时配置了 log.roll.ms 和 log.roll.hours 参数，那么 log.roll.ms 的优先级高。默认情况下，只配置了 log.roll.hours 参数，其值为168，即 7 天。  
	  3. 偏移量索引文件或时间戳索引文件的大小达到 broker 端参数 log.index.size.max.bytes配置的值。 log.index.size.max.bytes 的默认值为 10485760，即 10MB。  
	  4. 追加的消息的偏移量与当前日志分段的偏移量之间的差值大于 Integer.MAX_VALUE ，即要追加的消息的偏移量不能转变为相对偏移量。

		- 为什么是Integer.MAX_VALUE ?
		  1024 * 1024 * 1024=1073741824 在偏移量索引文件中，每个索引项共占用 8 个字节，并分为两部分。 相对偏移量和物理地址。   
		  相对偏移量:表示消息相对与基准偏移量的偏移量，占 4 个字节.  
		  物理地址:消息在日志分段文件中对应的物理位置，也占 4 个字节  
		    
		  4 个字节刚好对应 Integer.MAX_VALUE ，如果大于 Integer.MAX_VALUE ，则不能用 4 个字节进行表示了。

		- 索引文件切分过程
		  索引文件会根据 log.index.size.max.bytes 值进行预先分配空间，即文件创建的时候就是最大值。  
		  当真正的进行索引文件切分的时候，才会将其裁剪到实际数据大小的文件。 这一点是跟日志文件有所区别的地方。其意义降低了代码逻辑的复杂性。

- 日志存储

	- 索引
	  偏移量索引文件用于记录消息偏移量与物理地址之间的映射关系。时间戳索引文件则根据时间戳查 找对应的偏移量。

		- 概念

			- 文件<br>
![](/resource/kafka/assets/8FA743BD-8285-4BD2-9925-7149A9FE0D51.png)
			  查看一个topic分区目录下的内容，发现有log、index和timeindex三个文件:  
			  1. log文件名是以文件中第一条message的offset来命名的，实际offset长度是64位，但是这里只使用了20位，应付生产是足够的。  
			  2. 一组index+log+timeindex文件的名字是一样的，并且log文件默认写满1G后，会进行log rolling形成一个新的组合来记录消息，这个是通过broker端  
			  log.segment.bytes =1073741824指定的。  
			  3. index和timeindex在刚使用时会分配10M的大小，当进行 log rolling 后，它会修剪为实际的大小。

			- 代码验证
			  ```sh  
			  # 创建主题  
			  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --create --topic tp_demo_04 --partitions 1 --replication-factor 1 --config segment.bytes=104857600  
			    
			  # 生成消息文件  
			  for i in `seq 10000000`; do echo "hello lagou $i" >> nmm.txt; done  
			    
			  # 取出文件中内容，发布到对应主题  
			  kafka-console-producer.sh --broker-list centos7-3:9092 --topic tp_demo_04 < nmm.txt  
			  ```

			- 查看日志文件<br>
![](/resource/kafka/assets/D45A387B-270A-4BB5-A873-8EF5F7CDE749.png)
			  如果想查看这些文件，可以使用kafka提供的shell来完成，几个关键信息如下:  
			  (1)offset是逐渐增加的整数，每个offset对应一个消息的偏移量。  
			  (2)position:消息批字节数，用于计算物理地址。  
			  (3)CreateTime:时间戳。  
			  (4)magic:2代表这个消息类型是V2，如果是0则代表是V0类型，1代表V1类型。  
			  (5)compresscodec:None说明没有指定压缩类型，kafka目前提供了4种可选择，0-None、1- GZIP、2-snappy、3-lz4。  
			  (6)crc:对所有字段进行校验后的crc值。  
			    
			  ```sh  
			  # 查看前10条消息  
			  kafka-run-class.sh kafka.tools.DumpLogSegments --files 00000000000000000000.log  --print-data-log | head  
			  ```

			- 关于消息偏移量
			  1. 消息内容保存在log日志文件中。  
			  2. 消息封装为Record，追加到log日志文件末尾，采用的是顺序写模式。  
			  3. 一个topic的不同分区，可认为是queue，顺序写入接收到的消息。  
			  4. 时间戳索引文件，它的作用是可以让用户查询某个时间段内的消息，它一条数据的结构是时间 戳(8byte)+相对offset(4byte)，如果要使用这个索引文件，首先需要通过时间范围，找到对应的相 对offset，然后再去对应的index文件找到position信息，然后才能遍历log文件，它也是需要使用上面说的index文件的。  
			  但是由于producer生产消息可以指定消息的时间戳，这可能将导致消息的时间戳不一定有先后顺 序，因此尽量不要生产消息时指定时间戳。

		- 偏移量<br>
![](/resource/kafka/assets/EEA93298-5A5E-491B-BAB3-963B934D9118.png)
		  1. 位置索引保存在index文件中  
		  2. log日志默认每写入4K(log.index.interval.bytes设定的)，会写入一条索引信息到index文件  
		  中，因此索引文件是稀疏索引，它不会为每条日志都建立索引信息。  
		  3. log文件中的日志，是顺序写入的，由message+实际offset+position组成  
		  4. 索引文件的数据结构则是由相对offset(4byte)+position(4byte)组成，由于保存的是相对第一个消息的相对offset，只需要4byte就可以了，可以节省空间，在实际查找后还需要计算回实际的offset，这对用户是透明的。  
		    
		    
		  可以通过如下命令解析.index 文件  
		  ```sh  
		  kafka-run-class.sh kafka.tools.DumpLogSegments --files 00000000000000000000.index  --print-data-log | head  
		  ```

			- 稀疏索引查找<br>
![](/resource/kafka/assets/9DA44A50-181D-42F7-B9F2-78ECAE5EBE25.png)
			  稀疏索引，索引密度不高，但是offset有序，二分查找的时间复杂度为O(lgN)，如果从头遍历时间复 杂度是O(N)。

		- 时间戳<br>
![](/resource/kafka/assets/203243AE-3FFA-4D3B-B6C0-8AB77426175C.png)
		  在偏移量索引文件中，索引数据都是顺序记录 offset ，但时间戳索引文件中每个追加的索引时间戳 必须大于之前追加的索引项，否则不予追加。在 Kafka 0.11.0.0 以后，消息元数据中存在若干的时间 戳信息。如果 broker 端参数 log.message.timestamp.type 设置为 LogAppendTIme ，那么时间戳 必定能保持单调增长。反之如果是 CreateTime 则无法保证顺序。  
		    
		  通过时间戳方式进行查找消息，需要通过查找时间戳索引和偏移量索引两个文件。   
		  时间戳索引索引格式:前八个字节表示时间戳，后四个字节表示偏移量。

	- 清理
	  Kafka 提供两种日志清理策略:  
	  日志删除:按照一定的删除策略，将不满足条件的数据进行数据删除  
	  日志压缩:针对每个消息的 Key 进行整合，对于有相同 Key 的不同 Value 值，只保留最后一个版本。  
	  Kafka 提供 log.cleanup.policy 参数进行相应配置，默认值: delete ，还可以选择 compact 。  
	  主题级别的配置项是cleanup.policy 。

		- 日志删除

			- 基于时间
			  日志删除任务会根据 log.retention.hours/log.retention.minutes/log.retention.ms 设定 日志保留的时间节点。如果超过该设定值，就需要进行删除。默认是 7 天， log.retention.ms 优先级 最高。  
			  Kafka 依据日志分段中最大的时间戳进行定位。 首先要查询该日志分段所对应的时间戳索引文件，查找时间戳索引文件中最后一条索引项，若最后  
			  一条索引项的时间戳字段值大于 0，则取该值，否则取最近修改时间。

				- 为什么不直接选最近修改时间呢?
				   因为日志文件可以有意无意的被修改，并不能真实的反应日志分段的最大时间信息。

				- 删除过程
				  1. 从日志对象中所维护日志分段的跳跃表中移除待删除的日志分段，保证没有线程对这些日志分 段进行读取操作。  
				  2. 这些日志分段所有文件添加 上 .delete 后缀。  
				  3. 交由一个以 "delete-file" 命名的延迟任务来删除这些 .delete 为后缀的文件。延迟执行时间可以通过 file.delete.delay.ms 进行设置

				- 如果活跃的日志分段中也存在需要删除的数据时?
				  Kafka 会先切分出一个新的日志分段作为活跃日志分段，该日志分段不删除，删除原来的日志分段。  
				  先腾出地方，再删除。

			- 基于日志大小
			  日志删除任务会检查当前日志的大小是否超过设定值。设定项为 log.retention.bytes ，单个日志分段的大小由 log.segment.bytes 进行设定。

				- 删除过程
				  1. 计算需要被删除的日志总大小 (当前日志文件大小(所有分段)减去retention值)。  
				  2. 从日志文件第一个 LogSegment 开始查找可删除的日志分段的文件集合。  
				  3. 执行删除。

			- 基于偏移量
			  根据日志分段的下一个日志分段的起始偏移量是否大于等于日志文件的起始偏移量，若是，则可以删除此日志分段。  
			  ** 注意:日志文件的起始偏移量并不一定等于第一个日志分段的基准偏移量，存在数据删除，可能与之相等的那条数据已经被删除了。**

				- 删除过程
![](/resource/kafka/assets/27931A40-1C27-4C55-872D-78B445F9B090.png)
				  1. 从头开始遍历每个日志分段，日志分段1的下一个日志分段的起始偏移量为21，小于 logStartOffset，将日志分段1加入到删除队列中  
				  2. 日志分段 2 的下一个日志分段的起始偏移量为35，小于 logStartOffset，将 日志分段 2 加入 到删除队列中  
				  3. 日志分段 3 的下一个日志分段的起始偏移量为57，小于logStartOffset，将日志分段3加入删除 集合中  
				  4. 日志分段4的下一个日志分段的其实偏移量为71，大于logStartOffset，则不进行删除。

		- 日志压缩策略
		  日志压缩是Kafka的一种机制，可以提供较为细粒度的记录保留，而不是基于粗粒度的基于时间的保留。 对于具有相同的Key，而数据不同，只保留最后一条数据，前面的数据在合适的情况下删除  
		    
		  默认情况下，启动日志清理器，若需要启动特定Topic的日志清理，请添加特定的属性  
		  1. log.cleanup.policy 设置为 compact ，Broker的配置，影响集群中所有的Topic。  
		  2. log.cleaner.min.compaction.lag.ms ，需要等待一定时间后才开始压缩，防止对所有Segment进行压缩，如果没有设置，除最后一个Segment之外，所有Segment都有资格进行压缩  
		  3. log.cleaner.max.compaction.lag.ms ，用于防止低生产速率的日志在无限制的时间内不压缩。

			- 应用场景
			  日志压缩特性，就实时计算来说，可以在异常容灾方面有很好的应用途径。比如，我们在Spark、 Flink中做实时计算时，需要长期在内存里面维护一些数据，这些数据可能是通过聚合了一天或者一周的 日志得到的，这些数据一旦由于异常因素(内存、网络、磁盘等)崩溃了，从头开始计算需要很长的时 间。一个比较有效可行的方式就是定时将内存里的数据备份到外部存储介质中，当崩溃出现时，再从外 部存储介质中恢复并继续计算。  
			    
			  使用日志压缩来替代这些外部存储有哪些优势及好处呢?  
			  * Kafka即是数据源又是存储工具，可以简化技术栈，降低维护成本  
			  * 使用外部存储介质的话，需要将存储的Key记录下来，恢复的时候再使用这些Key将数据取回，实现起来有一定的工程难度和复杂度。使用Kafka的日志压缩特性，只需要把数据写进Kafka，等异常出现恢复任务时再读回到内存就可以了   
			  * Kafka对于磁盘的读写做了大量的优化工作，比如磁盘顺序读写。相对于外部存储介质没有索引查询等工作量的负担，可以实现高性能。同时，Kafka的日志压缩机制可以充分利用廉价的磁盘，不用依赖昂贵的内存来处理，在性能相似的情况下，实现非常高的性价比(这个观点仅仅针对于异常处理和容灾的场景来说)

			- 日志压缩方式的实现细节<br>
![](/resource/kafka/assets/4897B3E4-2EE2-4C66-9058-3C2F597B3643.png)
			  主题的 cleanup.policy 需要设置为compact。  
			  Kafka的后台线程会定时将Topic遍历两次:  
			  1. 记录每个key的hash值最后一次出现的偏移量  
			  2. 第二次检查每个offset对应的Key是否在后面的日志中出现过，如果出现了就删除对应的日志。  
			    
			  日志压缩允许删除，除最后一个key之外，删除先前出现的所有该key对应的记录。在一段时间后从 日志中清理，以释放空间。  
			    
			  **注意:日志压缩与key有关，确保每个消息的key不为null。**  
			    
			  压缩是在Kafka后台通过定时重新打开Segment来完成的

			- 日志压缩的特点
			  * 消息始终保持顺序，压缩永远不会重新排序消息，只是删除一些而已   
			  * 消息的偏移量永远不会改变，它是日志中位置的永久标识符  
			  * 从日志开始的任何使用者将至少看到所有记录的最终状态，按记录的顺序写入

	- 磁盘存储
	  1. Linux内核提供、实现零拷贝的API， mmap和sendfile;  
	  2. sendfile 是将读到内核空间的数据，转到socket buffer，进行网络发送;  
	  3. mmap将磁盘文件映射到内存，支持读和写，对内存的操作会反映在磁盘文件上。  
	    
	  Kafka速度快是因为:  
	  1. partition顺序读写，充分利用磁盘特性，这是基础;  
	  2. Producer生产的数据持久化到broker，采用mmap文件映射，实现顺序的快速写入;  
	  3. Customer从broker读取数据，采用sendfile，将磁盘文件读到OS内核缓冲区后，直接转到socket buffer进行网络发送。

		- 零拷贝
		  kafka高性能，是多方面协同的结果，包括宏观架构、分布式partition存储、ISR数据同步、以及“无 所不用其极”的高效利用磁盘/操作系统特性。  
		  零拷贝并不是不需要拷贝，而是减少不必要的拷贝次数。通常是说在IO读写过程中。 

		- 页缓存
		  页缓存是操作系统实现的一种主要的磁盘缓存，以此用来减少对磁盘 I/O 的操作。  
		  具体来说，就是把磁盘中的数据缓存到内存中，把对磁盘的访问变为对内存的访问。  
		  Kafka接收来自socket buffer的网络数据，应用进程不需要中间处理、直接进行持久化时。可以使用mmap内存文件映射。

		- 顺序写入
		  操作系统可以针对线性读写做深层次的优化，比如预读(read-ahead，提前将一个比较大的磁盘块读入内存) 和后写(write-behind，将很多小的逻辑写操作合并起来组成一个大的物理写操作)技术  
		    
		  Kafka 在设计时采用了文件追加的方式来写入消息，即只能在日志文件的尾部追加新的消 息，并且 也不允许修改已写入的消息，这种方式属于典型的顺序写盘的操作，所以就算 Kafka 使用磁盘作为存储 介质，也能承载非常大的吞吐量。

### 稳定性

- 事务

	- 事务场景
	  1. 如producer发的多条消息组成一个事务这些消息需要对consumer同时可见或者同时不可见 。  
	  2. producer可能会给多个topic，多个partition发消息，这些消息也需要能放在一个事务里面，这就形成了一个典型的分布式事务。  
	  3. kafka的应用场景经常是应用先消费一个topic，然后做处理再发到另一个topic，这个 consume-transform-produce过程需要放到一个事务里面，比如在消息处理或者发送的过程中如果失败了，消费偏移量也不能提交。  
	  4. producer或者producer所在的应用可能会挂掉，新的producer启动以后需要知道怎么处理之前未完成的事务 。  
	  5. 在一个原子操作中，根据包含的操作类型，可以分为三种情况，前两种情况是事务引入的场景，最后一种没用。  
	  	1. 只有Producer生产消息;  
	  	2. 消费消息和生产消息并存，这个是事务场景中最常用的情况，就是我们常说的  
	  consume-transform-produce 模式  
	  	3. 只有consumer消费消息，这种操作其实没有什么意义，跟使用手动提交效果一样，而且也不是事务属性引入的目的，所以一般不会使用这种情况

	- 事务相关配置

		- Broker configs<br>
![](/resource/kafka/assets/D02328C7-E5A8-4851-BA1A-F152C49BBE8A.png)

		- Producer configs<br>
![](/resource/kafka/assets/3D8A6C96-3B28-4F3C-A11D-843BE261CB7B.png)

		- Consumer configs<br>
![](/resource/kafka/assets/0E86145D-2942-42DE-B81B-354907A7529E.png)

	- 事务操作
	  事务相关的api  
	    
	  ```java  
	  //初始化事务，需要注意确保transation.id属性被分配,并处理上一个失败的事务，或等待它执行完成  
	  void initTransactions();  
	    
	  //开启事务  
	  void beginTransaction() throws ProducerFencedException;  
	    
	  //为Consumer提供的在事务内Commit offsets的操作  
	  void sendoffsetsToTransaction(Map<TopicPartition, offsetAndMetadata> offsets,String consumerGroupId) throws producerFencedException;  
	    
	  //提交事务  
	  void commitTransaction() throws ProducerFencedException;  
	    
	  //放弃事务，类似于回滚事务的操作  
	  void abortTransaction() throws producerFencedException;  
	  ```  
	  在Kafka事务中，一个原子性操作，根据操作类型可以分为3种情况。情况如下:

		- 只有producer
		  只有Producer生产消息，这种场景需要事务的介入  
		    
		  ```java  
		  import org.apache.kafka.clients.producer.KafkaProducer;  
		  import org.apache.kafka.clients.producer.ProducerConfig;  
		  import org.apache.kafka.clients.producer.ProducerRecord;  
		  import org.apache.kafka.common.serialization.StringSerializer;  
		    
		  import java.util.HashMap;  
		  import java.util.Map;  
		    
		  public class MyTransactionalProducer {  
		    
		      public static void main(String[] args) {  
		          Map<String, Object> configs = new HashMap<>();  
		          configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
		          configs.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
		          configs.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
		          configs.put(ProducerConfig.CLIENT_ID_CONFIG, "tx_producer");  
		          // 事务id  
		          configs.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "my_tx_id");  
		          // 等待所有isr回复  
		          configs.put(ProducerConfig.ACKS_CONFIG, "all");  
		    
		          KafkaProducer<String, String> producer = new KafkaProducer<String, String>(configs);  
		    
		          // 结束前面失败的事务，等待已经提交的事务完成，保证能成功开启当前的事务  
		          producer.initTransactions();  
		    
		          // 开启事务  
		          producer.beginTransaction();  
		    
		          try {  
		              producer.send(new ProducerRecord<>("tp_tx_01", "tx_msg_04"));  
		              producer.send(new ProducerRecord<>("tp_tx_01", "tx_msg_05"));  
		              producer.send(new ProducerRecord<>("tp_tx_01", "tx_msg_06"));  
		    
		  //            int a = 5/0;  
		              // 提交事务  
		              producer.commitTransaction();  
		          } catch (Exception e) {  
		              e.printStackTrace();  
		    
		              // 回滚事务  
		              producer.abortTransaction();  
		          } finally {  
		              producer.close();  
		          }  
		      }  
		  }  
		    
		  ```

		- Consumer&Producer模式
		  消费消息和生产消息并存，比如Consumer&Producer模式，这种场景是一般Kafka项目中比 较常见的模式，需要事务介入;  
		    
		  ```java  
		  import org.apache.kafka.clients.consumer.*;  
		  import org.apache.kafka.clients.producer.KafkaProducer;  
		  import org.apache.kafka.clients.producer.ProducerConfig;  
		  import org.apache.kafka.clients.producer.ProducerRecord;  
		  import org.apache.kafka.common.TopicPartition;  
		  import org.apache.kafka.common.serialization.StringDeserializer;  
		  import org.apache.kafka.common.serialization.StringSerializer;  
		    
		  import java.util.Collections;  
		  import java.util.HashMap;  
		  import java.util.Map;  
		    
		  /**  
		   * 一个消息中转站，从topicA消费消息，然后提交到topicB，如果提交失败，就不提交消费offset，再次消费后提交  
		   */  
		  public class MyTransactional {  
		      public static KafkaProducer<String, String> getProducer() {  
		          Map<String, Object> configs = new HashMap<>();  
		          configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
		          configs.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
		          configs.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
		          configs.put(ProducerConfig.CLIENT_ID_CONFIG, "tx_producer_02");  
		          // 事务id  
		          configs.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "my_tx_id_02");  
		          // 等待所有isr回复  
		          configs.put(ProducerConfig.ACKS_CONFIG, "all");  
		          configs.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);  
		    
		          KafkaProducer<String, String> producer = new KafkaProducer<String, String>(configs);  
		    
		          return producer;  
		      }  
		    
		      public static KafkaConsumer<String, String> getConsumer(String consumerGroupId){  
		          Map<String, Object> configs = new HashMap<>();  
		          configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "centos7-3:9092");  
		          configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);  
		          configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);  
		          configs.put(ConsumerConfig.GROUP_ID_CONFIG, consumerGroupId);  
		          // 取消自动提及offset  
		          configs.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);  
		          configs.put(ConsumerConfig.CLIENT_ID_CONFIG, "consumer_client_02");  
		          configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");  
		    
		          // read_uncommitted (the default)  
		          configs.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");  
		          KafkaConsumer<String, String> consumer = new KafkaConsumer<String, String>(configs);  
		    
		          return consumer;  
		      }  
		    
		      public static void main(String[] args) {  
		          String consumerGroupId = "the_grp_01";  
		    
		          KafkaProducer<String, String> producer = getProducer();  
		          KafkaConsumer<String, String> consumer = getConsumer(consumerGroupId);  
		    
		          // 初始化事务，提交事务id  
		          producer.initTransactions();  
		    
		          consumer.subscribe(Collections.singleton("tp_tx_01"));  
		    
		          ConsumerRecords<String, String> consumerRecords = consumer.poll(1_000);  
		    
		          producer.beginTransaction();  
		    
		          try{  
		              Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();  
		    
		              for (ConsumerRecord<String, String> consumerRecord : consumerRecords) {  
		                  System.out.println(consumerRecord);  
		    
		                  producer.send(new ProducerRecord<>("tp_tx_out_01", consumerRecord.key(), consumerRecord.value()));  
		    
		                  offsets.put(new TopicPartition(consumerRecord.topic(),  
		                                  consumerRecord.partition()),  
		                          //The committed offset should be the next message your  
		                          // application will consume, i.e. lastProcessedMessageOffset + 1.  
		                          new OffsetAndMetadata(consumerRecord.offset()+1));  
		              }  
		    
		              // 手动提交offset，随着tx提交一起提交  
		              // 如果事务执行失败，就不会提及offset  
		              producer.sendOffsetsToTransaction(offsets, consumerGroupId);  
		    
		              int a = 5/0;  
		    
		              producer.commitTransaction();  
		    
		          }catch (Exception e) {  
		              e.printStackTrace();  
		    
		              producer.abortTransaction();  
		          }finally {  
		              consumer.close();  
		              producer.close();  
		          }  
		      }  
		  }  
		    
		  ```

		- 只有Consumer
		  只有Consumer消费消息，这种操作在实际项目中意义不大，和手动Commit Offsets的结果一 样，而且这种场景不是事务的引入目的。

	- 幂等性
	  保证在消息重发的时候，消费者不会重复处理。即使在消费者收到重复消息的时候，重复处理，也要保证最终结果的一致性。  
	  比如，银行转账，如果失败，需要重试。不管重试多少次，都要保证最终结果一定是一致的。

		- 幂等性实现<br>
![](/resource/kafka/assets/77739545-2035-4A38-BBD5-E84467FC8543.png)
		  添加唯一ID，类似于数据库的主键，用于唯一标记一个消息。 Kafka为了实现幂等性，它在底层设计架构中引入了ProducerID和SequenceNumber。  
		  * ProducerID:在每个新的Producer初始化时，会被分配一个唯一的ProducerID，这个 ProducerID对客户端使用者是不可见的。   
		  * SequenceNumber:对于每个ProducerID，Producer发送数据的每个Topic和Partition都对 应一个从0开始单调递增的SequenceNumber值。  
		    
		  当Producer发送消息(x2,y2)给Broker时，Broker接收到消息并将其追加到消息流中。此时， Broker返回Ack信号给Producer时，发生异常导致Producer接收Ack信号失败。对于Producer来说，会 触发重试机制，将消息(x2,y2)再次发送，但是，由于引入了幂等性，在每条消息中附带了 PID(ProducerID)和SequenceNumber。相同的PID和SequenceNumber发送给Broker，而之前 Broker缓存过之前发送的相同的消息，那么在消息流中的消息就只有一条(x2,y2)，不会出现重复发送的 情况。

		- enable.idempotence
		  是否开启幂等性

	- 几个关键概念和推导
	  1. 因为producer发送消息可能是分布式事务，所以引入了常用的2PC，所以有事务协调者 (Transaction Coordinator)。Transaction Coordinator和之前为了解决脑裂和惊群问题引入 的Group Coordinator在选举上类似。  
	  2. 事务管理中事务日志是必不可少的，kafka使用一个内部topic来保存事务日志，这个设计和之 前使用内部topic保存偏移量的设计保持一致。事务日志是Transaction Coordinator管理的状 态的持久化，因为不需要回溯事务的历史状态，所以事务日志只用保存最近的事务状态。__transaction_state  
	  3. 因为事务存在commit和abort两种操作，而客户端又有read committed和read uncommitted 两种隔离级别，所以消息队列必须能标识事务状态，这个被称作Control Message。  
	  4. producer挂掉重启或者漂移到其它机器需要能关联的之前的未完成事务所以需要有一个唯一标 识符来进行关联，这个就是TransactionalId，一个producer挂了，另一个有相同TransactionalId的producer能够接着处理这个事务未完成的状态。kafka目前没有引入全局 序，所以也没有transaction id，这个TransactionalId是用户提前配置的。  
	  5. TransactionalId能关联producer，也需要避免两个使用相同TransactionalId的producer同时 存在，所以引入了producer epoch来保证对应一个TransactionalId只有一个活跃的producer

	- 事务语义

		- 多分区原子写入
		  事务能够保证Kafka topic下每个分区的原子写入。事务中所有的消息都将被成功写入或者丢弃。  
		  首先，我们来考虑一下原子 读取-处理-写入 周期是什么意思。简而言之，这意味着如果某个应用程序 在某个topic tp0的偏移量X处读取到了消息A，并且在对消息A进行了一些处理(如B = F(A))之后将 消息B写入topic tp1，则只有当消息A和B被认为被成功地消费并一起发布，或者完全不发布时，整个读 取过程写入操作是原子的。  
		  现在，只有当消息A的偏移量X被标记为已消费，消息A才从topic tp0消费，消费到的数据偏移量 (record offset)将被标记为提交偏移量(Committing offset)。在Kafka中，我们通过写入一个名为 offsets topic的内部Kafka topic来记录offset commit。消息仅在其offset被提交给offsets topic时才被 认为成功消费。  
		  由于offset commit只是对Kafkatopic的另一次写入，并且由于消息仅在提交偏移量时被视为成功消 费，所以跨多个主题和分区的原子写入也启用原子 读取-处理-写入 循环:提交偏移量X到offset topic和消 息B到tp1的写入将是单个事务的一部分，所以整个步骤都是原子的。

		- 粉碎“僵尸实例”
		  我们通过为每个事务Producer分配一个称为transactional.id的唯一标识符来解决僵尸实例的问题。在进程重新启动时能够识别相同的Producer实例。  
		  API要求事务性Producer的第一个操作应该是在Kafka集群中显示注册transactional.id。 当注册的 时候，Kafka broker用给定的transactional.id检查打开的事务并且完成处理。 Kafka也增加了一个与 transactional.id相关的epoch。Epoch存储每个transactional.id内部元数据。  
		  一旦epoch被触发，任何具有相同的transactional.id和旧的epoch的生产者被视为僵尸，Kafka拒绝 来自这些生产者的后续事务性写入。  
		    
		  简而言之:Kafka可以保证Consumer最终只能消费非事务性消息或已提交事务性消息。它将保留来 自未完成事务的消息，并过滤掉已中止事务的消息。

		- 事务消息定义
		  生产者可以显式地发起事务会话，在这些会话中发送(事务)消息，并提交或中止事务。有如下要求:  
		  1. 原子性:消费者的应用程序不应暴露于未提交事务的消息中。  
		  2. 持久性:Broker不能丢失任何已提交的事务。  
		  3. 排序:事务消费者应在每个分区中以原始顺序查看事务消息。  
		  4. 交织:每个分区都应该能够接收来自事务性生产者和非事务生产者的消息 5. 事务中不应有重复的消息。

			- 消费消息的顺序<br>
![](/resource/kafka/assets/2DABC4F4-DD2F-4D9D-B27C-40E947E8CD79.png)
			   如果允许事务性和非事务性消息的交织，则非事务性和事务性消息的相对顺序将基于附加(对于非  
			  事务性消息)和最终提交(对于事务性消息)的相对顺序。  
			    
			  在上图中，分区p0和p1接收事务X1和X2的消息，以及非事务性消息。时间线是消息到达Broker的 时间。由于首先提交了X2，所以每个分区都将在X1之前公开来自X2的消息。由于非事务性消息在X1和 X2的提交之前到达，因此这些消息将在来自任一事务的消息之前公开。

	- 事务概览
	  生产者将表示事务开始/结束/中止状态的事务控制消息发送给使用多阶段协议管理事务的高可用事 务协调器。生产者将事务控制记录(开始/结束/中止)发送到事务协调器，并将事务的消息直接发送到 目标数据分区。消费者需要了解事务并缓冲每个待处理的事务，直到它们到达其相应的结束(提交/中 止)记录为止。

		- 事务组
		  事务组用于映射到特定的事务协调器(基于日志分区数字的哈希)。该组中的生产者需要配置为该  
		  组事务生产者。由于来自这些生产者的所有事务都通过此协调器进行，因此我们可以在这些事务生产者  
		  之间实现严格的有序。

		- 生产者ID和事务组状态
		  事务生产者需要两个新参数:生产者ID和生产组。  
		    
		  需要将生产者的输入状态与上一个已提交的事务相关联。这使事务生产者能够重试事务(通过为该  
		  事务重新创建输入状态;在我们的用例中通常是偏移量的向量)。  
		    可以使用消费者偏移量管理机制来管理这些状态。消费者偏移量管理器将每个键(consumergroup-topic-partition )与该分区的最后一个检查点偏移量和元数据相关联。在事务生产 者中，我们保存消费者的偏移量，该偏移量与事务的提交点关联。此偏移提交记录(在  
		  __consumer_offsets 主题中)应作为事务的一部分写入。即，存储消费组偏移量的  
		  __consumer_offsets 主题分区将需要参与事务。因此，假定生产者在事务中间失败(事务协调器随后 到期);当生产者恢复时，它可以发出偏移量获取请求，以恢复与最后提交的事务相关联的输入偏移 量，并从该点恢复事务处理。  
		    
		  为了支持此功能，我们需要对偏移量管理器和压缩的 __consumer_offsets 主题进行一些增强。  
		    首先，压缩的主题现在还将包含事务控制记录。我们将需要为这些控制记录提出剔除策略。  
		    其次，偏移量管理器需要具有事务意识;特别是，如果组与待处理的事务相关联，则偏移量提取请  
		  求应返回错误。

		- 事务协调器
		  事务协调器是 __transaction_state 主题特定分区的Leader分区所在的Broker。它负责初始 化、提交以及回滚事务。事务协调器在内存管理如下的状态:  
		  * 对应正在处理的事务的第一个消息的HW。  
		  * 事务协调器周期性地将HW写到ZK。 事务控制日志中存储对应于日志HW的所有正在处理的事务;   
		  * 事务消息主题分区的列表:  
		  	* 事务的超时时间。   
		  	* 与事务关联的Producer ID。  
		    
		  需要确保无论是什么样的保留策略(日志分区的删除还是压缩)，都不能删除包含事务HW的 日志分段。

		- 事务的中止
		  当事务生产者发送业务消息的时候如果发生异常，可以中止该事务。如果事务提交超时，事务协调器也会中止当前事务。  
		  * Producer:向事务协调器发送AbortTransaction(TxId)请求并等待响应。(一个没有异常的响应 表示事务将会中止)   
		  * Coordinator:向事务控制主题追加PREPARE_ABORT(TxId)消息，然后向生产者发送响应。   
		  * Coordinator:向事务业务数据的目标主题的每个涉及到的Leader分区Broker发送 AbortTransaction(TxId, partitions...)请求。(收到Leader分区Broker响应后，事务协调器中止 动作跟上面的提交类似。)

		- 基本事务流程的失败
		  * 生产者发送BeginTransaction(TxId):的时候超时或响应中包含异常，生产者使用相同的TxId重试。  
		  * 生产者发送数据时的Broker错误:生产者应中止(然后重做)事务(使用新的TxId)。如果生 产者没有中止事务，则协调器将在事务超时后中止事务。仅在可能已将请求数据附加并复制到 Follower的错误的情况下才需要重做事务。例如，生产者请求超时将需要重做，而 NotLeaderForPartitionException不需要重做。  
		  * 生产者发送CommitTransaction(TxId)请求超时或响应中包含异常，生产者使用相同的TxId重 试事务。此时需要幂等性。

		- 主题的压缩
		  压缩主题在压缩过程中会丢弃具有相同键的早期记录。如果这些记录是事务的一部分，这合法吗?  
		  这可能有点怪异，但可能不会太有害，因为在主题中使用压缩策略的理由是保留关键数据的最新更新。  
		    如果该应用程序正在(例如)更新某些表，并且事务中的消息对应于不同的键，则这种情况可能导  
		  致数据库视图不一致。

- 控制器<br>
![](/resource/kafka/assets/CFC0A599-AE54-49BF-A882-5E159F6681B3.png)
  控制器就是一个broker。  
  控制器除了一般broker的功能，还负责Leader分区的选举。  
  Kafka集群包含若干个broker，broker.id指定broker的编号，编号不要重复。 Kafka集群上创建的主题，包含若干个分区。 每个分区包含若干个副本，副本因子包括了Follower副本和Leader副本。 副本又分为ISR(同步副本分区)和OSR(非同步副本分区)。  
    
  1. Kafka使用 Zookeeper 的分布式锁选举控制器，并在节点加入集群或退出集群时通知控制器。   
  2. 控制器负责在节点加入或离开集群时进行分区Leader选举。  
  3. 控制器使用epoch来避免“脑裂”。“脑裂”是指两个节点同时认为自己是当前的控制器。

	- controller选举<br>
![](/resource/kafka/assets/F0682570-DF58-4EB8-A5E4-7C983D225FCE.png)
	  集群里第一个启动的broker在Zookeeper中创建临时节点 <KafkaZkChroot>/controller 。 其他broker在该控制器节点创建Zookeeper watch对象，使用Zookeeper的监听机制接收该节点的变更。  
	  即:Kafka通过Zookeeper的分布式锁特性选举集群控制器。  
	    
	  每个新选出的控制器通过 Zookeeper 的条件递增操作获得一个全新的、数值更大的 controller epoch。其他 broker 在知道当前 controller epoch 后，如果收到由控制器发出的包含较旧epoch 的消 息，就会忽略它们，以防止“脑裂”。  
	  比如当一个Leader副本分区所在的broker宕机，需要选举新的Leader副本分区，有可能两个具有不 同纪元数字的控制器都选举了新的Leader副本分区，如果选举出来的Leader副本分区不一样，听谁的? 脑裂了。有了纪元数字，直接使用纪元数字最新的控制器结果。

	- 重新选举leader<br>
![](/resource/kafka/assets/10A340FA-4D57-4CE0-8009-79E36105CC6A.png)
	  当控制器发现一个 broker 已经离开集群，那些失去Leader副本分区的Follower分区需要一个新 Leader(这些分区的首领刚好是在这个 broker 上)。  
	  1. 控制器需要知道哪个broker宕机了?  
	  >集群控制器负责监听  <KafkaChroot>/brokers/ids 节点，一旦节点子节点发送变化，集群控制器得到通知。  
	  2. 控制器需要知道宕机的broker上负责的是哪些分区的Leader副本分区?  
	  >如上图，控制器可以通过查询zk节点下`[kafkaroot]/brokers/topics/[topic]/partitions/[partion_num]/state` 来获取分区的信息，并重新选举leader  
	    
	    
	  控制器遍历这些Follower副本分区，并确定谁应该成为新Leader分区，然后向所有包含新Leader分 区和现有Follower的 broker 发送请求。该请求消息包含了谁是新Leader副本分区以及谁是Follower副 本分区的信息。随后，新Leader分区开始处理来自生产者和消费者的请求，而跟随者开始从新Leader副 本分区消费消息。  
	  当控制器发现一个 broker 加入集群时，它会使用 broker ID 来检查新加入的 broker 是否包含现有 分区的副本。如果有，控制器就把变更通知发送给新加入的 broker 和其他 broker，新 broker上的副本 分区开始从Leader分区那里消费消息，与Leader分区保持同步。

- 可靠性保证
  1. 创建Topic的时候可以指定 --replication-factor 3 ，表示分区的副本数，不要超过broker的 数量。  
  2. Leader是负责读写的节点，而其他副本则是Follower。Producer只把消息发送到Leader， Follower定期地到Leader上Pull数据。  
  3. ISR是Leader负责维护的与其保持同步的Replica列表，即当前活跃的副本列表。如果一个 Follow落后太多，Leader会将它从ISR中移除。落后太多意思是该Follow复制的消息Follow长 时间没有向Leader发送fetch请求(参数: replica.lag.time.max.ms 默认值:10000)。  
  4. 为了保证可靠性，可以设置 acks=all 。Follower收到消息后，会像Leader发送ACK。一旦 Leader收到了ISR中所有Replica的ACK，Leader就commit，那么Leader就向Producer发送 ACK。

	- 副本的分配<br>
![](/resource/kafka/assets/95B5C276-9F0C-4CB3-A831-53B44FDFCBE1.png)
	  当某个topic的 --replication-factor 为N(N>1)时，每个Partition都有N个副本，称作replica。原 则上是将replica均匀的分配到整个集群上。不仅如此，partition的分配也同样需要均匀分配，为了更好 的负载均衡。  
	    
	  副本分配的三个目标:  
	  1. 均衡地将副本分散于各个broker上  
	  2. 对于某个broker上分配的分区，它的其他副本在其他broker上  
	  3. 如果所有的broker都有机架信息，尽量将分区的各个副本分配到不同机架上的broker。  
	    
	  在不考虑机架信息的情况下:  
	  1. 第一个副本分区通过轮询的方式挑选一个broker，进行分配。该轮询从broker列表的随机位置 进行轮询。  
	  2. 其余副本通过增加偏移进行分配。

	- 失效副本
	  失效副本的判定: replica.lag.time.max.ms 默认大小为10000.  
	    
	  当ISR中的一个Follower副本滞后Leader副本的时间超过参数 replica.lag.time.max.ms 指定的值  
	  时即判定为副本失效，需要将此Follower副本剔出除ISR。 具体实现原理:当Follower副本将Leader副本的LEO之前的日志全部同步时，则认为该Follower副本已经追赶上Leader副本，此时更新该副本的lastCaughtUpTimeMs标识。  
	  Kafka的副本管理器(ReplicaManager)启动时会启动一个副本过期检测的定时任务，而这个定时 任务会定时检查当前时间与副本的lastCaughtUpTimeMs差值是否大于参数  
	  replica.lag.time.max.ms 指定的值。

		- 两种情况会导致副本失效
		  1. Follower副本进程卡住，在一段时间内没有向Leader副本发起同步请求，比如频繁的Full GC。  
		  2. Follower副本进程同步过慢，在一段时间内都无法追赶上Leader副本，比如IO开销过大。  
		  如果通过工具增加了副本因子，那么新增加的副本在赶上Leader副本之前也都是处于失效状态的。  
		  如果一个Follower副本由于某些原因(比如宕机)而下线，之后又上线，在追赶上Leader副本之前 也是出于失效状态。  
		  失效副本的分区个数是用于衡量Kafka性能指标的重要部分。Kafka本身提供了一个相关的指标，即 UnderReplicatedPartitions，这个可以通过JMX访问:  
		  ```sh  
		  kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions  
		  ```  
		  取值范围是大于等于0的整数。注意:如果Kafka集群正在做分区迁移(kafka-reassign-partitions.sh)的时候，这个值也会大于0。

	- 副本复制
	  日志复制算法(log replication algorithm)必须提供的基本保证是，如果它告诉客户端消息已被提 交，而当前Leader出现故障，新选出的Leader也必须具有该消息。在出现故障时，Kafka会从挂掉 Leader的ISR里面选择一个Follower作为这个分区新的Leader。  
	  每个分区的 leader 会维护一个in-sync replica(同步副本列表，又称 ISR)。当Producer向broker 发送消息，消息先写入到对应Leader分区，然后复制到这个分区的所有副本中。ACKS=ALL时，只有将 消息成功复制到所有同步副本(ISR)后，这条消息才算被提交。

		- 什么情况下会导致一个副本与 leader 失去同步
		  一个副本与 leader 失去同步的原因有很多，主要包括:  
		  * 慢副本(Slow replica):follower replica 在一段时间内一直无法赶上 leader 的写进度。造 成这种情况的最常见原因之一是 follower replica 上的 I/O瓶颈，导致它持久化日志的时间比 它从 leader 消费消息的时间要长;  
		  * 卡住副本(Stuck replica):follower replica 在很长一段时间内停止从 leader 获取消息。 这可能是以为 GC 停顿，或者副本出现故障;  
		  * 刚启动副本(Bootstrapping replica):当用户给某个主题增加副本因子时，新的 follower replicas 是不同步的，直到它跟上 leader 的日志。  
		    
		  当副本落后于 leader 分区时，这个副本被认为是不同步或滞后的。在 Kafka中，副本的滞后于 Leader是根据replica.lag.time.max.ms 来衡量。

		- 如何确认某个副本处于滞后状态
		  通过 replica.lag.time.max.ms 来检测卡住副本(Stuck replica)在所有情况下都能很好地工 作。它跟踪 follower 副本没有向 leader 发送获取请求的时间，通过这个可以推断 follower 是否正常。 另一方面，使用消息数量检测不同步慢副本(Slow replica)的模型只有在为单个主题或具有同类流量模 式的多个主题设置这些参数时才能很好地工作，但我们发现它不能扩展到生产集群中所有主题。

- 一致性保证

	- 概念

		- 水位标记
		  水位或水印(watermark)一词，表示位置信息，即位移(offset)。Kafka源码中使用的名字是高水位，HW(high watermark)。

		- 副本角色
		  Kafka分区使用多个副本(replica)提供高可用。

		- LEO和HW
![](/resource/kafka/assets/37E8B6B2-3015-4D22-A29E-395D8D6DD125.png)
		  每个分区副本对象都有两个重要的属性:LEO和HW。  
		    
		  上图中，HW值是7，表示位移是 0~7 的所有消息都已经处于“已提交状态”(committed)，而LEO 值是14，8~13的消息就是未完全备份(fully replicated)——为什么没有14?LEO指向的是下一条消息 到来时的位移。  
		  消费者无法消费分区下Leader副本中位移大于分区HW的消息。

			- LEO
			  即日志末端位移(log end offset)，记录了该副本日志中下一条消息的位移值。如果 LEO=10，那么表示该副本保存了10条消息，位移值范围是[0, 9]。另外，Leader LEO和 Follower LEO的更新是有区别的。

			- HW
			  即上面提到的水位值。对于同一个副本对象而言，其HW值不会大于LEO值。小于等于 HW值的所有消息都被认为是“已备份”的(replicated)。Leader副本和Follower副本的HW更 新不同。

	- Follower副本何时更新LEO
	  Follower副本不停地向Leader副本所在的broker发送FETCH请求，一旦获取消息后写入自己的日志 中进行备份。那么Follower副本的LEO是何时更新的呢?首先我必须言明，Kafka有两套Follower副本 LEO:  
	  1. 一套LEO保存在Follower副本所在Broker的副本管理机中;  
	  2. 另一套LEO保存在Leader副本所在Broker的副本管理机中。Leader副本机器上保存了所有的follower副本的LEO。  
	    
	  Kafka使用前者帮助Follower副本更新其HW值;利用后者帮助Leader副本更新其HW。  
	  1. Follower副本的本地LEO何时更新? Follower副本的LEO值就是日志的LEO值，每当新写入一条消息，LEO值就会被更新。当 Follower发送FETCH请求后，Leader将数据返回给Follower，此时Follower开始Log写数据， 从而自动更新LEO值。  
	  2. Leader端Follower的LEO何时更新? Leader端的Follower的LEO更新发生在Leader在处理Follower FETCH请求时。一旦Leader接 收到Follower发送的FETCH请求，它先从Log中读取相应的数据，给Follower返回数据前，先 更新Follower的LEO。

	- Follower副本何时更新HW
	  Follower更新HW发生在其更新LEO之后，一旦Follower向Log写完数据，尝试更新自己的HW值。 比较当前LEO值与FETCH响应中Leader的HW值，取两者的小者作为新的HW值。  
	    
	  即:如果Follower的LEO大于Leader的HW，Follower HW值不会大于Leader的HW值。

	- Leader副本何时更新LEO
	  和Follower更新LEO相同，Leader写Log时自动更新自己的LEO值。

	- Leader副本何时更新HW值
	  Leader的HW值就是分区HW值，直接影响分区数据对消费者的可见性 。  
	    
	  Leader会尝试去更新分区HW的四种情况:  
	  1. Follower副本成为Leader副本时:Kafka会尝试去更新分区HW。  
	  2. Broker崩溃导致副本被踢出ISR时:检查下分区HW值是否需要更新是有必要的。  
	  3. 生产者向Leader副本写消息时:因为写入消息会更新Leader的LEO，有必要检查HW值是否需要更新  
	  4. Leader处理Follower FETCH请求时:首先从Log读取数据，之后尝试更新分区HW值  
	    
	  结论:  
	  当Kafka broker都正常工作时，分区HW值的更新时机有两个:   
	  1. Leader处理PRODUCE请求时  
	  2. Leader处理FETCH请求时。  
	    
	  Leader如何更新自己的HW值?Leader broker上保存了一套Follower副本的LEO以及自己的LEO。 当尝试确定分区HW时，它会选出所有满足条件的副本，比较它们的LEO(包括Leader的LEO)，并选择最 小的LEO值作为HW值。  
	    
	  需要满足的条件，(二选一):   
	  1. 处于ISR中  
	  2. 副本LEO落后于Leader LEO的时长不大于 replica.lag.time.max.ms 参数值(默认是10s)  
	    
	  如果Kafka只判断第一个条件的话，确定分区HW值时就不会考虑这些未在ISR中的副本，但这些副 本已经具备了“立刻进入ISR”的资格，因此就可能出现分区HW值越过ISR中副本LEO的情况——不允许。 因为分区HW定义就是ISR中所有副本LEO的最小值。

	- HW和LEO正常更新案例

		- 初始状态<br>
![](/resource/kafka/assets/1D262586-0080-478E-BA04-43AEA81CCC6B.png)

		- Follower发送FETCH请求在Leader处理完PRODUCE请求之后<br>
![](/resource/kafka/assets/2BFB35EB-8B2F-41FA-ADE9-FB1E1541C993.png)

			- 假设此时follower发送了FETCH请求<br>
![](/resource/kafka/assets/703B4E9F-FEAD-4D7C-80CA-EA768FED6FD7.png)

			- Follower第二轮FETCH<br>
![](/resource/kafka/assets/D19560A5-CDDC-493B-B9CD-20109492473D.png)

	- HW和LEO异常案例
	  Kafka使用HW值来决定副本备份的进度，而HW值的更新通常需要额外一轮FETCH RPC才能完成。  
	  但这种设计是有问题的，可能引起的问题包括:   
	  1. 备份数据丢失  
	  2. 备份数据不一致

		- 数据丢失
		  使用HW值来确定备份进度时其值的更新是在下一轮RPC中完成的。如果Follower副本在标记上方的 的第一步与第二步之间发生崩溃，那么就有可能造成数据的丢失。

		- Leader和Follower数据离散
		  除了可能造成的数据丢失以外，该设计还会造成Leader的Log和Follower的Log数据不一致

	- Leader Epoch使用
	  Kafka解决方案, 造成上述两个问题的根本原因在于  
	  1. HW值被用于衡量副本备份的成功与否。   
	  2. 在出现失败重启时作为日志截断的依据。  
	    
	  但HW值的更新是异步延迟的，特别是需要额外的FETCH请求处理流程才能更新，故这中间发生的 任何崩溃都可能导致HW值的过期。  
	    
	  Kafka从0.11引入了 leader epoch 来取代HW值。Leader端使用内存保存Leader的epoch信息，即 使出现上面的两个场景也能规避这些问题。  
	    
	  所谓Leader epoch实际上是一对值:<epoch, offset>:  
	  1. epoch表示Leader的版本号，从0开始，Leader变更过1次，epoch+1  
	  2. offset对应于该epoch版本的Leader写入第一条消息的offset。因此假设有两对值:  
	  ```sh  
	  <0,0>   
	  <1,120>  
	  ```  
	    
	  则表示第一个Leader从位移0开始写入消息;共写了120条[0, 119];而第二个Leader版本号是1， 从位移120处开始写入消息。  
	    
	  1. Leader broker中会保存这样的一个缓存，并定期地写入到一个 checkpoint 文件中。  
	  2. 当Leader写Log时它会尝试更新整个缓存:如果这个Leader首次写消息，则会在缓存中增加一个条目;否则就不做更新。  
	  3. 每次副本变为Leader时会查询这部分缓存，获取出对应Leader版本的位移，则不会发生数据不一致和丢失的情况。

		- 规避数据丢失<br>
![](/resource/kafka/assets/9636950E-6DB0-48A7-AFA4-12E67898A45F.png)
		  只需要知道每个副本都引入了新的状态来保存自己当leader时开始写入的第一条消息的offset以及 leader版本。这样在恢复的时候完全使用这些信息而非HW来判断是否需要截断日志。

		- 规避数据不一致<br>
![](/resource/kafka/assets/2BB88C5B-9BAE-42AC-A47F-B8551C33E327.png)
		  依靠Leader epoch的信息可以有效地规避数据不一致的问题。

- 消息重复的场景及解决方案
  消息重复和丢失是kafka中很常见的问题，主要发生在以下三个阶段:

	- 生产者阶段重复场景

		- 根本原因
		  生产发送的消息没有收到正确的broker响应，导致生产者重试。  
		  生产者发出一条消息，broker落盘以后因为网络等种种原因发送端得到一个发送失败的响应或者网 络中断，然后生产者收到一个可恢复的Exception重试消息导致消息重复。

		- 重试过程<br>
![](/resource/kafka/assets/B04046DA-4019-425C-BE8E-BBABC6644A9A.png)
		  1. new KafkaProducer()后创建一个后台线程KafkaThread扫描RecordAccumulator中是否有消 息;  
		  2. 调用KafkaProducer.send()发送消息，实际上只是把消息保存到RecordAccumulator中;  
		  3. 后台线程KafkaThread扫描到RecordAccumulator中有消息后，将消息发送到kafka集群;  
		  4. 如果发送成功，那么返回成功;  
		  5. 如果发送失败，那么判断是否允许重试。如果不允许重试，那么返回失败的结果;如果允许重试，把消息再保存到RecordAccumulator中，等待后台线程KafkaThread扫描再次发送;

		- 可恢复异常说明<br>
![](/resource/kafka/assets/F7BEDE18-DE47-48EF-9ACE-CE00ABC60970.png)
		  异常是RetriableException类型或者TransactionManager允许重试

		- 记录顺序问题
		  如果设置 max.in.flight.requests.per.connection 大于1(默认5，单个连接上发送的未确认 请求的最大数量，表示上一个发出的请求没有确认下一个请求又发出了)。大于1可能会改变记录的顺 序，因为如果将两个batch发送到单个分区，第一个batch处理失败并重试，但是第二个batch处理成 功，那么第二个batch处理中的记录可能先出现被消费。  
		  设置 max.in.flight.requests.per.connection 为1，可能会影响吞吐量，可以解决单个生产者 发送顺序问题。如果多个生产者，生产者1先发送一个请求，生产者2后发送请求，此时生产者1返回可 恢复异常，重试一定次数成功了。虽然生产者1先发送消息，但生产者2发送的消息会被先消费。

	- 生产者发送重复解决方案

		- 启动kafka的幂等性
		  要启动kafka的幂等性，设置: enable.idempotence=true ，以及 ack=all 以及 retries > 1 。

		- ack=0，不重试
		  可能会丢消息，适用于吞吐量指标重要性高于数据丢失，例如:日志收集。

	- 生产者和broker阶段消息丢失场景

		- ack=0，不重试
		  生产者发送消息完，不管结果了，如果发送失败也就丢失了。

		- ack=1，leader crash
		  生产者发送消息完，只等待Leader写入成功就返回了，Leader分区丢失了，此时Follower没来及同步，消息丢失。

		- unclean.leader.election.enable=true
		  允许选举ISR以外的副本作为leader,会导致数据丢失，默认为false。生产者发送异步消息，只等待 Lead写入成功就返回，Leader分区丢失，此时ISR中没有Follower，Leader从OSR中选举，因为OSR中 本来落后于Leader造成消息丢失。

	- 解决生产者和broker阶段消息丢失

		- 禁用unclean选举，ack=all
		  ack=all / -1,tries > 1,unclean.leader.election.enable : false  
		  生产者发完消息，等待Follower同步完再返回，如果异常则重试。副本的数量可能影响吞吐量，不 超过5个，一般三个。  
		  不允许unclean Leader选举。

		- min.insync.replicas > 1
		  当生产者将 acks 设置为 all (或 -1 )时， min.insync.replicas>1 。指定确认消息写成功需要的最 小副本数量。达不到这个最小值，生产者将引发一个异常(要么是NotEnoughReplicas，要么是 NotEnoughReplicasAfterAppend)。  
		  当一起使用时， min.insync.replicas 和 ack 允许执行更大的持久性保证。一个典型的场景是创 建一个复制因子为3的主题，设置min.insync复制到2个，用 all 配置发送。将确保如果大多数副本没有 收到写操作，则生产者将引发异常。

		- 失败的offset单独记录
		  生产者发送消息，会自动重试，遇到不可恢复异常会抛出，这时可以捕获异常记录到数据库或缓存，进行单独处理。

	- 消费者数据重复场景及解决方案
	  数据消费完没有及时提交offset到broker。  
	  消息消费端在消费过程中挂掉没有及时提交offset到broke，另一个消费端启动拿之前记录的offset开始消费，由于offset的滞后性可能会导致新启动的客户端有少量重复消费。

		- 解决方案

			- 取消自动提交
			  每次消费完或者程序退出时手动提交。这可能也没法保证没有重复。

			- 下游做幂等
			  一般是让下游做幂等或者尽量每消费一条消息都记录offset，对于少数严格的场景可能需要把offset 或唯一ID(例如订单ID)和下游状态更新放在同一个数据库里面做事务来保证精确的一次更新或者在下 游数据表里面同时记录消费offset，然后更新下游数据的时候用消费位移做乐观锁拒绝旧位移的数据更新。

- __consumer_offsets
  Zookeeper不适合大批量的频繁写入操作。  
  Kafka 1.0.2将consumer的位移信息保存在Kafka内部的topic中，即__consumer_offsets主题，并  
  且默认提供了`kafka_consumer_groups.sh`脚本供用户查看consumer信息。

	- 实验代码
	  ```sh  
	  # 创建一个主题tp_test_01  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --create --topic tp_test_01 --partitions 5 --replication-factor 1  
	    
	  # 查看主题  
	  kafka-topics.sh --zookeeper centos7-3:2181/mykafka --describe --topic tp_test_01  
	    
	  # 准备100条dump数据  
	  for i in `seq 100`; do echo "hello lagou $i" >> messages.txt; done  
	    
	  # 写入到主题tp_test_01  
	  kafka-console-producer.sh --broker-list centos7-3:9092 --topic tp_test_01 < messages.txt  
	    
	  # 查看主题 tp_test_01 的生产情况  
	  kafka-run-class.sh kafka.tools.GetOffsetShell --broker-list centos7-3:9092 --topic tp_test_01 --time -1  
	    
	  # 消费 tp_test_01 上面的消息  
	  kafka-console-consumer.sh --bootstrap-server centos7-3:9092 --topic tp_test_01 --from-beginning  
	    
	  # 查看消费组列表  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --list  
	    
	  # 打印消费组消费偏移信息  
	  kafka-consumer-groups.sh --bootstrap-server centos7-3:9092 --describe --group console-consumer-13913  
	    
	  # 消费 __consumer_offsets 的信息，太多了😂  
	  # 如果查不到结果，需要在consumer.properties中设置exclude.internal.topics=false  
	  kafka-console-consumer.sh --topic __consumer_offsets --bootstrap-server centos7-3:9092 --formatter "kafka.coordinator.group.GroupMetadataManager\$OffsetsMessageFormatter" --consumer.config $KAFKA_HOME/config/consumer.properties --from-beginning  
	    
	  # 查看我们相应主题console-consumer-13913的分区  
	  # 使用公式 Math.abs(groupID.hashCode())%numPartitions  
	  # 在jshell中运行即可  
	  Math.abs("console-consumer-13913".hashCode())%50   
	  # 运行结果是18  
	    
	  # 查看对应分区18的消息   
	  kafka-simple-consumer-shell.sh --topic __consumer_offsets --partition 18 --broker-list centos7-3:9092 --formatter "kafka.coordinator.group.GroupMetadataManager\$OffsetsMessageFormatter"  
	    
	  # 输出结果   
	  [console-consumer-13913,tp_test_01,3]::[OffsetMetadata[20,NO_METADATA],CommitTime 1614847353839,ExpirationTime 1614933753839]  
	  [console-consumer-13913,tp_test_01,4]::[OffsetMetadata[20,NO_METADATA],CommitTime 1614847353839,ExpirationTime 1614933753839]  
	  [console-consumer-13913,tp_test_01,0]::[OffsetMetadata[20,NO_METADATA],CommitTime 1614847353839,ExpirationTime 1614933753839]  
	  [console-consumer-13913,tp_test_01,1]::[OffsetMetadata[20,NO_METADATA],CommitTime 1614847353839,ExpirationTime 1614933753839]  
	  ...  
	  ```  
	  __consumer_offsets topic的每一日志项的格式都是: [Group, Topic, Partition]::[OffsetMetadata[Offset, Metadata], CommitTime, ExpirationTime]

- 延时队列<br>
![](/resource/kafka/assets/86848F7A-8E3B-4DE9-BBD1-F0292FA5C070.png)
  两个follower副本都已经拉取到了leader副本的最新位置，此时又向leader副本发送拉取请求，而 leader副本并没有新的消息写入，那么此时leader副本该如何处理呢?可以直接返回空的拉取结果给 follower副本，不过在leader副本一直没有新消息写入的情况下，follower副本会一直发送拉取请求，并且总收到空的拉取结果，消耗资源。  
    
  Kafka在处理拉取请求时，会先读取一次日志文件，如果收集不到足够多(fetchMinBytes，由参数 fetch.min.bytes配置，默认值为1)的消息，那么就会创建一个延时拉取操作(DelayedFetch)以等待 拉取到足够数量的消息。当延时拉取操作执行时，会再读取一次日志文件，然后将拉取结果返回给 follower副本。  
    
  延迟操作不只是拉取消息时的特有操作，在Kafka中有多种延时操作，比如延时数据删除、延时生产等。  
  对于延时生产(消息)而言，如果在使用生产者客户端发送消息的时候将acks参数设置为-1，那么 就意味着需要等待ISR集合中的所有副本都确认收到消息之后才能正确地收到响应的结果，或者捕获超时异常。

	- 什么是延时队列
	  延时操作需要延时返回响应的结果，首先它必须有一个超时时间(delayMs)，如果在这个超时时 间内没有完成既定的任务，那么就需要强制完成以返回响应结果给客户端。其次，延时操作不同于定时 操作，定时操作是指在特定时间之后执行的操作，而延时操作可以在所设定的超时时间之前完成，所以 延时操作能够支持外部事件的触发。  
	  	就延时生产操作而言，它的外部事件是所要写入消息的某个分区的HW(高水位)发生增长。也就 是说，随着follower副本不断地与leader副本进行消息同步，进而促使HW进一步增长，HW每增长一次 都会检测是否能够完成此次延时生产操作，如果可以就执行以此返回响应结果给客户端;如果在超时时 间内始终无法完成，则强制执行。  
	  延时拉取操作，是由超时触发或外部事件触发而被执行的。超时触发很好理解，就是等到超时时间 之后触发第二次读取日志文件的操作。外部事件触发就稍复杂了一些，因为拉取请求不单单由follower 副本发起，也可以由消费者客户端发起，两种情况所对应的外部事件也是不同的。如果是follower副本 的延时拉取，它的外部事件就是消息追加到了leader副本的本地日志文件中;如果是消费者客户端的延 时拉取，它的外部事件可以简单地理解为HW的增长。

	- 实现方式
	  TimeWheel时间轮。size，每个单元格的时间，每个单元格都代表一个时间，size*每个单元格的时间就是 一个周期。

- 重试队列
  kafka没有重试机制不支持消息重试，也没有死信队列，因此使用kafka做消息队列时，需要自己实现消息重试的功能。

	- 实现思路
	  创建新的kafka主题作为重试队列:  
	  1. 创建一个topic作为重试topic，用于接收等待重试的消息。  
	  2. 普通topic消费者设置待重试消息的下一个重试topic。  
	  3. 从重试topic获取待重试消息储存到redis的zset中，并以下一次消费时间排序 4. 定时任务从redis获取到达消费事件的消息，并把消息发送到对应的topic  
	  5. 同一个消息重试次数过多则不再重试

## Kafka集群与运维

### 集群应用场景

1. 横向扩展，提高Kafka的处理能力  
2. 镜像，副本，提供高可用。

- 消息传递
  Kafka可以很好地替代传统邮件代理。消息代理的使用有多种原因(将处理与数据生产者分离，缓冲 未处理的消息等)。与大多数邮件系统相比，Kafka具有更好的吞吐量，内置的分区，复制和容错功能， 这使其成为大规模邮件处理应用程序的理想解决方案。 根据我们的经验，消息传递的使用通常吞吐量较低，但是可能需要较低的端到端延迟，并且通常取决于 Kafka提供的强大的持久性保证。  
  在这个领域，Kafka与ActiveMQ或 RabbitMQ等传统消息传递系统相当。

- 网站活动路由
  Kafka最初的用例是能够将用户活动跟踪管道重建为一组实时的发布-订阅。这意味着将网站活动 (页面浏览，搜索或用户可能采取的其他操作)发布到中心主题，每种活动类型只有一个主题。这些提 要可用于一系列用例的订阅，包括实时处理，实时监控，以及加载到Hadoop或脱机数据仓库系统中以 进行脱机处理和报告。  
    活动跟踪通常量很大，因为每个用户页面视图都会生成许多活动消息。

- 监控指标
  Kafka通常用于操作监控数据。这涉及汇总来自分布式应用程序的统计信息，以生成操作数据的集中。

- 日志汇总
  许多人使用Kafka代替日志聚合解决方案。日志聚合通常从服务器收集物理日志文件，并将它们放在 中央位置(也许是文件服务器或HDFS)以进行处理。Kafka提取文件的详细信息，并以日志流的形式更 清晰地抽象日志或事件数据。这允许较低延迟的处理，并更容易支持多个数据源和分布式数据消耗。与 以日志为中心的系统(例如Scribe或Flume)相比，Kafka具有同样出色的性能，由于复制而提供的更强 的耐用性保证以及更低的端到端延迟。

- 流处理
  Kafka的许多用户在由多个阶段组成的处理管道中处理数据，其中原始输入数据从Kafka主题中使 用，然后进行汇总，充实或以其他方式转换为新主题，以供进一步使用或后续处理。例如，用于推荐新 闻文章的处理管道可能会从RSS提要中检索文章内容，并将其发布到“文章”主题中。进一步的处理可能会 使该内容规范化或重复数据删除，并将清洗后的文章内容发布到新主题中;最后的处理阶段可能会尝试 向用户推荐此内容。这样的处理管道基于各个主题创建实时数据流的图形。从0.10.0.0开始，一个轻量 但功能强大的流处理库称为Kafka Streams 可以在Apache Kafka中使用来执行上述数据处理。除了 Kafka Streams以外，其他开源流处理工具还包括Apache Storm和 Apache Samza

- 活动采集
  事件源是一种应用程序，其中状态更改以时间顺序记录记录。Kafka对大量存储的日志数据的支持使其成为以这种样式构建的应用程序的绝佳后端。

- 提交日志
  Kafka可以用作分布式系统的一种外部提交日志。该日志有助于在节点之间复制数据，并充当故障节 点恢复其数据的重新同步机制。Kafka中的日志压缩功能有助于支持此用法。在这种用法中，Kafka类似 于Apache BookKeeper项目。

### 集群搭建

- 集群规划<br>
![](/resource/kafka/assets/9CA1D75D-C416-4B29-A29E-CDB157EC1836.png)
  正常zk和kafka是要分开的，但是因为资源有限，所以在三台机器上分别拥有zookeeper和kafka节点

- 搭建zookeeper集群
  centos7-1:2181,centos7-2:2181,centos7-3:2181

- 搭建kafka集群

	- 集群配置kafka
	  解压好安装包之后修改server.properties  
	    
	  ```sh  
	  vim [kafka_root]/config/server.properties  
	    
	  # centos7-3的配置  
	  broker.id=0  
	  listeners=PLAINTEXT://:9092 advertised.listeners=PLAINTEXT://centos7-3:9092   
	  log.dirs=/var/lagou/kafka/kafka-logs zookeeper.connect=centos7-1:2181,centos7-2:2181,centos7-3:2181/mykafka  
	  # 其他使用默认  
	    
	  # centos7-2的配置  
	  broker.id=1  
	  listeners=PLAINTEXT://:9092 advertised.listeners=PLAINTEXT://centos7-2:9092   
	  log.dirs=/var/lagou/kafka/kafka-logs zookeeper.connect=centos7-1:2181,centos7-2:2181,centos7-3:2181/mykafka  
	  # 其他使用默认  
	    
	  # centos7-1的配置  
	  broker.id=2  
	  listeners=PLAINTEXT://:9092 advertised.listeners=PLAINTEXT://centos7-1:9092   
	  log.dirs=/var/lagou/kafka/kafka-logs zookeeper.connect=centos7-1:2181,centos7-2:2181,centos7-3:2181/mykafka  
	  # 其他使用默认  
	  ```  
	  

	- 启动集群
	  ```sh  
	  # 分别在三台机器上启动  
	  cd  [kafka_root]  
	  kafka-server-start.sh config/server.properties  
	  ```  
	    
	  如果配置都没有问题，可以查询到三台机器的启动日志中Cluster ID是一致的

### 集群监控

- 监控度量指标
  Kafka使用Yammer Metrics在服务器和Scala客户端中报告指标。Java客户端使用Kafka Metrics， 它是一个内置的度量标准注册表，可最大程度地减少拉入客户端应用程序的传递依赖项。两者都通过 JMX公开指标，并且可以配置为使用可插拔的统计报告器报告统计信息，以连接到您的监视系统。  
  具体的监控指标可以查看[官方文档](http://kafka.apache.org/10/documentation.html#monitoring)。

	- JMX

		- Kafka开启Jmx端口
		  ```sh  
		  vim [kafka_root]/bin/kafka-server-start.sh  
		    
		  # 在最上面添加   
		  export JMX_PORT=9581  
		  ```  
		    
		  同步kafka-server-start.sh到所有机器

		- 验证JMX开启<br>
![](/resource/kafka/assets/BE23387A-70E4-4D27-B521-57B85A2B5B97.png)
		  可以看到9581端口已经被kafka占用了

		- 使用JConsole链接JMX端口<br>
![](/resource/kafka/assets/BEDFFAF0-943E-4B73-AAE0-598DE880870E.png)
		  ```sh  
		  # 在终端中输入 `jconsole` 启动  
		  jconsole  
		  ```

			- 查看监控项<br>
![](/resource/kafka/assets/CD6ECF82-3FDF-49CB-9BF6-1C2AE3E2C5B5.png)
			  详细的监控指标可以在[官方文档]([http://kafka.apache.org/10/documentation.html#monitoring) ](http://kafka.apache.org/10/documentation.html#monitoring)  
			  查看

			- 常用监控项

				- OS监控项<br>
![](/resource/kafka/assets/637B7D11-4663-47EB-947F-FBC7AD089FD8.png)

				- broker指标<br>
![](/resource/kafka/assets/D3A90CCB-B84A-41F9-A90D-E0E3B40ADA42.png)

				- producer以及topic指标<br>
![](/resource/kafka/assets/67CB5418-501B-43CF-9FA8-4197E67D35A7.png)

				- consumer指标<br>
![](/resource/kafka/assets/E884EAB7-9AFF-4E99-812E-E500AA3366AC.png)

		- 编程手段来获取监控指标

			- 需要查询的指标<br>
![](/resource/kafka/assets/243B6CCE-0566-494C-9A78-F13553F3BB3B.png)

			- 代码
			  ```java  
			  import javax.management.*;  
			  import javax.management.remote.JMXConnector;  
			  import javax.management.remote.JMXConnectorFactory;  
			  import javax.management.remote.JMXServiceURL;  
			  import java.io.IOException;  
			  import java.util.Set;  
			    
			  public class JMXMonitorDemo {  
			      public static void main(String[] args) throws IOException, MalformedObjectNameException, AttributeNotFoundException, MBeanException, ReflectionException, InstanceNotFoundException {  
			          String jmxServiceURL = "service:jmx:rmi:///jndi/rmi://centos7-2:9581/jmxrmi";  
			    
			          // 创建JMXServiceURL对象  
			          JMXServiceURL jmxURL = new JMXServiceURL(jmxServiceURL);  
			          // 建立到指定URL服务器的连接器  
			          JMXConnector jmxConnector = JMXConnectorFactory.connect(jmxURL);  
			          // 返回代表远程MBean服务器的MBeanServerConnection对象  
			          MBeanServerConnection mBeanServerConnection = jmxConnector.getMBeanServerConnection();  
			    
			          //需要查询属性的名字  
			          ObjectName objectName = new ObjectName("kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec");  
			    
			          // 获取指定ObjectName对应的MBeans  
			          Set<ObjectInstance> queryMBeans = mBeanServerConnection.queryMBeans(null, objectName);  
			    
			    
			          for (ObjectInstance queryMBean : queryMBeans) {  
			              ObjectName name = queryMBean.getObjectName();  
			    
			              String count = mBeanServerConnection.getAttribute(name, "Count").toString();  
			              System.out.println(name.toString() + " : " + count);  
			          }  
			    
			          // 断开链接  
			          jmxConnector.close();  
			      }  
			  }  
			  ```

	- 监控工具 Kafka Eagle
	  我们可以使用Kafka-eagle管理Kafka集群 : http://www.kafka-eagle.org

		- kafka_eagle安装

			- 下载及解压
			  ```sh  
			  # 下载编译好的包  
			  wget http://pkgs-linux.cvimer.com/kafka-eagle.zip  
			  # 配置kafka-eagle  
			  unzip kafka-eagle.zip  
			  cd kafka-eagle/kafka-eagle-web/target mkdir -p test  
			  cp kafka-eagle-web-2.0.1-bin.tar.gz test/   
			  tar xf kafka-eagle-web-2.0.1-bin.tar.gz   
			  cd kafka-eagle-web-2.0.1  
			  ```  
			    
			  配置环境变量   
			  ```sh  
			  vim /etc/profile  
			    
			  # kakfa eagle  
			  export KE_HOME=/opt/lagou/servers/kafka-eagle/kafka-eagle-web/target/test/kafka-eagle-web-2.0.1  
			  export PATH=$PATH:$KE_HOME/bin  
			  ```

			- 环境配置
			  conf下的配置文件:system-config.properties  
			    
			  ```sh  
			  ######################################  
			  # 集群的别名，用于在kafka-eagle中进行区分。  
			  # 可以配置监控多个集群，别名用逗号隔开  
			  # kafka.eagle.zk.cluster.alias=cluster1,cluster2,cluster3 kafka.eagle.zk.cluster.alias=cluster1  
			  # cluster1.zk.list=10.1.201.17:2181,10.1.201.22:2181,10.1.201.23:2181 # 配置当前集群的zookeeper地址，此处的值要与Kafka的server.properties中的 zookeeper.connect的值一致  
			  # 此处的前缀就是集群的别名   
			  cluster1.zk.list=centos7-1:2181,centos7-2:2181,centos7-3:2181/mykafka  
			    
			  ######################################  
			  # 存储监控数据的数据库地址  
			  # kafka默认使用sqlite存储，需要指定和创建sqlite的目录  
			  # 如 /home/lagou/hadoop/kafka-eagle/db ######################################   
			  kafka.eagle.driver=org.sqlite.JDBC   
			  kafka.eagle.url=jdbc:sqlite:/root/hadoop/kafka-eagle/db/ke.db   
			  kafka.eagle.username=root  
			  kafka.eagle.password=www.kafka-eagle.org  
			    
			  # 其他使用默认即可  
			  ```  
			    
			  再确认一下JMX端口是否开启  
			  ```sh  
			  vim [kafka_root]/bin/kafka-server-start.sh  
			    
			  # 在最上面添加   
			  export JMX_PORT=9581  
			  ```  
			    
			  同步kafka-server-start.sh到所有机器

			- 启动 ke.sh start
![](/resource/kafka/assets/8636AACD-4F6F-4827-A6AD-A9D7ABA7BC97.png)
			  启动成功会有url和账号密码

		- 登陆界面<br>
![](/resource/kafka/assets/571B4233-8BC3-46C5-BF9C-639982EBBB5E.png)

		- 首页<br>
![](/resource/kafka/assets/D1E2848F-7701-4070-BE51-FB59E15E1B63.png)

	- Kafka源码剖析

		- 源码阅读环境搭建
		  首先下载源码:http://archive.apache.org/dist/kafka/1.0.2/kafka-1.0.2-src.tgz   
		  gradle-4.8.1下载地址:https://services.gradle.org/distributions/gradle-4.8.1-bin.zip   
		    
		  Scala下载地址:https://www.scala-lang.org/download/

			- 安装配置Gradle
			  解压gradle4.8并配置环境变量  
			    
			  ```sh  
			  # gradle  
			  export GRADLE_HOME=/Users/april/java/gradle-4.8.1  
			  export GRADLE_USER_HOME=/Users/april/java/gradle-4.8.1/repo  
			  export PATH=$PATH:$GRADLE_HOME/bin  
			  ```  
			    
			  在gradle_home目录里边创建init.gradle 配置下载包的地址  
			  ```sh  
			  allprojects {  
			      repositories {  
			          maven { url 'https://maven.aliyun.com/repository/public/' }  
			          maven { url 'https://maven.aliyun.com/nexus/content/repositories/google' }  
			          maven { url 'https://maven.aliyun.com/nexus/content/groups/public/' }  
			          maven { url 'https://maven.aliyun.com/nexus/content/repositories/jcenter'}  
			    
			          all { ArtifactRepository repo ->  
			              if (repo instanceof MavenArtifactRepository) {  
			                  def url = repo.url.toString()  
			    
			                  if (url.startsWith('https://repo.maven.apache.org/maven2/') || url.startsWith('https://repo.maven.org/maven2') || url.startsWith('https://repo1.maven.org/maven2') || url.startsWith('https://jcenter.bintray.com/')) {  
			                      //project.logger.lifecycle "Repository ${repo.url} replaced by $REPOSITORY_URL."  
			                      remove repo  
			                  }  
			              }  
			          }  
			      }  
			    
			      buildscript {  
			    
			          repositories {  
			    
			              maven { url 'https://maven.aliyun.com/repository/public/'}  
			              maven { url 'https://maven.aliyun.com/nexus/content/repositories/google' }  
			              maven { url 'https://maven.aliyun.com/nexus/content/groups/public/' }  
			              maven { url 'https://maven.aliyun.com/nexus/content/repositories/jcenter'}  
			              all { ArtifactRepository repo ->  
			                  if (repo instanceof MavenArtifactRepository) {  
			                      def url = repo.url.toString()  
			                      if (url.startsWith('https://repo1.maven.org/maven2') || url.startsWith('https://jcenter.bintray.com/')) {  
			                          //project.logger.lifecycle "Repository ${repo.url} replaced by $REPOSITORY_URL."  
			                          remove repo  
			                      }  
			                  }  
			              }  
			          }  
			      }  
			  }  
			  ```

				- 查看是否配置成功
				  ```sh  
				  gradle -v  
				  ```

			- Scala的安装和配置
			  从官网下载安装包之后解压，并配置环境变量  
			    
			  ```sh  
			  # scala  
			  export SCALA_HOME=/usr/local/opt/scala  
			  export PATH=$PATH:$SCALA_HOME/bin  
			  ```  
			    
			  idea 安装scala插件，安装成功后重启即可

			- 源码操作编译
			  解压源码，进入目录之后  
			  ```sh  
			  gradle  
			    
			  # 第二次运行  
			  gradle idea  
			  ```

			- idea导入源码<br>
![](/resource/kafka/assets/526DFB15-F23A-4BAE-A22A-AB8D1A7872C5.png)

				- intelliJ配置gradle
![](/resource/kafka/assets/AEABA512-37F6-4212-85CD-A47F84E101D3.png)

				- build gradle

		- 编译源码

