---
layout: post
title:  "Hive on spark"
date:   2021-10-29
categories: big data
---
### Hive on spark

官方配置说明: [https://www.docs4dev.com/docs/en/apache-hive/3.1.1/reference/Hive_on_Spark__Getting_Started.html#google_vignette](https://www.docs4dev.com/docs/en/apache-hive/3.1.1/reference/Hive_on_Spark__Getting_Started.html#google_vignette)

#### 版本兼容

需要使用官方推荐的spark版本

| Hive Version | Spark Version |
| ------------ | ------------- |
| master       | 2.3.0         |
| 3.0.x        | 2.3.0         |
| 2.3.x        | 2.0.0         |
| 2.2.x        | 1.6.0         |
| 2.1.x        | 1.6.0         |
| 2.0.x        | 1.5.0         |
| 1.2.x        | 1.3.1         |
| 1.1.x        | 1.2.0         |

[spark 下载地址](https://archive.apache.org/dist/spark/)

spark相关集群按照配置,可以参考另一篇文章 [spark core](/blog/2021/04/08/bd-spark_up#spark安装配置)

#### Yarn 配置

yarn的调度方式必须改成公平调度

在 `$HADOOP_HOME/etc/hadoop/yarn-site.xml` 中添加如下配置

```xml
<!--for hive on spark-->
<property>
  <name>yarn.resourcemanager.scheduler.class</name>
  <value>org.apache.hadoop.yarn.server.resourcemanager.scheduler.fair.FairScheduler</value>
</property>
```

##### Hive 配置

添加spark的jar包到 HIVE_HOME/lib

```shell
# 建立连接即可
ln -s $SPARK_HOME/jars/* $HIVE_HOME/lib/
```

`$HADOOP_HOME/etc/hadoop/hive-site.xml` 添加如下配置

```xml
<!-- spark engine -->
        <property>
                <name>hive.execution.engine</name>
                <value>spark</value>
                <description>set spark as defualt engine</description>
        </property>
         <property>
                <name>spark.master</name>
                <value>yarn</value>
                <description>使用yarn调度spark</description>
        </property>
        <property>
                <name>spark.deploy.mode</name>
                <value>cluster</value>
				<description> yarn 集群模式 </description>
        </property>
        <property>
                <name>spark.eventLog.enabled</name>
                <value>true</value>
				<description> 开启log </description>
        </property>
        <property>
                <name>spark.eventLog.dir</name>
                <value>hdfs://centos7-1:9000/spark2_0_0_eventlog</value>
				<description> log 存放路径,必须为hdfs,自定义 </description>
        </property>
				<property>
                <name>spark.executor.memory</name>
                <value>512m</value>
        </property>
        <property>
                <name>spark.serializer</name>
                <value>org.apache.spark.serializer.KryoSerializer</value>
        </property>
        <property>
                <name>spark.yarn.jars</name>
                <value>hdfs:///spark-yarn2_0_0/jars/*.jar</value>
				<description> spark 运行时需要用到的jar包, 优化项, 自定义 </description>
        </property>
```


