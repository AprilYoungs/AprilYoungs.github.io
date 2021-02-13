---
layout: post
title:  "Azkaban--工作流调度系统"
date:   2021-2-12
categories: big data
---

## 基本认识

### 什么是工作流workflow

一个完整的数据分析系统通常都是由大量任务单元组成:  
* shell脚本程序  
* java程序  
* mapreduce程序  
* hive脚本等  
各任务单元之间存在时间先后及前后依赖关系,为了很好地组织起这样的复杂执行计划，需要一个工作流调度系统来调度任务的执行。  
假如，我有这样一个需求，某个业务系统每天产生20G原始数据，每天都要对其进行处理，处理步骤如下所示:  
* 通过Hadoop先将原始数据同步到HDFS上;  
* 借助MapReduce计算框架对原始数据进行转换，生成的数据以分区表的形式存储到多张Hive表中;  
* 需要对Hive中多个表的数据进行JOIN处理，得到一个明细数据Hive大表;  
* 将明细数据进行各种统计分析，得到结果报表信息;  
* 需要将统计分析得到的结果数据同步到业务系统中，供业务调用使用。  
如果每一步都是手动调用，就会很消耗人力来重复作业，所以需要有工作流调度系统来自动作业

### 工作流调度实现方式

* 简单的任务调度 -> 直接使用linux的crontab;  
* 复杂的任务调度 -> 开发调度平台或使用现成的开源调度系统，比如Ooize、 Azkaban、Airflow等

### Azkaban与Oozie对比

对市面上最流行的两种调度器，进行对比分析。总体来说，Ooize相比Azkaban是一个重量级的任务调度系统，功能全面，但配置使用也更复杂(xm)。如果可以不在意某些功能的缺失，轻量级调度器Azkaban是很不错的候选对象。  
* 功能  
两者均可以调度mapreduce,pig,java,脚本工作流任务  
两者均可以定时执行工作流任务  
* 工作流定义  
Azkaban使用Properties文件定义工作流  
Oozie使用XML文件定义工作流  
* 工作流传参  
Azkaban支持直接传参，例如${input}  
Oozie支持参数和EL表达式，例如${fs:dirSize(myInputDir)}  
* 定时执行  
Azkaban的定时执行任务是基于时间的  
0ozie的定时执行任务基于时间和输入数据  
* 资源管理  
Azkaban有较严格的权限控制，如用户对工作流进行读/写/执行等操作  
Oozie暂无严格的权限控制  
* 工作流执行  
Azkaban有两种运行模式，分别是solo server mode(executor server和web server部署在同一台节点)和multi server mode(executor server和web server可以部署在不同节点)  
Oozie作为工作流服务器运行，支持多用户和多工作流

### Azkaban介绍<br>
![](/resource/azkaban/assets/5D44499E-AA3E-4F2E-BD25-23D3A50B0F8D.png)

Azkaban是由linkedin (领英)公司推出的一个批量工作流任务调度器，用于在一个工作流内以一个特定的顺序运行一组工作和流程。Azkaban使用job配置文件建立任务之间的依赖关系，并提供一个易于使用的web用户界面维护和跟踪你的工作流。  
  
Azkaban定义了一种KV文件(properties)格式来建立任务之间的依赖关系，并提供一个易于使用的web 用户界面维护和跟踪你的工作流。  
有如下功能特点  
* Web用户界面  
* 方便上传工作流  
* 方便设置任务之间的关系  
* 调度工作流  
  
架构角色  
**mysql服务器**:存储元数据，如项目名称、项目描述、项目权限、任务状态、SLA规则等  
**AzkabanWebServer**:对外提供web服务，使用户可以通过web页面管理。职责包括项目管理、权限授权、任务调度、监控executor。  
**AzkabanExecutorServer**:负责具体的工作流的提交、执行。

## Azkaban安装部署

### 1. 编译安装包

这里选用azkaban3.51.0这个版本自己进行重新编译，编译完成之后得到我们需要的安装包进行安装  
  
```sh  
cd /opt/lagou/software/  
wget https://github.com/azkaban/azkaban/archive/3.51.0.tar.gz   
tar -zxvf 3.51.0.tar.gz -C ../servers/  
cd /opt/1agou/servers/azkaban-3.51.0/  
yum -y install git  
yum -y install gcc-c++  
./gradlew build installDist -x test  
```  
  
编译成功之后生成的文件  
  
```sh  
azkaban-db-0.1.0-SNAPSHOT.tar.gz  
azkaban-exec-server-0.1.0-SNAPSHOT.tar.gz  
azkaban-solo-server-0.1.0-SNAPSHOT.tar.gz  
azkaban-web-server-0.1.0-SNAPSHOT.tar.gz  
```

### 2. solo-server模式部署

单服务模式安装

- 解压
  azkaban的solo server使用的是一个单节点的模式来进行启动服务的，只需要一个azkaban-solo-server-0.1.0-SNAPSHOT.tar.gz的安装包即可启动，所有的数据信息都是保存在H2这个azkaban默认的数据当中  
    
  ```sh  
  tar -zxvf azkaban-solo-server-0.1.0-sNAPSH0T.tar.gz-c../../servers/azkaban  
  ```

- 修改配置文件
  修改时区配置⽂件  
    
  ```sh  
  cd/opt/1agou/servers/azkaban-solo-server-0.1.0-SNAPSH0T/conf   
  vim azkaban.properties  
    
  default.timezone.id=Asia/Shanghai  
  ```  
    
  修改commonprivate.properties配置文件  
    
  ```sh  
  cd /opt/lagou/servers/azkaban-solo-server-0.1.0-SNAPSHOT/plugins/jobtypes   
    
  vim commonprivate.properties  
    
  execute.as.user=false   
  memCheck.enabled=false  
  ```  
  azkaban默认需要3G的内存，剩余内存不足则会报异常。

- 启动solo-server
  ```sh  
  cd/opt/lagou/servers/azkaban-solo-server-0.1.0-SNAPSHOT  
    
  bin/start-solo.sh  
  ```  
    
  启动成功后  
  ```sh  
  jps  
    
  # 可以看到对应的服务已启动  
  AzkabanSingleServer  
  ```

- 浏览器⻚面访问
![](/resource/azkaban/assets/E50344FA-E2FE-459F-AC6C-2B082940AC6A.png)
  浏览器访问主机名:8081端口  
  [http://centos7-2:8081/index](http://centos7-2:8081/index)  
    
    
  登录信息  
  用户名:azkaban  
  密码:azkaban

- 测试一下
  编写一个job  
    
  ```sh  
  vim foo.job  
    
  type=command  
  command=echo 'Hello World'  
    
  zip foo.job  
  ```  
    
  上传zip文件，在web端执行

### 3. multiple-executor模式部署

- 安装所需软件
  **Azkaban Web服务安装包**  
  azkaban-web-server-0.1.0-SNAPSHOT.tar.gz   
  **Azkaban执行服务安装包**  
  azkaban-exec-server-0.1.0-SNAPSHOT.tar.gz   
  **sql脚本**

- 节点规划<br>
![](/resource/azkaban/assets/10C4CB5B-547A-4385-B0D0-5DCF31D0A67C.png)

- 数据库准备
  解压数据库脚本  
    
  ```sh  
  tar -zxvf azkaban-db-0.1.0-SNAPSH0T.tar.gz -C /opt/lagou/servers/azkaban  
    
  # 进入解压后的文件夹, 复制create-all-sql-0.1.0-SNAPSHOT.sql 的全路径，后面会用到  
  ```  
    
  进入centos7-3的mysql的客户端  
    
  ```sql  
  CREATE DATABASE azkaban;  
  use azkaban;  
  source /opt/lagou/servers/azkaban/azkaban-db-0.1.0-SNAPSHOT/create-all-sql-0.1.0-SNAPSHOT.sql;  
  ```

- 配置Azkaban-web-server
  进入centos7-2节点  
  解压azkaban-web-server  
    
  ```sh  
  mkdir /opt/lagou/servers/azkaban  
  tar -zxvf azkaban-web-server-0.1.0-SNAPSH0T.tar.gz -C /opt/lagou/servers/azkaban/  
  ```  
    
  修改azkaban-web-server的配置文件  
    
  ```sh  
  cd /opt/1agou/servers/azkaban-web-server-3.51.0/conf   
  vim azkaban. properties  
    
  # 1. 修改时区，注意后面不要有空格  
  default.timezone.id=Asia/Shanghai  
  # 2. 修改并记住这个端口，后面web端访问会用到  
  jetty.port=8443  
    
  # 3. 修改mysql相关配置，使用一个可以远程访问的账号  
  database.type=mysql  
  mysql.port=3306  
  mysql.host=centos7-3  
  mysql.database=azkaban  
  mysql.user=root  
  mysql.password=12345678  
  mysql.numconnections=100  
    
  # 4. 注释掉如下代码， 不然机器配置不足就会启动失败  
  #azkaban.executorselector.filters=StaticRemainingFlowSize,MinimumFreeMemory,CpuStatus  
  ```  
    
  添加属性  
  ```sh  
  mkdir -p plugins/jobtypes  
  cd plugins/jobtypes/  
  vim commonprivate.properties  
    
  azkaban.native.lib=false  
  execute.as.user=false  
  memCheck.enabled=false  
  ```

- 配置Azkaban-exec-server
  1. 解压安装包  
  ```sh  
  tar -zxvf azkaban-exec-server-0.1.0-SNAPSHOT.tar.gz -C ../../servers/azkaban/  
  ```  
    
  2. 修改azkaban-exec-server的配置文件  
  
  ```sh  
  cd/opt/1agou/servers/azkaban-exec-server-3.51.0/conf   
  vim azkaban.properties  
    
  # 1. 修改时区  
  default.timezone.id=Asia/Shanghai  
    
  # 2. 修改webserver url  
  azkaban.webserver.url=http://centos7-2:8443  
    
  # 3. 修改mysql的配置  
  # Azkaban mysql settings by default. Users should configure their own username and password.  
  database type=mysql  
  mysql.port=3306  
  mysql.host=centos7-3  
  mysql.database=azkaban  
  mysql.user=root  
  mysql.password=12345678  
  mysql.numconnections=100  
    
  # 4. 增加port信息，随便写，不被占用就行  
  # Azkaban Executor settings  
  executor.port=12321  
  ```  
    
  3. 修改commonprivate.properties配置文件  
    
  ```sh  
  cd /opt/lagou/servers/azkaban-solo-server-0.1.0-SNAPSHOT/plugins/jobtypes   
    
  vim commonprivate.properties  
    
  execute.as.user=false   
  memCheck.enabled=false  
  ```  
  azkaban默认需要3G的内存，剩余内存不足则会报异常。  
    
  4. 分发exec-server到centos7-1节点  
    
  ```sh  
  scp -r azkaban-exec-server-3.51.0 centos7-1:$PWD  
  ```

- 启动服务
  ```sh  
  #分别在centos7-1, centos7-3启动exec-server   
  bin/start-exec.sh   
  #在centos7-2启动web-server  
  bin/start-web.sh  
  ```  
    
  会发现webserver启动失败，在webserver的根目录下可以查看错误日志  
  ```sh  
  Error: No active executor found  
  ```  
    
  激活我们的exec-server, 需要手动激活executor在centos7-1,centos7-3上分别执行  
    
  ```sh  
  cd /opt/lagou/servers/azkaban/exec-server-0.1.0/  
  curl -G "localhost:$(<./executor.port)/executor?action=activate" && echo  
  ```

- 访问web端
  网站:  
  http://centos7-2:8443  
    
  用户: azkaban  
  密码: azkaban

## Azkaban使⽤

### shell command调度

创建job描述文件  
```  
vi command.job  
  
type=command  
command=echo 'hello'  
```  
  
将job资源文件打包成zip文件  
```sh  
zip command.job  
```  
通过azkaban的web管理平台创建project并上传job压缩包

### job依赖调度

创建有依赖关系的多个job描述第一个job:foo.job  
  
```sh  
foo.job  
type=command  
command=echo 'foo'  
```  
第二个job:bar.job依赖foo.jobbar.job  
  
```sh  
type=command  
dependencies=foo   
command=echo 'bar'  
```  
将所有job资源⽂件打到⼀个zip包中  
在azkaban的web管理界面创建⼯程并上传zip包, 启动⼯作流flow

### HDFS任务调度

创建job描述文件fs.job  
```sh  
type=command  
command=/opt/lagou/servers/hadoop-2.9.2/bin/hadoop fs -mkdir /azkaban  
```  
将job资源文件打包成zip文件  
通过azkaban的web管理平台创建project并上传job压缩包启动执行该job

### MAPREDUCE任务调度

mr任务依然可以使用command的job类型来执行  
创建job描述文件，及mr程序jar包(示例中直接使用hadoop自带的example jar)  
```  
vim mrwc.job  
  
type=command  
command=/opt/1agou/servers/hadoop-2.9.2/bin/hadoop jar hadoop-mapreduce- examples-2.9.2.jar wordcount /wordcount/input /wordcount/azout  
```  
将所有job资源文件打到一个zip包中  
在azkaban的web管理界面创建工程并上传zip包启动job

- linux内存不足解决
  ```sh  
  # 查看缓存  
  free -m  
  # 清除缓存  
  echo 1 > /proc/sys/vm/drop_caches  
  echo 2 > /proc/sys/vm/drop_caches  
  echo 3 > /proc/sys/vm/drop_caches  
  ```

### HIVE脚本任务调度

创建job描述文件和hive脚本Hive脚本: test.sql  
  
```sql  
use default;  
drop table aztest;  
create table aztest(id int,name string)   
row format delimited   
fields terminated by ',';  
```  
Job描述文件:hivef.job   
  
```sh  
type=command  
command=/opt/1agou/servers/hive-2.3.7/bin/hive -f 'test.sql'  
```  
将所有job资源文件打到一个zip包中创建工程并上传zip包,启动job

### 定时任务调度<br>
![](/resource/azkaban/assets/ABF5ABF6-A4F5-4825-A26F-7EA29DC044F8.png)

web界面启动的时候使用schedule就可以了

