---
layout: post
title:  "搭建一个JAVA后台"
date:   2020-09-25
categories: network
---
本文会演示如何一步步的搭建一个简单的JAVA后台

### 环境准备
1. JDK：[https://www.oracle.com/java/technologies/javase-downloads.html](https://www.oracle.com/java/technologies/javase-downloads.html)
下载完之后跟着流程点点点就可以了
2. 配置Path、JAVA_HOME(window电脑，mac不需要)
参考：[https://www.bilibili.com/video/BV1G7411F7v4?p=11](https://www.bilibili.com/video/BV1G7411F7v4?p=11) p11~14
3. Tomcat:[https://tomcat.apache.org](https://tomcat.apache.org)
下载之后解压到对应文件夹就可以. 打开 根目录下面的 bin文件夹，可以找到 `startup.bat`, `startup.sh`,windows用户点击`startup.bat`可以启动tomcat, mac 用户在terminal中运行 `./startup.sh `.如果环境安装没问题的话，可以正常启动tomcat. terminal会返回如下信息
```sh
$ ./startup.sh
Using CATALINA_BASE:   /Users/april/Java/apache-tomcat-9.0.34
Using CATALINA_HOME:   /Users/april/Java/apache-tomcat-9.0.34
Using CATALINA_TMPDIR: /Users/april/Java/apache-tomcat-9.0.34/temp
Using JRE_HOME:        /Library/Java/JavaVirtualMachines/jdk1.8.0_241.jdk/Contents/Home
Using CLASSPATH:       /Users/april/Java/apache-tomcat-9.0.34/bin/bootstrap.jar:/Users/april/Java/apache-tomcat-9.0.34/bin/tomcat-juli.jar
Tomcat started.
```
然后在浏览器中输入[http://localhost:8080](http://localhost:8080),就可以看到tomcat的主页
![](/resource/java_backend/tomcat_home.png)
4. IntelliJ IDEA Ultimate: [https://www.jetbrains.com/idea/download/](https://www.jetbrains.com/idea/download/) 
需要使用Ultimate版，可以选择试用一个月

### 开始搭建JAVA后台
1. 创建项目
打开intelliJ, 新建一个空白项目<br>
![](/resource/java_backend/create_project1.png)<br>
完成之后会自动弹出项目配置，新建模块， 选择JAVE->确实SDK版本，选择JAVE EE-》Web Application
<br>![](/resource/java_backend/create_project3.png)<br>
完成之后应该可以看到如下目录
<br>![](/resource/java_backend/create_project2.png)<br>
在src下面新建一个class，然后点击运行，如果一起环境就绪的话，就可以打印出`Hello World!`
<br>![](/resource/java_backend/create_project4.png)<br>
但是现在这个项目还在本地运行，我们需要把它变成服务器，所以需要试用tomcat部署这个项目
<br>

2. 部署项目
点击Main会弹出菜单，选择Edit Configuration
<br>![](/resource/java_backend/deploy1.png)<br>
添加新的配置，选择tomcat->local
<br>![](/resource/java_backend/deploy2.png)<br>
重命名这个配置，不然就是unnamed. 其他都是用默认参数就可以，点击右下角的fix,然后，Apply，OK.
<br>![](/resource/java_backend/deploy3.png)<br>
再次点击运行，应该可以会自动弹出一个网页，说明我们的项目已经成功部署到本地服务器，可以局域网访问。
<br>![](/resource/java_backend/deploy4.png)<br>
可以把`localhost`改成 `127.0.0.1`, 或者本机在局域网的ip地址，局域网内的其他机器可以通过ip访问我们部署的网页。
在web下面新建H5，然后就重新部署，就访问新部署的网页了
<br>![](/resource/java_backend/deploy5.png)<br>

3. 处理网络请求
先部署一个简单的表单网页
<br>![](/resource/java_backend/deploy6.png)<br>
点击右上角的按钮，展开项目结构
<br>![](/resource/java_backend/deploy7.png)<br>
添加libarary
<br>![](/resource/java_backend/deploy8.png)<br>
选择tomcat
<br>![](/resource/java_backend/deploy10.png)<br>
添加成功之后，可以在左边菜单栏看到一个tomcat的包
<br>![](/resource/java_backend/deploy9.png)<br>
添加一个处理网络请求的类
<br>![](/resource/java_backend/deploy11.png)<br>
表单添加action，`/helloagain/login`, `helloagain`是我们这个服务的根路径，`login`是下面的一个请求，后面会处理。请求方式为`get`
<br>![](/resource/java_backend/deploy12.png)<br>
写服务器代码，把get的请求转到post一起处理， post里边读取参数，并返回结果
<br>![](/resource/java_backend/deploy13.png)<br>