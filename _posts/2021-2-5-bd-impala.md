---
layout: post
title:  "Impala--交互式查询工具"
date:   2021-2-5
categories: big data
---
# Impala 交互式查询工具

## 概述

### 是什么

Impala是Cloudera提供的⼀一款开源的针对HDFS和HBASE中的PB级别数据进⾏行行交互式实时查询(Impala 速度快)，Impala是参照⾕谷歌的新三篇论⽂文当中的Dremel实现⽽而来，其中旧三篇论⽂文分别是 (BigTable，GFS，MapReduce)分别对应我们即将学的HBase和已经学过的HDFS以及MapReduce。  
Impala最⼤大卖点和最⼤大特点就是快速  
  
官网：https://impala.apache.org

### Impala的诞⽣

之前学习的Hive以及MR适合离线批处理理，但是对交互式查询的场景无能为力(要求快速响应)，所以为了了 解决查询速度的问题，Cloudera公司依据Google的Dremel开发了了Impala,Impala抛弃了了MapReduce 使⽤用了了类似于传统的MPP数据库技术，⼤大提⾼了查询的速度。

### MPP是什么?

MPP (Massively Parallel Processing)，就是大规模并行处理，在MPP集群中，每个节点资源都是独⽴ 享有也就是有独⽴的磁盘和内存，每个节点通过网络互相连接，彼此协同计算，作为整体提供数据服务。  
  
简单来说，MPP是将任务并行的分散到多个服务器和节点上，在每个节点上计算完成后，将各自部分的 结果汇总在⼀一起得到最终的结果  
  
对于MPP架构的软件来说聚合操作⽐比如计算某张表的总条数，则先进行局部聚合(每个节点并行计算)， 然后把局部汇总结果进⾏全局聚合(与Hadoop相似)。

### Impala与Hive对比

- Impala的技术优势
  * Impala没有采取MapReduce作为计算引擎，MR是⾮常好的分布式并行计算框架，但MR引擎更多的是面向批处理模式，⽽不是面向交互式的SQL执行。与 Hive相比:Impala把整个查询任务转为 一棵执⾏计划树，而不是⼀连串的MR任务，在分发执行计划后，Impala使⽤拉取的方式获取上个 阶段的执⾏结果，把结果数据、按执行树流式传递汇集，减少的了把中间结果写入磁盘的步骤，再 从磁盘读取数据的开销。Impala使⽤服务的⽅式避免 每次执⾏查询都需要启动的开销，即相比 Hive没了MR启动时间。  
  * 使用LLVM(C++编写的编译器)产⽣生运⾏代码，针对特定查询⽣成特定代码  
  * 优秀的IO调度，Impala⽀持直接数据块读取和本地代码计算。  
  * 选择适合的数据存储格式可以得到最好的性能(Impala支持多种存储格式)。  
  * 尽可能使用内存，中间结果不写磁盘，及时通过⽹络以stream的⽅式传递。

- Impala与Hive对比分析

	- 查询过程
	  * Hive:在Hive中，每个查询都有一个“冷启动”的常⻅问题。(map,reduce每次都要启动关闭，申 请资源，释放资源。。。)  
	  * Impala:Impala避免了任何可能的启动开销，这是一种本地查询语言。 因为要始终处理查询，则 Impala守护程序进程总是在集群启动之后就准备就绪。守护进程在集群启动之后可以接收查询任 务并执⾏查询任务。

	- 中间结果
	  * Hive:Hive通过MR引擎实现所有中间结果，中间结果需要落盘，这对降低数据处理速度有不利影响。   
	  * Impala:在执行程序之间使⽤流的⽅式传输中间结果，避免数据落盘。尽可能使⽤内存避免磁盘 开销

	- 交互查询
	  * Hive:对于交互式计算，Hive不是理想的选择。  
	  * Impala:对于交互式计算，Impala非常适合。(数据量级PB级)

	- 计算引擎
	  * Hive:是基于批处理的Hadoop MapReduce   
	  * Impala:更像是MPP数据库

	- 容错
	  * Hive:Hive是容错的(通过MR&Yarn实现)  
	  * Impala:Impala没有容错，由于良好的查询性能，Impala遇到错误会重新执行⼀次查询

	- 查询速度
	  Impala:Impala⽐Hive快3-90倍。

	- Impala优势总结
	  1. Impala最大优点就是查询速度快，在一定数据量下;  
	  2. 速度快的原因:避免了MR引擎的弊端，采⽤了MPP数据库技术，

	- Impala的缺点
	  1. Impala属于MPP架构，只能做到百节点级，一般并发查询个数达到20左右时，整个系统的吞吐已 经达到满负荷状态，在扩容节点也提升不了吞吐量，处理理数据量在PB级别最佳。  
	  2. 资源不能通过YARN统一资源管理理调度，所以Hadoop集群无法实现Impala、Spark、Hive等组件 的动态资源共享。

	- 适⽤用场景
	  Hive: 复杂的批处理理查询任务，数据转换任务，对实时性要求不高同时数据量⼜很⼤的场景。  
	  Impala:实时数据分析，与Hive配合使用, 对Hive的结果数据集进⾏实时分析。impala不能完全取代 hive，impala可以直接处理hive表中的数据。

## Impala 安装

### 1. 集群准备

* Impala的安装需要提前装好Hadoop，Hive这两个框架  
* hive需要在所有的Impala安装的节点上面都要有，因为Impala需要引⽤Hive的依赖包  
* hadoop的框架需要支持C程序访问接口，如果有该路径[`hadoop-2.9.2/lib/native`]有.so结尾⽂件，就证明支持C 接⼝。

### 2. 准备Impala的所有依赖包

impala只提供了rpm安装包，而安装的过程有需要索引很多依赖包，所以这里直接从Cloudera官网下载cdh所有软件包，并制作本地yum源，然后会采用yum的方式安装，可以免去手动添加以来的烦恼

- 1. 下载Impala安装所需rpm包
  Impala所需安装包需要到Cloudera提供地址下载， 文件大小为3.8G，解压后更大，磁盘预留空间需要大于10G  

  ```sh  
   wget http://archive.cloudera.com/cdh5/repo-as-tarball/5.7.6/cdh5.7.6-centos7.tar.gz  
  ```  
    
  解压缩  

  ```sh  
  tar -zxvf cdh5.7.6-centos7.tar.gz  
  ```

- 2. 安装httpd作为本地资源服务器
  在准备用来做本地资源服务器的机器上安装httpd  
    
  ```sh   
  #yum方式安装httpd服务器  
  yum install httpd -y  
    
  #启动httpd服务器   
  systemctl start httpd  
    
  #验证httpd⼯作是否正常,默认端口是80，可以省略，使用本地域名或者ip访问  
  http://centos7-1  
  ```

- 3. 使用Httpd盛放依赖包<br>
![](/resource/impala/assets/C457B465-5EEC-4C87-8F9E-2BDFDD527D28.png)

  创建软链接到`/var/www/html`下, `/var/www/html` 为httpd的资源文件夹，放到上面的文件都可以通过http访问到  

  ```sh  
  ln -s /opt/lagou/software/cdh/5.7.6 /var/www/html/cdh57  
  ```  
    
  验证  

  ```sh  
   http://centos7-1/cdh57/  
  ```  
    
  如果提示403 forbidden  
    
  ```sh  
  vim /etc/selinux/config  
    
  将SELINUX=enforcing改为SELINUX=disabled  
  ```

- 4. 添加Yum源配置文件

  ```sh  
     
  cd /etc/yum.repos.d   
    
  #创建一个新的配置⽂文件   
  vim local.repo   
    
  #添加如下内容  
  [local]  
  name=local  
  baseurl=http://centos7-1/cdh57/  
  gpgcheck=0  
  enabled=1  
  ```  
  [local] serverid: 唯一标示  
  name:对于当前源的描述   
  baseurl:访问当前源的地址信息 gpgcheck: 1/ 0,是否gpg校验   
  enabled:1/0,是否使⽤当前源

- 5. 分发local.repo⽂文件到其它节点

  ```sh  
   rsync-script local.repo  
  ```

### 3. 安装Impala

- 1. 集群规划<br>
![](/resource/impala/assets/5552D203-72CE-476E-8F4F-7FAA723499D2.png)
  impala-server:这个进程是Impala真正工作的进程，官⽅建议把impala-server安装在datanode节点， 更更靠近数据(短路读取),进程名**impalad**  
    
  impala-statestored:健康监控⻆色，主要监控impala-server,impala-server出现异常时告知给其它 impala-server;进程名叫做**statestored**  
    
  impala-catalogd :管理理和维护元数据(Hive),impala更新操作;把impala-server更新的元数据通知给其 它impala-server,进程名**catalogd**  
    
  官⽅方建议statestore与catalog安装在同一节点上!!

- 2. yum安装impala
  centos7-3   
    
  ```sh  
  yum  install  impala -y  
  yum install impala-server -y  
  yum install impala-state-store  -y  
  yum install impala-catalog  -y  
  yum  install  impala-shell -y  
  ```  
    
  centos7-1, centos7-2  

  ```sh  
  yum install impala-server -y  
  yum  install  impala-shell -y  
  ```

- 3. 消除Impala yum安装的后遗症
  由于使用Yum命令安装Impala，我们选择使⽤yum自动进行Impala依赖的安装和处理，所以本次安装 默认会把Impala依赖的所有框架都会安装，⽐比如Hadoop,Hive,Mysql等，为了保证我们⾃己安装的 Hadoop等使⽤正常，我们需要删除掉Impala默认安装的其它框架  
    
  ```sh  
   [root@linux122 conf]# which hadoop  
  /usr/bin/hadoop  
  [root@linux122 conf]# which hive  
  /usr/bin/hive  
    
  #使⽤用which命令 查找hadoop,hive等会发现，命令⽂文件是/usr/bin/hadoop ⽽非我们⾃己安装的路 径，需要把这些删除掉,所有节点都要执⾏  
    
  rm -rf /usr/bin/hadoop  
  rm -rf /usr/bin/hdfs  
  rm -rf /usr/bin/hive  
  rm -rf /usr/bin/beeline  
  rm -rf /usr/bin/hiveserver2  
  #重新生效环境变量   
  source /etc/profile  
  ```

- 4. 修改hive-2.3.7/conf/hive-site.xml
  ```sh  
  vim hive-site.xml  
    
          <!-- hive server2, metastore  -->  
          <property>  
                  <name>hive.metastore.uris</name>  
                  <value>thrift://centos7-1:9083,thrift://centos7-3:9083</value>  
          </property>  
          <property>  
                  <name>hive.metastore.client.socket.timeout</name>  
                  <value>3600</value>  
          </property>  
  ```  
    
  分发到所有节点上

- 6. 启动metastore 和 hiveserver2
  在centos7-3上启动  
    
  ```sh  
  nohup hive --service metastore &  
    
  nohup hive --service hiveserver2 &  
  ```  
    
  启动成功之后 jps可以查到RunJar

- 7. 修改HDFS集群hdfs-site.xml
  配置HDFS集群的短路路读取  
  在HDFS中通过DataNode来读取数据。但是，当客户端向DataNode请求读取文件时，DataNode 就会从磁盘读取该⽂件并通过TCP socket将数据发送到客户端。所谓“短路”是指Client客户端直接 读取文件。很明显，这种情况只在客户端与数据放在同一地点(译者注:同⼀主机)时才有可能发⽣。路路读对于许多应用程序会带来重大的性能提升。  
  短路读取:就是Client与DataNode属于同⼀节点，无需再经过网络传输数据，直接本地读取。  
    
  创建短路读取本地中转站  

  ```sh  
  mkdir -p /var/lib/hadoop-hdfs  
  ```  
    
  修改hadoop-2.9.2/etc/hadoop/hdfs-site.xml  
    
  ```xml  
  <!-- 打开短路路读取配置-->   
  <property>  
      <name>dfs.client.read.shortcircuit</name>  
      <value>true</value>  
  </property>  
    
  <!--这是⼀一个UNIX域套接字的路路径，将⽤用于DataNode和本地HDFS客户机之间的通信 -->   
  <property>  
      <name>dfs.domain.socket.path</name>  
      <value>/var/lib/hadoop-hdfs/dn_socket</value>  
  </property>  
    
  <!--block存储元数据信息开发开关 -->   
  <property>  
      <name>dfs.datanode.hdfs-blocks-metadata.enabled</name>  
      <value>true</value>  
  </property>  
  <property>  
      <name>dfs.client.file-block-storage-locations.timeout</name>  
      <value>30000</value>  
  </property>  
  ```  
    
  分发到集群其它节点。重启Hadoop集群。

- 8. impala环境配置
  **引用HDFS，Hive配置**  
    
  使用Yum⽅式安装impala默认的Impala配置文件目录为 /etc/impala/conf，Impala的使用要依赖 Hadoop，Hive框架，所以需要把Hdfs,Hive的配置⽂件告知Impala。  
  执行以下命令把Hdfs，Hive的配置⽂文件软链接到/etc/impala/conf下  
    
  ```sh  
  ln -s /opt/lagou/servers/hadoop-2.9.2/etc/hadoop/core-site.xml /etc/impala/conf/core-site.xml  
  ln -s /opt/lagou/servers/hadoop-2.9.2/etc/hadoop/hdfs-site.xml /etc/impala/conf/hdfs-site.xml  
  ln -s /opt/lagou/servers/hive-2.3.7/conf/hive-site.xml /etc/impala/conf/hive-site.xml  
  ```  
  所有节点都要执⾏行行此命令!  
    
  **Impala自身配置**  
  所有节点更改Impala默认配置文件 

  ```sh  
   vim /etc/default/impala  
    
  <!--更更新如下内容 -->  
  IMPALA_CATALOG_SERVICE_HOST=centos7-3  
  IMPALA_STATE_STORE_HOST=centos7-3  
  ```  
  所有节点创建mysql的驱动包的软链接 

  ```sh  
  mkdir -p /usr/share/java  
    
  ln -s /opt/lagou/servers/hive-2.3.7/lib/mysql-connector-java-5.1.46.jar /usr/share/java/mysql-connector-java.jar  
  ```  
    
  修改bigtop的java_home路径  

  ```sh  
   vim /etc/default/bigtop-utils  
  export JAVA_HOME=/opt/lagou/servers/jdk1.8.0_231  
  ```

- 9. 启动impala

  ```sh  
  #centos7-3启动如下⻆色  
  service impala-state-store start service impala-catalog start service   
    
    
  #所有节点启动如下⻆色  
  service impala-server start  
  ```

- 10. 验证Impala启动结果<br>
![](/resource/impala/assets/186B7F2C-75C9-4315-9A94-95BB9349670C.png)

  ```sh  
  查看impala 进程是否都正常启动  
  ps -ef | grep impala  
  ```  
    
  浏览器web界面验证  
  ```  
   访问impalad的管理界面   
  http://centos7-3:25000/   
    
  访问statestored的管理理界⾯面 http://[centos7](http://linux123:25010/)-3:25010/  
  ```

## Impala⼊门案例

使⽤用Yum⽅式安装Impala后，impala-shell可以全局使用;进入impala-shell命令行

### impala的交互窗⼝<br>
![](/resource/impala/assets/5FA3FDF5-357B-4D49-8C6B-94D4ACB2599D.png)

### 示例代码

sql代码和hive保持一致，但是不能使用dfs指令  
  
```sql  
show databases;  
  
#表如果存在则删除  
drop table if exists t1;  
  
#创建外部表  
create external table t1(  
        id string,  
        name string,  
        age int,  
        gender int)  
row format delimited   
fields terminated by ','  
location '/user/impala/t1';  
  
#创建内部表  
create table t2(  
        id string,  
        name string,  
        age int,  
        gender int)  
row format delimited   
fields terminated by ',';  
  
# 导入数据到内部表  
insert overwrite table t2 select * from t1 where gender=0;  
  
# impala无法感知hive元数据更新，使用下面的命令强制更新  
invalidate metadata;  
```

### 小结

1. 上面案例中Impala的数据文件我们准备的是以逗号分隔的⽂本文件，实际上，Impala可以⽀  
持RCFile,SequenceFile,Parquet等多种文件格式。  
2. Impala与Hive元数据的关系?  
>Hive对于元数据的更新操作不能被Impala感知到; Impala对元数据的更新操作可以被Hive感知到。  
Impala同步Hive元数据命令:  
手动执行`invalidate metadata`  
3. Impala操作HDFS使用的是Impala用户，所以为了避免权限问题，我们可以选择关闭权限校验  
在hdfs-site.xml中添加如下配置:  

```xml  
 <!--关闭hdfs权限校验 --> <property>  
  <name>dfs.permissions.enabled</name>  
        <value>false</value>  
</property>  
```

## Imapla的架构原理

### Impala的组件<br>
![](/resource/impala/assets/D6EFCF8E-714C-4CF0-986A-8F43DEDB8F2D.png)

Impala是一个分布式，大规模并行处理(MPP)数据库引擎，它包括多个进程。Impala与Hive类似不是数 据库⽽而是数据分析⼯具;

- impalad
  * ⻆色名称为Impala Daemon,是在每个节点上运行的进程，是Impala的核⼼组件，进程名是 Impalad;   
  * 作用，负责读写数据文件，接收来⾃自Impala-shell，JDBC,ODBC等的查询请求，与集群其它 Impalad分布式并⾏完成查询任务，并将查询结果返回给中⼼协调者。   
  * 为了保证Impalad进程了解其它Impalad的健康状况，Impalad进程会⼀一直与statestore保持通信。  
  * Impalad服务由三个模块组成:Query Planner、Query Coordinator和Query Executor，前两个模块组成前端，负责接收SQL查询请求，解析SQL并转换成执⾏计划，交由后端执⾏

- statestored
  * statestore监控集群中Impalad的健康状况，并将集群健康信息同步给  
  * Impalad, statestore进程名为statestored

- catalogd
  * Impala执⾏的SQL语句引发元数据发变化时，catalog服务负责把这些元数据的变化同步给其它 Impalad进程(日志验证,监控statestore进程⽇志)  
  * catalog服务对应进程名称是catalogd   
  * 由于一个集群需要一个catalogd以及一个statestored进程，⽽且catalogd进程所有请求都是经过 statestored进程发送，所以官⽅建议让statestored进程与catalogd进程安排同个节点。

## Impala的查询<br>
![](/resource/impala/assets/59379EB3-8FCA-47E2-899A-0D1698BE3727.png)

### 1. Client提交任务

Client发送一个SQL查询请求到任意一个Impalad节点，会返回一个queryId用于之后的客户端操作。

### 2. 生成单机和分布式执行计划

SQL提交到Impalad节点之后，Analyser依次执⾏SQL的词法分析、语法分析、语义分析等操作; 从MySQL元数据库中获取元数据，从HDFS的名称节点中获取数据地址，以得到存储这个查询相关 数据的所有数据节点  
* 单机执⾏计划: 根据上一步对SQL语句的分析，由Planner先生成单机的执行计划，该执⾏计划是有PlanNode组成的⼀棵树，这个过程中也会执行一些SQL优化，例如Join顺序改变、谓 词下推等。  
* 分布式并⾏物理计划:将单机执行计划转换成分布式并⾏物理理执行计划，物理理执⾏计划由⼀个个的Fragment组成，Fragment之间有数据依赖关系，处理过程中需要在原有的执⾏计划 之上加⼊一些ExchangeNode和DataStreamSink信息等。  
	* Fragment : sql⽣成的分布式执行计划的⼀个⼦任务;  
	* DataStreamSink:传输当前的Fragment输出数据到不同的节点

### 3. 任务调度和分发

Coordinator将Fragment(子任务)根据数据分区信息发配到不同的Impalad节点上执行。Impalad 节点接收到执行Fragment请求交由Executor执行。

### 4. Fragment之间的数据依赖

每一个Fragment的执行输出通过DataStreamSink发送到下一个Fragment，Fragment运行过程中  
不断向coordinator节点汇报当前运⾏状态。

### 5. 结果汇总

查询的SQL通常情况下需要有⼀个单独的Fragment用于结果的汇总，它只在Coordinator节点运行，将多个节点的最终执⾏结果汇总，转换成ResultSet信息。

### 6. 获取结果

客户端调用获取ResultSet的接⼝，读取查询结果。

## Impala的使用

Impala的核心开发语⾔是sql语句，Impala有shell命令⾏窗口，以及JDBC等⽅式来接收sql语句句执行， 对于复杂类型分析可以使⽤C++或者Java来编写UDF函数。  
Impala的sql语法是高度集成了Apache Hive的sql语法，Impala支持Hive支持的数据类型以及部分Hive 的内置函数。

### Impala-shell

- impala-shell外部命令

	- impala-shell –h
	  可以帮助我们查看帮助手册

	- impala-shell –r
	  刷新impala元数据，与建⽴连接后执行 REFRESH 语句效果相同(元数据发⽣变化的时候)

	- impala-shell –f 
	  文件路径 执行指定的sql查询文件。

	- impala-shell –i
	  指定连接运行 impalad 守护进程的主机。默认端口是 21000。你可以连接到集群中运⾏ impalad 的任意主机。

	- impala-shell –o
	  保存执行结果到文件当中去

- impala-shell内部命令
  所谓内部命令是指，进⼊impala-shell命令⾏之后可以执⾏的语句

	- show functions
	  展示Impala默认⽀持的内置函数需要进⼊Impala默认系统数据库中执行

	- connect hostname
	  连接到指定的机器impalad上去执行

	- refresh dbname.tablename
	  增量刷新，刷新某一张表的元数据，主要⽤于刷新hive当中数据表里面的 数据改变的情况。

	- invalidate metadata
	  全量刷新，性能消耗较大，主要⽤用于hive当中新建数据库或者数据库表的时候来进⾏刷新。

	- explain select ...
	  用于查看sql语句的执⾏计划。  
	    
	  explain的值可以设置成0,1,2,3等几个值，其中3级别是最⾼的，可以打印出最全的信息  

	  ```sh  
	  set explain_level=3;  
	  ```  
	   

	- profile
	  执⾏sql语句之后执行，可以打印出更加详细的执⾏步骤，主要用于查询结果的查看，集群的调优等。

### Impala sql语法

SQL基本上和hive一致，这里只写出不同点

- impala对数据类型的支持
  对于Text存储格式中的复杂类型不支持，复杂类型要使用parquet格式。

- view视图
  视图仅仅是存储在数据库中具有关联名称的Impala查询语⾔的语句。 它是以预定义的SQL查询形式的表的组合。  
  视图可以包含表的所有⾏或选定的行

	- create view if not exists view_name as select statement

	- alter view database_name.view_name as Select语句

	- drop view database_name.view_name

- order by⼦句

  ```sql  
     
  select * from table_name ORDER BY col_name  
   [ASC|DESC] [NULLS FIRST|NULLS LAST]  
    
  ```  
    
  可以使⽤关键字ASC或DESC分别按升序或降序排列表中的数据。  
  如果我们使用NULLS FIRST，表中的所有空值都排列在顶行; 如果我们使⽤用NULLS LAST，包含空值的⾏将最后排列。

- limit [num] offset [num]
  Impala中的limit⼦句用于将结果集的行数限制为所需的数，即查询的结果集不包含超过指定限制的记录。  
  一般来说，select查询的resultset中的⾏从0开始。使⽤offset⼦句，我们可以决定从哪里考虑输出。使用offset关键字要求结果数据必须是排序之后的!!

### Impala导⼊数据

- insert into values

  ```sql  
  create table t_test2(id int,name string);  
  insert into table t_test2 values(1,”zhangsan”);  
  insert into  t_test2 values(1,”zhangsan”);  
  ```

- insert into select
  插⼊一张表的数据来自于后面的select查询语句返回的结果。

- create table as select
  建表的字段个数、类型、数据来自于后续的select查询语句。  
  load data⽅式，这种方式不建议在Impala中使⽤，先使用load data⽅式把数据加载到Hive表中，然后  
  使用以上⽅式插⼊Impala表中。

### Impala的JDBC方式查询

- 1. 导入jar包

  ```xml  
  <dependencies>  
      <!-- https://mvnrepository.com/artifact/org.apache.hadoop/hadoop-common -->  
      <dependency>  
          <groupId>org.apache.hadoop</groupId>  
          <artifactId>hadoop-common</artifactId>  
          <version>2.9.2</version>  
      </dependency>  
    
      <!-- https://mvnrepository.com/artifact/org.apache.hive/hive-common -->  
      <dependency>  
          <groupId>org.apache.hive</groupId>  
          <artifactId>hive-common</artifactId>  
          <version>2.3.7</version>  
      </dependency>  
    
      <!-- https://mvnrepository.com/artifact/org.apache.hive/hive-metastore -->  
      <dependency>  
          <groupId>org.apache.hive</groupId>  
          <artifactId>hive-metastore</artifactId>  
          <version>2.3.7</version>  
      </dependency>  
    
    
      <!-- https://mvnrepository.com/artifact/org.apache.hive/hive-service -->  
      <dependency>  
          <groupId>org.apache.hive</groupId>  
          <artifactId>hive-service</artifactId>  
          <version>2.3.7</version>  
      </dependency>  
    
      <!-- https://mvnrepository.com/artifact/org.apache.hive/hive-jdbc -->  
      <dependency>  
          <groupId>org.apache.hive</groupId>  
          <artifactId>hive-jdbc</artifactId>  
          <version>2.3.7</version>  
      </dependency>  
    
      <!-- https://mvnrepository.com/artifact/org.apache.hive/hive-exec -->  
      <dependency>  
          <groupId>org.apache.hive</groupId>  
          <artifactId>hive-exec</artifactId>  
          <version>2.3.7</version>  
      </dependency>  
    
  </dependencies>  
  ```

- 2. java代码开发

  ```java  
  import java.sql.Connection;  
  import java.sql.DriverManager;  
  import java.sql.PreparedStatement;  
  import java.sql.ResultSet;  
    
  public class ImpalaTest {  
      public static void main(String[] args) throws Exception {  
          //定义连接impala的驱动和连接url  
          String driver = "org.apache.hive.jdbc.HiveDriver";  
          String driverUrl = "jdbc:hive2://centos7-3:25004/default;auth=noSasl";  
          //查询的sql语句  
          String querySql = "select * from t1";  
          //获取连接  
          Class.forName(driver);  
          //通过Drivermanager获取连接  
          final Connection connection = DriverManager.getConnection(driverUrl);  
          final PreparedStatement ps = connection.prepareStatement(querySql);  
    
          //执行查询  
          final ResultSet resultSet = ps.executeQuery();  
          //解析返回结果  
          //获取到每条数据的列数  
          final int columnCount = resultSet.getMetaData().getColumnCount();  
          //遍历结果集  
          while (resultSet.next()) {  
              for (int i = 1; i <= columnCount; i++) {  
                  final String string = resultSet.getString(i);  
                  System.out.print(string + "\t");  
              }  
              System.out.println();  
          }  
    
          //关闭资源  
          ps.close();  
          connection.close();  
      }  
  }  
    
  ```

## Impala进阶

### Impala的负载均衡

Impala主要有三个组件，分别是statestore，catalog和impalad，对于Impalad节点，每一个节点都可以接收客户端的查询请求，并且对于连接到该Impalad的查询还要作为Coordinator节点(需要消耗⼀定的内存和CPU)存在，为了保证每一个节点的资源开销的平衡需要对于集群中的Impalad节点做一下 负载均衡.  
* Cloudera官⽅方推荐的代理理⽅方案:HAProxy  
* DNS做负载均衡  
⽣产中应该选择一个⾮Impalad节点作为HAProxy的安装节点

- 1. 安装haproxy

  ```sh  
  yum install haproxy -y  
  ```

- 2. 修改配置文件

  ```sh  
  vim /etc/haproxy/haproxy.cfg  
    
  # 在文件末尾插入如下内容  
    
  listen status #定义管理理界⾯  
          bind 0.0.0.0:1080 #管理理界⾯面访问IP和端⼝ mode http #管理界⾯所使用的协议  
          option httplog  
          maxconn 5000 #最大连接数  
          stats refresh 30s #30秒⾃自动刷新  
          stats uri /stats  
    
  listen impalashell  
          bind 0.0.0.0:25003 #ha作为proxy所绑定的IP和端⼝  
          mode tcp #以4层方式代理，重要  
          option tcplog  
          balance roundrobin #调度算法 'leastconn' 最少连接数分配，或者 'roundrobin'，轮询分  
          server impalashell_1 centos7-1:21000 check  
          server impalashell_2 centos7-2:21000 check  
          server impalashell_3 centos7-3:21000 check  
    
  listen impalajdbc  
          bind 0.0.0.0:25004 #ha作为proxy所绑定的IP和端⼝口  
          mode tcp #以4层⽅方式代理理，重要  
          option tcplog  
          balance roundrobin #调度算法 'leastconn' 最少连接数分配，或者 'roundrobin'，轮询分  
          server impalajdbc_1 centos7-1:21050 check  
          server impalajdbc_2 centos7-2:21050 check  
          server impalajdbc_3 centos7-3:21050 check  
    
  ```

- 3. haproxy启动指令

  ```sh  
  开启: service haproxy start   
  关闭: service haproxy stop   
  重启: service haproxy restart  
  ```

- 4. 使用方法
  Impala-shell访问方式  
    
  ```sh  
  impala-shell -i centos7-3:25003  
  ```  
    
  使用起来十分⽅便，区别仅仅相当于是修改了一个ip地址和端⼝而已，其余不变。  

  ```sh  
  jdbc:hive2://centos7-3:25004/default;auth=noSasl  
  ```

### Impala优化

- 文件格式推荐使用parquet

- 避免⼩文件
  insert ... values 会产⽣大量⼩文件，避免使用

- 合理分区粒度
  利用分区可以在查询的时候忽略掉⽆⽤数据，提高查询效率，通常建议分区数量在3万以下 (太多的分区也会造成元数据管理理的性能下降)

- 分区列数据类型最好是整数类型

- 获取表的统计指标
  在追求性能或者大数据量查询的时候，要先获取所需要的表的统计指标 (如:执⾏ compute stats )

- 减少传输客户端数据量
  聚合(如 count、sum、max 等)  
  过滤(如 WHERE )  
  limit限制返回条数  
  返回结果不要使⽤美化格式进⾏展示(在通过impala-shell展示结果时，添加这些可选参数: - B、 --output_delimiter)

- 在执行之前使用EXPLAIN来查看逻辑规划，分析执⾏逻辑

- Impala join⾃动优化
  通过使⽤COMPUTE STATS来收集参与Join的每张表的统计信息，然后由Impala根据表的⼤小、列的唯⼀值数目等来⾃动优化查询。为了更加精确地获取 每张表的统计信息，每次表的数据变更时(如执行Insert,add partition,drop partition等)最好 都要执⾏一遍COMPUTE STATS获取到准确的表统计信息。

