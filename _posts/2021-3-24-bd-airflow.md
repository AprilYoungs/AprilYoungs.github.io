---
layout: post
title:  "Airflow任务调度系统"
date:   2021-3-24
categories: big data
---

Airflow 是 Airbnb 开源的一个用 Python 编写的调度工具。 Airflow将一个工作流制定为一组任务的有向无环图(DAG)，并指派到一组计算节 点上，根据相互之间的依赖关系，有序执行。Airflow 有以下优势:  
* 灵活易用。Airflow 是 Python 编写的，工作流的定义也使用 Python 编写;  
* 功能强大。支持多种不同类型的作业，可自定义不同类型的作业。如 Shell、 Python、Mysql、Oracle、Hive等;  
* 简洁优雅。作业的定义简单明了;   
* 易扩展。提供各种基类供扩展，有多种执行器可供选择;


## 简介

### 架构体系<br>
![](/resource/airflow/assets/11A62F36-D76F-487F-B272-D26059CE0AAB.png)

- Webserver 守护进程
  接受 HTTP 请求，通过 Python Flask Web 应用程序与 airflow 进行交互。Webserver 提供功能的功能包括:中止、恢复、触发任务;监控 正在运行的任务，断点续跑任务;查询任务的状态，日志等详细信息。

- Scheduler 守护进程
  周期性地轮询任务的调度计划，以确定是否触发任务执行。

- Worker 守护进程
  Worker负责启动机器上的executor来执行任务。使用 celeryExecutor后可以在多个机器上部署worker服务。

### 重要概念

- DAG(Directed Acyclic Graph)有向无环图
  * 在Airflow中，一个DAG定义了一个完整的作业。同一个DAG中的所有Task拥有 相同的调度时间。  
  * 参数:  
  	* dag_id:唯一识别DAG 	  
  	* default_args:默认参数，如果当前DAG实例的作业没有配置相应参数，则 采用DAG实例的default_args中的相应参数   
  	* schedule_interval:配置DAG的执行周期，可采用crontab语法

- Task
  * Task为DAG中具体的作业任务，依赖于DAG，必须存在于某个DAG中。Task在DAG中可以配置依赖关系  
  * 参数:  
  	* dag:当前作业属于相应DAG 	  
  	* task_id:任务标识符   
  	* owner:任务的拥有者 	  
  	* start_date:任务的开始时间

## Airflow安装部署

安装条件  
* CentOS 7.X  
* Python 3.5或以上版本(推荐)   
* MySQL 5.7.x  
* Apache-Airflow 1.10.11  
* 机器可以上网

### Python环境准备

```sh  
# 卸载 mariadb  
rpm -qa | grep mariadb   
mariadb-libs-5.5.65-1.el7.x86_64   
mariadb-5.5.65-1.el7.x86_64   
mariadb-devel-5.5.65-1.el7.x86_64  
  
yum remove mariadb  
yum remove mariadb-devel  
yum remove mariadb-libs  
  
# 安装依赖  
rpm -ivh mysql57-community-release-el7-11.noarch.rpm  
yum -y install mysql-community-server  
  
yum install readline readline-devel -y  
yum install gcc -y  
yum install zlib* -y  
yum install openssl openssl-devel -y  
yum install sqlite-devel -y  
yum install python-devel mysql-devel -y  
  
# 提前到python官网下载好包  
cd /opt/software  
tar -zxvf Python-3.6.6.tgz  
  
# 安装 python3 运行环境  
cd Python-3.6.6/  
# configure文件是一个可执行的脚本文件。如果配置了--prefix，安装后的所有资源文件都会放在目录中  
./configure --prefix=/usr/local/python3.6  
make && make install  
/usr/local/python3.6/bin/pip3 install virtualenv  
  
# 启动 python3 环境  
cd /usr/local/python3.6/bin/  
./virtualenv env  
. env/bin/activate  
  
# 检查 python 版本  
python -V  
```

### 安装Airflow

```sh  
# 设置目录(配置文件)  
# 添加到配置文件/etc/profile。未设置是缺省值为 ~/airflow  
export AIRFLOW_HOME=/opt/servers/airflow  
  
# 使用国内源下载  
pip3 install apache-airflow==1.10.11 -i https://pypi.douban.com/simple  
```

### 创建MySQL用户并授权

```sql  
-- 创建数据库  
create database airflowcentos72;  
​  
-- 创建用户airflow，设置所有ip均可以访问  
create user 'airflow'@'%' identified by '12345678';  
create user 'airflow'@'localhost' identified by '12345678';  
​  
-- 用户授权，为新建的airflow用户授予Airflow库的所有权限  
grant all on airflowcentos72.* to 'airflow'@'%';  
grant all on *.* to 'airflow'@'localhost';  
SET GLOBAL explicit_defaults_for_timestamp = 1;   
flush privileges;  
```

### 修改Airflow DB配置

```sh  
# python3 环境中执行  
pip install mysqlclient==1.4.6   
pip install SQLAlchemy==1.3.15  
airflow initdb  
```  
  
  
修改 $AIRFLOW_HOME/airflow.cfg:  
  
```sh  
 # 约 75 行  
sql_alchemy_conn = mysql://airflow:12345678@centos7-2:3306/airflowcentos72  
  
# 重新执行  
airflow initdb  
```

### 安装密码模块

```sh  
pip install apache-airflow[password]  
```  
  
修改 airflow.cfg 配置文件(第一行修改，第二行增加):  
  
```sh  
# 约 281 行  
[webserver]  
  
# 约 353行  
authenticate = True  
auth_backend = airflow.contrib.auth.backends.password_auth  
```  
  
添加密码文件, 只需python脚本  
  
```python  
import airflow  
from airflow import models, settings  
from airflow.contrib.auth.backends.password_auth import PasswordUser  
  
user = PasswordUser(models.User())  
user.username = 'airflow'  
user.email = 'airflow@lagou.com'  
user.password = 'airflow123'  
  
session = settings.Session()  
session.add(user)  
session.commit()  
session.close()  
exit()  
```

### 启动服务

```sh  
# 备注:要先进入python3的运行环境   
  
cd /usr/local/python3.6/bin/   
./virtualenv env  
. env/bin/activate  
  
# 退出虚拟环境命令   
deactivate  
  
# 启动scheduler调度器:   
airflow scheduler -D  
# 服务页面启动:  
airflow webserver -D  
```  
  
安装完成，可以使用浏览器登录 http://centos7-2:8080;输入用户名、口令:airflow / airflow123

### 停止airflow webserver

```sh  
# 关闭 airflow webserver 对应的服务  
ps -ef | grep 'airflow-webserver' | grep -v 'grep' | awk '{print $2}' | xargs -i kill -9 {}  
  
# 关闭 airflow scheduler 对应的服务  
ps -ef | grep 'airflow' | grep 'scheduler' | awk '{print $2}' | xargs -i kill -9 {}  
  
# 删除对应的pid文件  
cd $AIRFLOW_HOME  
rm -rf *.pid  
```

### 禁用自带的DAG任务

1. 停止服务  
2. 修改文件 $AIRFLOW_HOME/airflow.cfg:  

```sh  
# 修改文件第 136 行  
load_examples = False  
  
  
# 重新设置db   
airflow resetdb -y  
```  
  
3. 重新设置账户、口令:  
  
```python  
import airflow  
from airflow import models, settings  
from airflow.contrib.auth.backends.password_auth import PasswordUser  
  
user = PasswordUser(models.User())  
user.username = 'airflow'  
user.email = 'airflow@lagou.com'  
user.password = 'airflow123'  
  
session = settings.Session()  
session.add(user)  
session.commit()  
session.close()  
exit()  
```  
  
4. 重启服务

### crontab简介<br>
![](/resource/airflow/assets/252B778D-B4CA-4DE0-BF63-A7C3422FFCCF.png)

Linux 系统则是由 cron (crond) 这个系统服务来控制的。Linux 系统上面原本就有非常多的计划性工作，因此这个系统服务是默认启动的。  
Linux 系统也提供了Linux用户控制计划任务的命令:crontab 命令。  
  
* 日志文件:`ll /var/log/cron*`  
* 编辑文件:`vim /etc/crontab`  
* 进程:`ps -ef | grep crond ==> /etc/init.d/crond restart`
* 作用:任务(命令)定时调度(如:定时备份，实时备份)   
* 简要说明:`cat /etc/crontab`

- 格式说明
![](/resource/airflow/assets/B5D6699F-6501-4529-B29A-563D7730E100.png)
  在以上各个字段中，还可以使用以下特殊字符:  
  * 代表所有的取值范围内的数字。如月份字段为*，则表示1到12个月;  
  / 代表每一定时间间隔的意思。如分钟字段为*/10，表示每10分钟执行1次;  
  - 代表从某个区间范围，是闭区间。如2-5表示2,3,4,5，小时字段中0-23/2表示在 0~23点范围内每2个小时执行一次;  
  , 分散的数字(不连续)。如1,2,3,4,7,9;   
    
  注:由于各个地方每周第一天不一样，因此Sunday=0(第1天)或Sunday=7(最后1天)。

- crontab配置实例

  ```shell  
  # 每一分钟执行一次command(因cron默认每1分钟扫描一次，因此全为*即可)   
  *	 *	 *	 *	 *	command  
  # 每小时的第3和第15分钟执行command   
  3,15 	* 	* 	* 	*	 command  
  # 每天上午8-11点的第3和15分钟执行command   
  3,15	8-11 	* 	* 	* 	command  
    
  # 每隔2天的上午8-11点的第3和15分钟执行command  
  3,15	8-11	*/2	*	*	command  
    
  # 每个星期一的上午8点到11点的第3和第15分钟执行command  
  3,15	8-11	 *	 *	 1	command  
    
  # 每晚的21:30执行command   
  30	21	*	*	*	command   
    
  # 每月1、10、22日的4:45执行command  
  45	4	1,10,22	*	* 	command  
    
  # 每周六、周日的1 : 10执行command  
  10 	1 	* 	* 	6,0 	command  
    
  # 每小时执行command   
  0	*/1 	* 	* 	*	command   
    
  # 晚上11点到早上7点之间，每隔一小时执行command  
  * 	23-7/1 	* 	*	 *	 command  
  ```

## 任务集成部署

### Airflow核心概念

- DAGs
  有向无环图(Directed Acyclic Graph)，将所有需要运行的tasks按照依赖 关系组织起来，描述的是所有tasks执行的顺序;

- Operators
  Airflow内置了很多operators

	- BashOperator

	- PythonOperator

	- EmailOperator

	- HTTPOperator

	- SqlOperator

	- 自定义Operator

- Tasks
  Task 是 Operator的一个实例;

- Task Instance
  由于Task会被重复调度，每次task的运行就是不同的 Task instance。Task instance 有自己的状态，包括 success 、 running 、 failed 、 skipped 、 up_for_reschedule 、 up_for_retry 、 queued 、 no_status 等;

- Task Relationships
  DAGs中的不同Tasks之间可以有依赖关系;

- 执行器(Executor)
  Airflow支持的执行器就有四种.  
    
  执行器的修改。修改 $AIRFLOW_HOME/airflow.cfg 第 70行: `executor = LocalExecutor`。修改后启动服务

	- SequentialExecutor
	  单进程顺序执行任务，默认执行器，通常只用于测试

	- LocalExecutor
	  多进程本地执行任务

	- CeleryExecutor
	  分布式调度，生产常用。Celery是一个分布式调度框架， 其本身无队列功能，需要使用第三方组件，如RabbitMQ

	- DaskExecutor
	  动态任务调度，主要用于数据分析

### 入门案例

放置在 $AIRFLOW_HOME/dags 目录下  
```python  
from datetime import datetime, timedelta  
from airflow import DAG  
from airflow.utils import dates  
from airflow.utils.helpers import chain  
from airflow.operators.bash_operator import BashOperator  
from airflow.operators.python_operator import PythonOperator  
  
  
def default_options():  
    default_args = {  
        'owner': 'airflow',  
        'start_date': dates.days_ago(1),  
        'retries': 1,  
        'retry_delay': timedelta(seconds=5)  
    }  
    return default_args  
  
# 定义DAG  
def task1(dag):  
    t = "pwd"  
    # operator支持多种类型，这里使用 BashOperator  
    task = BashOperator(  
        task_id='MyTask1',  
        bash_command=t,  
        dag=dag  
    )  
    return task  
  
  
def hello_world():  
    current_time = str(datetime.today())  
    print('hello world at {}'.format(current_time))  
  
  
def task2(dag):  
    # Python Operator  
    task = PythonOperator(  
        task_id='MyTask2',  
        python_callable=hello_world,  
        dag=dag  
    )  
    return task  
  
  
def task3(dag):  
    t = "date"  
    task = BashOperator(  
        task_id='MyTask3',  
        bash_command=t,  
        dag=dag  
    )  
    return task  
  
  
with DAG(  
        'HelloWorldDag',  
        default_args=default_options(),  
        schedule_interval="*/2 * * * *"  
) as d:  
    task1 = task1(d)  
    task2 = task2(d)  
    task3 = task3(d)  
    chain(task1, task2, task3)  
  
```

- 常用指令
  ```shell  
  # 执行命令检查脚本是否有错误。如果命令行没有报错，就表示没问题   
  python $AIRFLOW_HOME/dags/helloworld.py  
    
  # 查看生效的 dags  
  airflow list_dags -sd $AIRFLOW_HOME/dags  
    
  # 查看指定dag中的task  
  airflow list_tasks HelloWorldDag  
    
  # 查看任务依赖关系  
  airflow list_tasks HelloWorldDag --tree  
    
  # 测试dag中的task  
  airflow test HelloWorldDag MyTask2 20200801  
  ```

