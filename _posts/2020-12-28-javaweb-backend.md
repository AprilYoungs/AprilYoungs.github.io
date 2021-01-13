---
layout: post
title:  "tomcat及其实践"
date:   2020-12-28
categories: java web
---

## tomcat

常用的web服务器

### JavaEE规范

在Java中所有的服务器厂商都要实现一组Oracle公司规定的接口，这些接口是称为JavaEE规范。不同 厂商的JavaWeb服务器都实现了这些接口，在JavaEE中一共有13种规范。实现的规范越多，功能越强。

### 启动时端口被占用的问题

- 杀进程
  ```  
  sudo lsof -nP -i4TCP:$PORT | grep LISTEN  
  ```

- 改配置文件的端口
  进入Tomcat安装目录/conf/server.xml   
    
  修改相关port

### 发布项目的三种方式

- 直接放置在 webapps 目录下

- server.xml部署
  ```xml  
   <Host name="localhost"  appBase="webapps"  
              unpackWARs="true" autoDeploy="true">  
              <!-- 添加一个子项目地址 -->  
  Path: 访问路径  
  docBase：本地文件路径  
              <Context path='aapp' docBase="/Users/april/Desktop/myapp"/>  
    
  ```

- 独立xml部署
  在tomcat/conf/Catalina/localhost 目录下创建一个xml文件，添加标签  
  path.xml  
  ```  
  <Context docBase="/Users/april/Desktop/myapp"/>  
  ```  
  Xml文件名既路径名

## Web三大组件

### Servlet协议

* servlet= server+applet :运行在服务器端的java程序。   
* Servlet是一个接口，一个类要想通过浏览器被访问到,那么这个类就必须直接或间接的实现Servlet 接口

- 编写servlet的流程

	- 1. 创建web项目，配置tomcat

	- 2. 编写java类，实现servlet接口， 或继承GenericServlet，HttpServlet
	  实现servlet的5个方法，主要是  
	  ```  
	  public void service(javax.servlet.ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {  
	  ```  
	  开发中主要是通过继承HttpServlet的方式  
	  直接重写doGet，doPost方法就行，生命周期的方法（init， destroy），需要就重写

	- 3. 在web.xml配置url-pattern
	  每添加一个接口都需要配置  

	  ```xml  
	  <servlet>  
	      <servlet-name>QuickServlet</servlet-name>  
	  类的全名  
	      <servlet-class>com.lagou.servlet.QuickServlet</servlet-class>  
	  </servlet>  
	    
	  配置地址  
	  <servlet-mapping>  
	      <servlet-name>QuickServlet</servlet-name>  
	  链接名必须以 / 开头  
	      <url-pattern>/quickservlet</url-pattern>  
	  <!--        如果服务器希望启动的时候就初始化servlet，添加这个字段，-1是默认项，1-3被占用，一般写4-->  
	          <load-on-startup>4</load-on-startup>  
	  </servlet-mapping>  
	    
	  一个接口可以配置多个链接  
	  <servlet-mapping>  
	      <servlet-name>QuickServlet</servlet-name>  
	      <url-pattern>/quickservlet2</url-pattern>  
	  </servlet-mapping>  
	    
	  还可以使用模糊地址  
	  /aa/*  
	  *.do  
	    
	  ```

	- 3. 或者在类名前面添加注解@WebServlet
	  @WebServlet(“/quickservlet”)

	- 4. 部署web项目

- Servlet生命周期

	- public void init(ServletConfig servletConfig);
	  如果在web.xml 中配置了`load-on-startup`就随着服务器启动调用，不然就第一个被访问的时候调用

	- public void service(ServletRequest servletRequest, ServletResponse servletResponse);
	  接口被访问的时候调用

	- public void destroy();
	  服务器正常关闭时，销毁servlet，执行destroy方法

	- 笔试题
	  请描述下servlet的生命周期？  
	  >答案:servlet是一个单实例多线程的，默认情况下，第一次请求来的时候，才会对该servlet进行实例化，并执行初始化init方法，随后再执行service方法完成业务处理，当每一次请求发送过来，都会从新 开启一个线程，来执行servlet中的service方法，当服务器关闭或者servlet被移除的时候，会执行 destory方法

- 相对地址的写法

	- servlet路径

	- /项目名/servlet路径

- Request对象
  * 用户通过浏览器访问服务器时，Tomcat将HTTP请求中所有的信息都封装在Request对象中   
  * 作用:开发人员可以通过request对象方法，来获取浏览器发送的所有信息.

	- 获取请求行信息
	  ```  
	  GET  /servlet_demo/requestDemo1 HTTP/1.1  
	  ```

		- String getMethod()
		  获取请求方式 GET

		- String getContextPath()
		  获取项目虚拟路径

		- StringBuffer getRequestURL()
		  全链接地址

		- String getProtocol()
		  HTTP/1.1

		- String getRemoteAddr()
		  获取客户端ip

	- 获取请求头信息

		- String getHeader(String name)
		  获取知道请求头名称对应的值

		- Enumeration<String> getHeaderNames()
		  获取所有请求头的名称

	-  获取请求体信息

		- String getParameter(String name)
		  获取指定参数名的值

		- String[] getParameterValues(String name)
		  获取指定参数名的值数组

		- Map<String,String[]> getParameterMap()
		  获取所有参数名和对应值数组

		- 中文乱码问题
		  Post请求的时候，服务器默认的编码是ISO-8859-1, 而浏览器默认编码是UTF-8，所有post的请求体可以出现乱码。  
		  解决方案，在开始解析请求体之前设置编码格式  
		  ```  
		  // 设置请求体解码方式  
		  req.setCharacterEncoding("utf-8");  
		  ```

	- 请求转发
	  * 一种在服务器内部的资源跳转方式, 只能在同一项目中跳转  
	  * 转发是内部处理方式，浏览器的地址不会变化  
	  * 可以通过域对象传递数据  
	  ```  
	  request.getRequestDispatcher("/bServlet").forward(reqeust,response)  
	  ```

		- Interface RequestDispatcher

			- ServletRequest -> RequestDispatcher getRequestDispatcher(String path)
			  地址同url-pattern中一样

			- void forward(ServletRequest request, ServletResponse response)

		- 域对象
		  * 一个有作用范围的对象，可以在范围内共享数据  
		  * request域:代表一次请求的范围，一般用于一次请求中转发的多个资源中共享数据

			- void setAttribute(String name, Object o)

			- Object getAttribute(String name)

			- void removeAttribute(String name)

			- Request域对象的生命周期
			  1. 何时创建?  
			  > 用户发送请求时，创建request   
			  2. 何时销毁  
			  > 服务器返回响应是，销毁request  
			  3. 作用范围?   
			  > 一次请求，包含多次转发

- Response对象
  * response对象表示web服务器给浏览器返回的响应信息  
  * 作用:开发人员可以使用response对象的方法，设置要返回给浏览器的响应信息

	- 响应行

		- void setStatus(int sc)
		  200 OK  
		  302 重定向  
		  304	资源未更新  
		  404 链接错误，未找到资源  
		  500 服务器内部错误

	- 响应头

		- void setHeader(String name, String value)
		  设置响应头对应的值

		- void setContentType(String var1)
		  contentType：text/html, image/jpeg …. MIME type  
		  常用设置 “text/html;charset=utf-8”

	- 响应体
	  在同一个servlet中，二种类型的输出流不能同时存在，互斥

		- PrintWriter getWriter()
		  字符输出流

		- ServletOutputStream getOutputStream()
		  字节输出流

	- 响应重定向
	  访问A链接，结果返回了B链接的结果，地址发生改变，可以重定向到外部链接

		- 方式一
		  ```java  
		  // 1.设置状态码  
		   response.setStatus(302);  
		  // 2.设置响应头 Location response.setHeader("Location","重定向网络地址");  
		  ```  
		  *地址可以是相对地址，也可以是绝对地址*

		- 方式二
		  ```java  
		  response.sendRedirect("重定向网络地址");  
		  ```

		- 特点
		  1. 地址栏会发生改变  
		  2. 重定向是二次请求  
		  3. 重定向是客户端(浏览器)行为，可以跳转到服务器外部资源...   
		  4. 不能使用request域共享数据

		- 与请求转发的比较
		  1. 哪个对象   
		  	* 转发(request对象的方法)  
		         	*request.getRequestDispatcher("/bServlet").forward(request,response);  
		  	* 重定向(response对象的方法) 	  
		  		* response.sendRedirect("/day10_response/bServlet");  
		  2. 几次请求   
		  	* 转发  
		  		* 地址栏: 没有改变  
		  		* 浏览器: 发了一次请求  
		  		* 服务器: 只有一对请求和响应对象 	  
		  		* 发生的位置: 服务器  
		  	* 重定向  
		  		* 地址栏: 发生了改变  
		  		* 浏览器: 发了两次请求   
		  		* 服务器: 有两对请求和响应对象   
		  		* 发生的位置: 浏览器  
		  3. 小结   
		  	* 写法  
		  		* 转发(“/servlet资源路径“) 服务器内部行为  
		  		* 重定向（“/虚拟路径/servlet资源路径”）浏览器外部行为  
		  	使用场景  
		  		* 如果需要传递数据(request域)，  
		  		* 使用转发 如果不需要传递数据(request域)，使用重定向

	- 中文乱码问题

		- response.setCharacterEncoding("GBK");
		  指定服务器响应编码方式，和浏览器的匹配上，可能会翻车

		- response.setContentType("text/html;charset=utf-8");
		  统一浏览器和服务器编码，推荐写法

- ServletContext
  web容器(tomcat)在启动时，它会为每个web项目承建一个对应的ServletContext对象, 随着生命周期随项目，是servlet的容器，所有servlet都公用一个context，可以通过context交换数据

	- 获取方法

		- request.getServletContext();

		- 在HttpServlet的子类中this.getServletContext();

	- 域对象(共享数据)

		- void setAttribute(String name,Object value)

		- Object getAttribute(String name)

		- void removeAttribute(String name)

	- 获取资源在服务器的真实地址

		- String getRealPath(String path);
		  通过相对地址，获取资源文件（图片等）的绝对地址

	- 获取全局的配置参数

		- String getInitParameter(String var1);
		  在web.xml中存配置参数  
		  ```xml  
		  <context-param>  
		      <param-name>encode</param-name>  
		      <param-value>UTF-8</param-value>  
		  </context-param>  
		  <context-param>  
		      <param-name>user</param-name>  
		      <param-value>APRIL</param-value>  
		  </context-param>  
		    
		  ```  
		  然后就可以读取其中的信息

	- 获取文件MIME类型

		- String getMimeType(String filename);
		  Multipurpose Internet Mail Extensions  
		  在互联网通信过程中定义的一种文件数据类型格式   
		  格式:大类型/小类型 例如:`text/html` 、`image/jpeg`  
		    
		  输入值为文件名加后缀，如`a.jpg`

### filter协议

用来拦截servlet，并做预处理，设置统一编码之类的

- 使用

	- 1. 实现Filter接口的方法

		- init

		- destroy

		- doFilter

	- 2.配置拦截的路径
	  ```xml  
	  <!--注册filter--> <filter>  
	          <filter-name>QuickFilter</filter-name>  
	          <filter-class>com.lagou.a_quick.QuickFilter</filter-class>  
	      </filter>  
	  <!--配置filter拦截路径--> <filter-mapping>  
	          <filter-name>QuickFilter</filter-name>  
	          <url-pattern>/*</url-pattern>  
	      </filter-mapping>  
	  ```  
	    
	  或使用@WebFilter

		- 路径的设置
		  * 精准匹配  
		  	* 用户访问指定目标资源(/show.jsp)时，过滤器进行拦截   
		  * 目录匹配  
		  	* 用户访问指定目录下(/user/*)所有资源时，过滤器进行拦截   
		  * 后缀匹配  
		  	* 用户访问指定后缀名(*.html)的资源时，过滤器进行拦截  
		  * 匹配所有   
		  	* 用户访问该网站所有资源(/*)时，过滤器进行拦截

- 工作原理
  Filter随着tomcat服务器启动而创建，当tomcat收到请求的时候，先遍历filter，是否拦截了该接口，如果是就走filter的方法，filter对请求进行预处理，并在内部决定是否放行，放行的话才会执行对应servlet的方法，不放行到filter这里请求就结束了

- 生命周期
  * 创建  
  	* 服务器启动项目加载，创建filter对象，执行init方法(只执行一次)   
  * 运行(过滤拦截)  
  	* 用户访问被拦截目标资源时，执行doFilter方法  
  * 销毁  
  	* 服务器关闭项目卸载时，销毁filter对象，执行destroy方法(只执行一次)  
  * 补充: 过滤器一定是优先于servlet创建的

- 过滤器链
  * 需求： 用户访问目标资源 /targetServlet时，经过 FilterA FilterB  
  * 过滤器链执行顺序 (先进后出)   
  	1.用户发送请求  
  	2.FilterA拦截，放行   
  	3.FilterB拦截，放行   
  	4.执行目标资源 /targetServlet  
  	5.FilterB增强响应   
  	6.FilterA增强响应   
  	7.封装响应消息格式，返回到浏览器  
  * 过滤器链中执行的先后问题由配置文件决定，谁先声明，谁先执行  
  ```  
              <filter-mapping>  
  ```

### listener协议

监听web三大域对象:HttpServletRequest、HttpSession、ServletContext 通过监听器监听三大域对 象它们的创建和销毁

- 使用ServletContextListenner

	- 1. 实现ServletContextListenner接口协议

	- 2. 注册监听类

	  ```xml  
	  <listener>  
	      <listener-class>com.lagou.listener.MyServletContextListener</listener-class>  
	  </listener>  
	  ```  
	  或使用 @WebListener

- 常用协议类

	- ServletContextListenner
	  监听ServletContext域的创建于销毁的监听器  
	  * 使用：系统启动时初始化配置信息

	- HttpSessionListener
	  监听Httpsession域的创建于销毁的监听器  
	  * 使用：统计在线人数

	- ServletRequestListener
	  监听ServletRequest域的创建于销毁的监听器  
	  使用：统计历史访问次数

## http协议：80

超文本传输协议(HTTP，HyperText Transfer Protocol)是互联网上应用最为广泛的一种网络协议。用于定义WEB浏览器与WEB服务器之间交换数据的过程。

### https:443

### 特点

* 基于请求/响应模型的协议。  
	* 请求和响应必须成对;  
     	* 先有请求后有响应。  
* 简单快捷  
	* 因为发送请求的时候只需要发送请求方式和请求路径即可   
* HTTP协议默认的端口:80  
	* 例如: http://www.lagou.com:80 * 无状态协议  
     	* 多次请求之间相互独立，不能交互数据

### 不同版本

- HTTP/1.0
  发送请求，创建一次连接，获得一个web资源，连接断开。

- HTTP/1.1
  发送请求，创建一次连接，获得多个web资源，连接断开。

### 两种报文格式

- 请求报文
  由客户端向服务器端发出的报文。

	- 请求行
	  请求行格式:请求方式 资源路径 协议/版本   
	  例如:POST /web01/login.html HTTP/1.1   
	  请求行必须在HTTP请求格式的第一行。

	- 请求头
	  描述了客户端向服务器发送请求时使用的http协议类型，所使用的编码，以及发送内容的长 度，referer，等等。

	- 空行

	- 请求体
	  通常情况下，只有post请求方式才会使用到请求体，请求体中都是用户表单提交的数据，每一项数据都使用键 值对key=value，多组值使用&相连。

- 响应报文
  从服务端到客户端的报文。

	- 响应行
	  例如:HTTP/1.1 200 OK   
	  格式:协议/版本 状态码 状态码描述

		- 状态码
		  200 :请求成功。  
		  302 :请求重定向。  
		  304 :请求资源没有改变，访问本地缓存。  
		  404 :请求资源不存在。通常是用户路径编写错误，也可能是服务器资源已删除。   
		  500 :服务器内部错误。通常程序抛异常。

	- 响应头
	  用来描述服务器回给客户端浏览器的content的一些描述，例如: 我是什么服务器，我返回的是 啥编码，我返回的内容有多长等等

	- 空行

	- 响应体
	  返回的数据html，其他json等

## 会话机制

B/S架构中:从浏览器第一次给服务器发送请求时，建立会话;直到有一方断开，会话结束。 一次会话包含多次请求响应。

### cookie

在一次会话的多次请求之间共享数据，将数据保存到客户端(浏览器)，比如缓存购物车，游客行为。  
浏览器就是一个缓存站，第一次请求的时候服务器在返回头中存cookie，后续请求的时候浏览器会讲之前收到的cookie作为请求头提交给服务器

- 返回cookie， set-cookie
  ```java  
  // 1.创建cookie对象，设置数据  
          Cookie cookie = new Cookie(String name,String value);  
  // 2. 通过respnse，返回cookie  
          response.addCookie(cookie);  
  ```

- 获取cookie，cookie
  ```  
  // 1.通过request对象，接收cookie数组  
          Cookie[] cookies = request.getCookies();  
  ```

- 工作原理
  1. 添加：在response中添加cookie就是在响应头以键值对的形式设置set-cookie，格式：`name1=Lisa;name2=Leo`  
  2. 获取：每次浏览器请求的时候都会将对应域名的所有cookie放在请求头cookie中

- 保存时间
  * 默认情况下   
  	* 浏览器关闭(会话结束)，cookie销毁(内存)  
  * 设置cookie的存活时间  
  	* cookie.setMaxAge(int second); -- 单位是秒  
  	* 正数:指定存活时间，持久化浏览器的磁盘中，到期后自动销毁   
  	* 负数:默认浏览器关闭，cookie销毁  
  	* 零:立即销毁(自杀)，用来删除cookie

- 支持中文
  Tomcat8之后支持中文，但是不支持空格 等一些特殊符号  
    
  可以使用URLEncoder，URLDecoder对value进行转码，转码之后就支持所有符号

	- URLEncoder

	- URLDecoder

- cookie特点
  1. cookie存储数据都在客户端(浏览器) 2. cookie的存储数据只能是字符串  
  3. **cookie单个大小不能超过4KB**  
  4. cookie存储的数据不太安全

### session

在一次会话的多次请求之间共享数据，将数据保存到服务器端

- HttpSession
  也是一个域对象

	- HttpServletRequest -> HttpSession getSession();
	  获取session对象

	- void setAttribute(String name,Object value)

	- Object getAttribute(String name)

	- void removeAttribute(String name)

- 工作原理
  Session是基于Cookie技术实现的  
  1. 第一次获取session的时候会创建一个session，这个session有一个编号，当接口返回的时候，它会把session的编号存到cookie中，键值是JSESSIONID。  
  2. 再次获取session的时候如果cookie中携带了JSESSIONID，就会使用之前创建的session

- 生命周期
  * 何时创建   
  	* 用户第一次调用request.getSession()方法时，创建  
  * 何时销毁   
  	* 服务器非正常关闭  
  	* 非活跃状态30分钟后, tomcat进行配置 /tocmat安装目录/conf/web.xml  
  		```xml  
  		<session-config>  
  	        <session-timeout>30</session-timeout>  
  	      </session-config>  
  		```  
  这个默认值可以修改，一般需要修改的时候在项目中的web.xml添加对于字段就可以  
  	* session.invalidate(); 自杀  
  * 作用范围  
   	*一次会话中，多次请求之间  
  注意:每一个浏览器跟服务器都是独立的会话...

## 域对象的比较

###  ServletContext域对象

* 何时创建   
	* 服务器正常启动，项目加载时，创建  
* 何时销毁   
	* 服务器关闭或项目卸载时，销毁  
* 作用范围   
	* 整个web项目(共享数据)

### HttpSession域对象

* 何时创建   
	* 用户第一次调用request.getSession()方法时，创建  
* 何时销毁   
	* 服务器非正常关闭  
	* 未活跃状态30分钟   
	* 自杀  
* 作用范围   
	* 一次会话中，多次请求间(共享数据)

### HttpServletRequest域对象

* 何时创建   
	* 用户发送请求时，创建  
* 何时销毁   
	* 服务器做出响应后，销毁  
* 作用范围   
	* 一次请求中，多次转发间(共享数据)

### 总结

* 能用小的不用大的:request<session<servletContext  
* 使用场景：  
	* request:一次查询的结果(servlet转发jsp)   
	* session:存放当前会话的私有数据  
		* 用户登录状态， 验证码， 购物车  
	* servletContext:若需要所有的servlet都能访问到,才使用这个域对象.

## MVC设计模式

### M:model(模型) JavaBean(1.处理业务逻辑、2.封装实体)

###  V:view(视图) Jsp(展示数据)

### C:controller(控制器)Servlet(1.接收请求、2.调用模型、3.转发视图)

### 进阶：三层设计模式

```
* com.lagou 基本包(公司域名倒写)   
* com.lagou.dao 持久层  
* com.lagou.service 业务层  
* com.lagou.web 表示层  
* com.lagou.domain 实体(JavaBean)   
* com.lagou.util 工具
```

- 表现层：又称为web层，与浏览器进行数据交互(控制器和视图)

- 业务层：又称为service层，处理业务数据(if判断，for循环)，在表现层和持久层中间

- 持久层：又称为dao层，与数据库进行交互的(每一条(行)记录与javaBean实体 对应)

