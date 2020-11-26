---
layout: post
title:  "JAVA 常用核心类库(下)"
date:   2020-11-26
categories: java se
---
# 常用核心类库(下)


## lang

### Throwable

java.lang.Throwable类是Java语言中错误(Error)和异常(Exception)的超类

- Error
  Error类主要用于描述Java虚拟机无法解决的严重错误，通常无法编码解决，如:JVM挂掉了 等。 

- Exception
  * Exception类主要用于描述因编程错误或偶然外在因素导致的轻微错误，通常可以编码解决， 如:0作为除数等  
    
  * Java采用的异常处理机制是将异常处理的程序代码集中在一起，与正常的程序代码分开，使得程序 简洁、优雅，并易于维护

	- RuntimeException
	  * 运行时异常，也叫作非检测性异常  
	  * ⚠️注意: 当程序执行过程中发生异常但又没有手动处理时，则由Java虚拟机采用默认方式处理异常，而默认 处理方式就是:打印异常的名称、异常发生的原因、异常发生的位置以及终止程序

		- ArithmeticException

		- ArrayIndexOutOfBoundsException

		- NullPointerException

		- ClassCastException

		- NumberFormatException

		- 异常的避免
		  * 在以后的开发中尽量使用if条件判断来避免异常的发生。  
		  * 但是过多的if条件判断会导致程序的代码加长、臃肿，可读性差。

	- OtherException
	  IOException和其它异常 - 其它异常，也叫作检测性异常，所谓检测性异常就是指在编译阶段都能 被编译器检测出来的异常。

		- 异常的捕获
		  * 语法格式  
		  ```java  
		  try { 编写可能发生异常的代码;  
		  }  
		  catch(异常类型 引用变量名) {  
		     编写针对该类异常的处理代码;  
		  }  
		  ... finally {  
		     编写无论是否发生异常都要执行的代码;  
		    }  
		  ```  
		    
		  * 注意事项 a.当需要编写多个catch分支时，切记小类型应该放在大类型的前面; b.懒人的写法:  
		  catch(Exception e) {} c.finally通常用于进行善后处理，如:关闭已经打开的文件等。  
		    
		  * 执行流程

		  ```java  
		  try {  
		  a;  
		  b; - 可能发生异常的语句 c;  
		  }catch(Exception ex) { d;  
		  }finally { e;  
		  }  
		  当没有发生异常时的执行流程:a b c e;  
		  当发生异常时的执行流程:a b d e;  
		  ```

			- finally笔试考点
			  ```java  
			  static int test() {  
			      try {  
			          int[] arr = new int[5];  
			          System.out.println(arr[5]);  
			          return 0;  
			      } catch (ArrayIndexOutOfBoundsException e) {  
			          e.printStackTrace();  
			          // 因为finally里边的代码必须执行， 所以遇到return时，会转到finally里边，然后遇到就结束了，直接返回2，而不是1  
			          return 1;  
			      } finally {  
			          return 2;  
			      }  
			  }  
			  ```  
			  上面代码的返回结果是*2*

		- 异常的抛出
		  在main函数中不建议抛出异常

			- 基本概念
			  在某些特殊情况下有些异常不能处理或者不便于处理时，就可以将该异常转移给该方法的调用者，这种方法就叫异常的抛出。当方法执行时出现异常，则底层生成一个异常类对象抛出，此时异常代码后续的代码就不再执行。

			- 语法格式
			  访问权限 返回值类型 方法名称(形参列表) throws 异常类型1,异常类型2,...{ 方法体; }   
			  如:  
			  public void show() throws IOException{}

			- 方法重写的原则
			  * 重写原则：  
			  a.要求方法名相同、参数列表相同以及返回值类型相同，从jdk1.5开始支持返回子类类型;   
			  b.要求方法的访问权限不能变小，可以相同或者变大;  
			  c.要求方法不能抛出更大的异常;  
			    
			  * ⚠️注意:  
			    子类重写的方法不能抛出更大的异常、不能抛出平级不一样的异常，但可以抛出一样的异常、更小的异常以及不抛出异常。  
			    
			  * 经验分享：  
			  	* 若父类中被重写的方法没有抛出异常时，则子类中重写的方法只能进行异常的捕获处理。  
			       * 若一个方法内部又以递进方式分别调用了好几个其它方法，则建议这些方法内可以使用抛出的方法处理到最后一层进行捕获方式处理。

	- 自定义异常
	  当需要在程序中表达年龄不合理的情况时，而Java官方又没有提供这种针对性的异常，此时就需要 程序员自定义异常加以描述

		- 实现流程
		  a.自定义xxxException异常类继承Exception类或者其子类。   
		  b.提供两个版本的构造方法，一个是无参构造方法，另外一个是字符串作为参数的构造方法。

### Thread

- 多线程
  多线程是采用时间片轮转法来保证多个线程的并发执行，所谓并发就是指宏观并行微观串行的机  
    制

	- 执行流程
	  * 执行main方法的线程叫做主线程，执行run方法的线程叫做新线程/子线程。   
	  * main方法是程序的入口，对于start方法之前的代码来说，由主线程执行一次，当start方法调用成 功后线程的个数由1个变成了2个，新启动的线程去执行run方法的代码，主线程继续向下执行，两 个线程各自独立运行互不影响。   
	  * 当run方法执行完毕后子线程结束，当main方法执行完毕后主线程结束。  
	  * 两个线程执行没有明确的先后执行次序，由操作系统调度算法来决定。

	- 线程的创建
	  * 自定义类继承Thread类并重写run方法，然后创建该类的对象调用start方法。  
	  * 自定义类实现Runnable接口并重写run方法，创建该类的对象作为实参来构造Thread类型的对 象，然后使用Thread类型的对象调用start方法。

		- 使用继承Thread的类

		- 使用实现Runnable的类作为target

		- 使用FutureTask启动有返回值的任务

			- Callable接口
			  从Java5开始新增加创建线程的第三种方式为实现java.util.concurrent.Callable接口

				- V call()
				  计算结果并返回

			- FutureTask类
			  java.util.concurrent.FutureTask类用于描述可取消的异步计算，该类提供了Future接口的基本实 现，包括启动和取消计算、查询计算是否完成以及检索计算结果的方法，也可以用于获取方法调用 后的返回结果。

				- FutureTask(Callable callable)
				  根据参数指定的引用来创建一个未来任务

				- V get()
				  获取call方法计算的结果，必须在线程启动之后才能调用

		- 线程池
		  * 线程池的概念:首先创建一些线程，它们的集合称为线程池，当服务器接受到一个客户请求后，就从线程池中取出一个空闲的线程为之服务，服务完后不关闭该线程，而是将该线程还回到线程池中。  
		  * 在线程池的编程模式下，任务是提交给整个线程池，而不是直接交给某个线程，线程池在拿到任务后，它就在内部找有无空闲的线程，再把任务交给内部某个空闲的线程，任务是提交给整个线程池，一个线程同时只能执行一个任务，但可以同时向一个线程池提交多个任务。

			- Executors
			  从Java5开始提供了线程池的相关类和接口:java.util.concurrent.Executors类

				- static ExecutorService newCachedThreadPool()
				  创建一个可根据需要创建新线程的  
				  线程池

				- static ExecutorService newFixedThreadPool(int  nThreads)
				  创建一个可重用固定线程数的线程池

				- static ExecutorService newSingleThreadExecutor()
				  创建一个只有一个线程的线程池

			- ExecutorService
			  从Java5开始提供了线程池  
			  java.util.concurrent.ExecutorService接口

				- void execute(Runnable command)
				  执行任务和命令，通常用于执行Runnable

				- Future submit(Callable task)
				  执行任务和命令，通常用于执行Callable

				- void shutdown()
				  启动有序关闭

	- 生命周期
	  * 新建状态 - 使用new关键字创建之后进入的状态，此时线程并没有开始执行。	 * 就绪状态 - 调用start方法后进入的状态，此时线程还是没有开始执行。 * 运行状态 - 使用线程调度器调用该线程后进入的状态，此时线程开始执行，当线程的时间片执行完 毕后任务没有完成时回到就绪状态。	  
	  * 消亡状态 - 当线程的任务执行完成后进入的状态，此时线程已经终止。	  
	  * 阻塞状态 - 当线程执行的过程中发生了阻塞事件进入的状态，如:sleep方法。 阻塞状态解除后进入就绪状态。  

	- 线程同步机制
	  * 当多个线程同时访问同一种共享资源时，可能会造成数据的覆盖等不一致性问题，此时就需要对线 程之间进行通信和协调，该机制就叫做线程的同步机制。   
	  * 多个线程并发读写同一个临界资源时会发生线程并发安全问题。   
	  * 异步操作:多线程并发的操作，各自独立运行。  
	  * 同步操作:多线程串行的操作，先后执行的顺序。

		- synchronized
		  * 在Java语言中使用synchronized关键字来实现同步/对象锁机制从而保证线程执行的原子性，具体 方式如下:  
		     
		  * 使用同步代码块的方式实现部分代码的锁定，格式如下:   
		  ```java  
		  synchronized(类类型的引用) {  
		       编写所有需要锁定的代码;  
		  }  
		  ```  
		    
		  * 使用同步方法的方式实现所有代码的锁定。 直接使用synchronized关键字来修饰整个方法即可 该方式等价于:  
		  synchronized(this) { 整个方法体的代码 }

			- 静态方法的锁定
			  * 当我们对一个静态方法加锁，如:  
			  `public synchronized static void xxx(){….}`  
			  * 那么该方法锁的对象是类对象。每个类都有唯一的一个类对象。获取类对象的方式:类名.class。   
			  * 静态方法与非静态方法同时使用了synchronized后它们之间是非互斥关系的。 原因在于:静态方法锁的是类对象而非静态方法锁的是当前方法所属对象。

			- 注意事项
			  * 多个需要同步的线程在访问同步块时，看到的应该是同一个锁对象引用。  
			  *  在使用同步块时应当尽量减少同步范围以提高并发的执行效率。

		- 线程安全与不安全
		  * StringBuffer类是线程安全的类，但StringBuilder类不是线程安全的类。  
		  * Vector类和 Hashtable类是线程安全的类，但ArrayList类和HashMap类不是线程安全的类。   
		  * Collections.synchronizedList() 和 Collections.synchronizedMap()等方法实现安全。

		- 死锁
		  ```java  
		  // 线程一执行的代码:  
		  public void run(){  
		  synchronized(a){ //持有对象锁a，等待对象锁b  
		  synchronized(b){ 编写锁定的代码;  
		  } }  
		  }  
		  // 线程二执行的代码:  
		  public void run(){  
		  synchronized(b){ //持有对象锁b，等待对象锁a  
		  synchronized(a){ 编写锁定的代码;  
		  } }  
		  }  
		  ```  
		    注意:  
		    在以后的开发中尽量减少同步的资源，减少同步代码块的嵌套结构的使用!

		- ReentrantLock
		  * 从Java5开始提供了更强大的线程同步机制—使用显式定义的同步锁对象来实现  
		  * java.util.concurrent.locks.Lock接口是控制多个线程对共享资源进行访问的工具。  
		  * 该接口的主要实现类是ReentrantLock类，该类拥有与synchronized相同的并发性，在以后的线程 安全控制中，经常使用ReentrantLock类显式加锁和释放锁。  
		    
		  * 与synchronized方式的比较  
		  	* Lock是显式锁，需要手动实现开启和关闭操作，而synchronized是隐式锁，执行锁定代码后自动 释放。  
		  	* Lock只有同步代码块方式的锁，而synchronized有同步代码块方式和同步方法两种锁。   
		  	* 使用Lock锁方式时，Java虚拟机将花费较少的时间来调度线程，因此性能更好。

			- ReentrantLock()

			- void lock()

			- void unlock()

		- Object
		  这些方法都只能在synchronized里边使用，用于不同线程间通信

			- void wait()
			  用于使得线程进入等待状态，直到其它线程调用notify()或notifyAll()方 法

			- void wait(long timeout)
			  用于进入等待状态，直到其它线程调用方法或参数指定的毫秒数已经过去为止

			- void notify()
			  用于唤醒等待的单个线程

			- void notifyAll()
			  用于唤醒等待的所有线程

- Thread()
  使用无参的方式构造对象

- Thread(String name)
  根据参数指定的名称来构造对象

- Thread(Runnable target)
  根据参数指定的引用来构造对象，其中Runnable是个接口类 型

- Thread(Runnable target, String name)
  根据参数指定引用和名称来构造对象

- void run()
  若使用Runnable引用构造了线程对象，调用该方法时最终调 用接口中的版本 若没有使用Runnable引用构造线程对象，调用该方法时则啥 也不做

- void start()
  用于启动线程，Java虚拟机会自动调用该线程的run方法

- long getId()
  获取调用对象所表示线程的编号

- String getName()
  获取调用对象所表示线程的名称

- void setName(String name)
  设置/修改线程的名称为参数指定的数值

- static Thread currentThread()
  获取当前正在执行线程的引用

- static void yield()
  当前线程让出处理器(离开Running状态)，使当前线程进入Runnable 状态等待

- static void sleep(times)
  使当前线程从 Running 放弃处理器进入Block状态, 休眠times毫秒, 再返 回到Runnable如果其他线程打断当前线程的Block(sleep), 就会发生 InterruptedException

- int getPriority()
  获取线程的优先级

- void setPriority(int newPriority)
  修改线程的优先级。  
  优先级越高的线程不一定先执行，但该线程获取到时间片的机会会更多一些

- void join()
  等待调用线程终止之后， 再继续执行当前上下文的代码

- boolean isDaemon()
  用于判断是否为守护线程

- void setDaemon(boolean on)
  用于设置线程为守护线程  
  1. 必须在线程开始执行前调用  
  2. 如果当前运行的线程全是守护线程，JVM会退出程序，守护线程不被JVM保护

### Class

* java.lang.Class类的实例可以用于描述Java应用程序中的类和接口，也就是一种数据类型。  
* 该类没有公共构造方法，该类的实例由Java虚拟机和类加载器自动构造完成，本质上就是加载到内存中的运行时类。

- 获取Class对象的方式

	- 数据类型.class
	  使用数据类型.class的方式可以获取对应类型的Class对象(掌握)

	- 引用/对象.getClass()
	  使用引用/对象.getClass()的方式可以获取对应类型的Class对象

	- 包装类.TYPE
	  使用包装类.TYPE的方式可以获取对应基本数据类型的Class对象

	- Class.forName()
	  使用Class.forName()的方式来获取参数指定类型的Class对象(掌握)  
	  > 传入的name应该是完整的名称，包括包名，可以用getName() 获得

	- 类加载器ClassLoader
	  使用类加载器ClassLoader的方式获取指定类型的Class对象  
	  ```java  
	  // 使用已加载到内存的类  
	  ClassLoader classLoader = ClassTest.class.getClassLoader();  
	  System.out.println("classLoader->" + classLoader);  
	  c1 = classLoader.loadClass("java.lang.String");  
	  ```

- static Class<?> forName(String className)
  用于获取参数指定类型对应的Class对象并返回

- T newInstance()
  用于创建该Class对象所表示类的新实例  
  > java9已过时

- Constructor getConstructor(Class<?>... parameterTypes)
  用于获取此Class对象所表示类型中参数指定的公共构造方法

- Constructor<?>[] getConstructors()
  用于获取此Class对象所表示类型中所有的公共 构造方法

- Field getDeclaredField(String name)
  用于获取此Class对象所表示类中参数指定的单个成员信息

- Field[] getDeclaredFields()
  用于获取此Class对象所表示类中所有成员变量信息

- Method getMethod(String name, Class<?>... parameterTypes)
  用于获取该Class对象表示类中名字为name参数为 parameterTypes的指定公共成员方法

- Method[] getMethods()
  用于获取该Class对象表示类中所有公共成员方法

- Package getPackage()
  获取所在的包信息

- Class<? super T> getSuperclass()
  获取继承的父类信息

- Class<?>[] getInterfaces()
  获取实现的所有接口

- Annotation[] getAnnotations()
  获取注解信息

- Type[] getGenericInterfaces()
  获取泛型信息

### reflect

- Constructor
  java.lang.reflect.Constructor类主要用于描述获取到的构造方法信息

	- T newInstance(Object... initargs)
	  使用此Constructor对象描述的构造方法来构造Class对象代表类 型的新实例

	- int getModifiers()
	  获取方法的访问修饰符  
	  1. 代表public  
	  [modifiers](https://docs.oracle.com/javase/8/docs/api/constant-values.html#java.lang.reflect.Modifier.PUBLIChttps://docs.oracle.com/javase/8/docs/api/constant-values.html#java.lang.reflect.Modifier.PUBLIC)

	- String getName()
	  获取方法的名称

	- Class<?>[] getParameterTypes()
	  获取方法所有参数的类型

- Field
  java.lang.reflect.Field类主要用于描述获取到的单个成员变量信息

	- Object get(Object obj)
	  获取参数对象obj中此Field对象所表示成员变量的数值

	- void set(Object obj, Object value)
	  将参数对象obj中此Field对象表示成员变量的数值修改为参数value的数值

	- void setAccessible(boolean flag)
	  当实参传递true时，则反射对象在使用时应该取消 Java 语言访 问检查

	- int getModifiers()
	  获取成员变量的访问修饰符

	- Class<?> getType()
	  获取成员变量的数据类型

	- String getName()
	  获取成员变量的名称

- Method
  java.lang.reflect.Method类主要用于描述获取到的单个成员方法信息

	- Object invoke(Object obj, Object... args)
	  使用对象obj来调用此Method对象所表示的成员方法，实 参传递args

	- int getModifiers()
	  获取方法的访问修饰符

	- Class<?> getReturnType()
	  获取方法的返回值类型

	- String getName()
	  获取方法的名称

	- Class<?>[] getParameterTypes()
	  获取方法所有参数的类型

	- Class<?>[] getExceptionTypes()
	  获取方法的异常信息

## io

### File

java.io.File类主要用于描述文件或目录路径的抽象表示信息，可以获取文件或目录的特征信息,  
如:大小等

- File(String pathname)
  根据参数指定的路径名来构造对象

- File(String parent, String child)
  根据参数指定的父路径和子路径信息构造对象

- File(File parent, String child)
  根据参数指定的父抽象路径和子路径信息构造对象

- boolean exists()
  测试此抽象路径名表示的文件或目录是否存在

- String getName()
  用于获取文件的名称

- long length()
  返回由此抽象路径名表示的文件的长度

- long lastModified()
  用于获取文件的最后一次修改时间

- String getAbsolutePath()
  用于获取绝对路径信息

- boolean delete()
  用于删除文件，当删除目录时要求是空目录

- boolean createNewFile()
  用于创建新的空文件

- boolean mkdir()
  用于创建目录

- boolean mkdirs()
  用于创建多级目录

- File[] listFiles()
  获取该目录下的所有内容

- boolean isFile()
  判断是否为文件

- boolean isDirectory()
  判断是否为目录

- File[] listFiles(FileFilter filter)
  获取目录下满足筛选器的所有内容

### 基本分类

- 基本单位不同

	- 字节流
	  主要指以字节为单位进行数据读写的流，可以读写任意类型的文件

	- 字符流
	  主要指以字符(2个字节)为单位进行数据读写的流，只能读写文本文件

- 读写数据的方向不同

	- 输入流
	  主要指从文件中读取数据内容输入到程序中，也就是读文件

	- 输出流
	  主要指将程序中的数据内容输出到文件中，也就是写文件

- 流的角色不同

	- 节点流
	  主要指直接和输入输出源对接的流

	- 处理流
	  主要指需要建立在节点流的基础之上的流

### io流

* IO就是Input和Output的简写，也就是输入和输出的含义。   
* IO流就是指读写数据时像流水一样从一端流到另外一端，因此得名为“流"。

- Writer

	- OutputStreamWriter
	  java.io.OutputStreamWriter类主要用于实现从字符流到字节流的转换

		- FileWriter
		  java.io.FileWriter类主要用于将文本内容写入到文本文件  
		  * 一个方便的创建文件的类，使用的写入方法都是父类实现的

			- FileWriter(String fileName)
			  根据参数指定的文件名构造对象

			- FileWriter(String fileName, boolean append)
			  以追加的方式根据参数指定的文件名来构造对象

		- void write(int c)
		  写入单个字符

		- void write(char[] cbuf, int off, int len)

		- void write(char[] cbuf)

		- void flush()
		  刷新流

		- void close()

	- BufferedWriter

		- BufferedWriter(Writer out)
		  根据参数指定的引用来构造对象

		- BufferedWriter(Writer out, int sz)
		  根据参数指定的引用和缓冲区大小来构造对象

		- void write(String s, int off, int len)
		  将参数s中下标从off开始的len个字符写入输出流中

		- void write(String str)
		  将参数指定的字符串内容写入输出流中

		- void newLine()
		  用于写入行分隔符到输出流中

	- PrintWriter
	  java.io.PrintWriter类主要用于将对象的格式化形式打印到文本输出流

		- PrintWriter(Writer out)

		- void print(String s)

		- void println(String x)

		- void flush()

		- void close()

- Reader

	- InputStreamReader

		- FileReader
		  java.io.FileReader类主要用于从文本文件读取文本数据内容  
		    
		  * 一个方便的获取输入流的类，使用的读取方法都是父类实现的

			- FileReader(String fileName)

		- int read()

		- int read(char[] cbuf, int offset, int length)

		- int read(char[] cbuf)

		- void close()

	- BufferedReader
	  java.io.BufferedReader类用于从输入流中读取单个字符、字符数组以及字符串

		- BufferedReader(Reader in)
		  根据参数指定的引用来构造对象

		- BufferedReader(Reader in, int sz)
		  根据参数指定的引用和缓冲区大小来构造对象

		- String readLine()
		  读取一行字符串并返回，返回null表示读取到末尾

- OutputStream

	- FileOutputStream
	  java.io.FileOutputStream类主要用于将图像数据之类的原始字节流写入到输出流中

		- FileOutputStream(String name)

		- FileOutputStream(String name, boolean append)

		- void write(int b)

		- void write(byte[] b, int off, int len)

		- void write(byte[] b)

		- void flush()

		- void close()

		- BufferedOutputStream
		  * java.io.BufferedOutputStream类主要用于描述缓冲输出流，此时不用为写入的每个字节调用底层系统  
		    
		  * 内部有一个缓冲区，用来缓存需要写入到文件的数据，当攒到缓冲区满了才一次性写入到文件中，减少和文件的交流，提高了运行效率

			- BufferedOutputStream(OutputStream out)

			- BufferedOutputStream(OutputStream out, int size)
			  根据参数指定的引用和缓冲区大小来构造对象

			- void write(int b)

			- void write(byte[] b, int off, int len)

			- void write(byte[] b)

			- void flush()

			- void close()

	- FilterOutputStream

		- PrintStream
		  java.io.PrintStream类主要用于更加方便地打印各种数据内容

			- PrintStream(OutputStream out)
			  根据参数指定的引用来构造对象

			- void print(String s)
			  用于将参数指定的字符串内容打印出来

			- void println(String x)
			  用于打印字符串后并终止该行

			- void flush()
			  刷新流

			- void close()
			  用于关闭输出流并释放有关的资源

		- DataOutputStream
		  java.io.DataOutputStream类主要用于以适当的方式将基本数据类型写入输出流中

			- DataOutputStream(OutputStream out)

			- void writeInt(int v)

			- void close()

	- ObjectOutputStream
	  * java.io.ObjectOutputStream类主要用于将一个对象的所有内容整体写入到输出流中。   
	  * 只能将支持 java.io.Serializable 接口的对象写入流中。  
	  * 类通过实现 java.io.Serializable 接口以启用其序列化功能。   
	  * 所谓序列化主要指将一个对象需要存储的相关信息有效组织成字节序列的转化过程。

		- ObjectOutputStream(OutputStream out)
		  根据参数指定的引用来构造对象

		- void writeObject(Object obj)
		  用于将参数指定的对象整体写入到输出流中

		- void close()

		- 被存储的类
		  被存储的类及使用到的成员变量都需要实现 Serializable

			- 实现 java.io.Serializable
			  * 需要添加 字段  
			  ```java  
			  private static final long serialVersionUID = -xxxxxxL;  
			  ```  
			  用来反序列号的时候，文件中类的序列号和本地类的比较，不同就会反序列化失败  
			    
			  * IDEA 默认不会提醒添加这个字段，需要改一下设置  
			  ```  
			  Preference->Editor->Inspections->Java-> Serializable class without”serialVersionUID” , check  
			  ```

			- serialVersionUID
			  序列化机制是通过在运行时判断类的serialVersionUID来验证版本一致性的。在进行反序列化时， JVM会把传来的字节流中的serialVersionUID与本地相应实体类的serialVersionUID进行比较，如 果相同就认为是一致的，可以进行反序列化，否则就会出现序列化版本不一致的异常(InvalidCastException)  
			    
			  * 不写也没问题，但是了写了还中途修改就会导致反序列化失败

			- transient
			  transient是Java语言的关键字，用来表示一个域不是该对象串行化的一部分。当一个对象被串行 化的时候，transient型变量的值不包括在串行化的表示中，然而非transient型的变量是被包括进 去的。

- InputStream

	- FileInputStream
	  java.io.FileInputStream类主要用于从输入流中以字节流的方式读取图像数据等

		- FileInputStream(String name)

		- int read()

		- int read(byte[] b, int off, int len)

		- int read(byte[] b)

		- void close()

		- int available()

		- BufferedInputStream
		  * java.io.BufferedInputStream类主要用于描述缓冲输入流  
		  * 内部有一个缓冲区，一次从文件中读取一定大小的数据，读取的时候从缓冲区里取数据并返回，当缓冲区数据不够时再次从文件中读取数据

			- BufferedInputStream(InputStream in)

			- BufferedInputStream(InputStream in, int size)

	- FilterInputStream

		- DataInputStream
		  java.io.DataInputStream类主要用于从输入流中读取基本数据类型的数据

			- DataInputStream(InputStream in)

			- int readInt()

			- void close()

	- ObjectInputStream
	  * java.io.ObjectInputStream类主要用于从输入流中一次性将对象整体读取出来。  
	  * 所谓反序列化主要指将有效组织的字节序列恢复为一个对象及相关信息的转化过程。

		- ObjectInputStream(InputStream in)

		- Object readObject()
		  主要用于从输入流中读取一个对象并返回   
		  😂无法通过返回值 来判断是否读取到文件的末尾

		- void close()

- RandomAccessFile
  java.io.RandomAccessFile类主要支持对随机访问文件的读写操作

	- RandomAccessFile(String name, String mode)
	  根据参数指定的名称和模式构造对象  
	  r: 以只读方式打开  
	  rw:打开以便读取和写入   
	  rwd:打开以便读取和写入，同步文件内容的更新   
	  rws:打开以便读取和写入，同步文件内容和元数据 的更新

	- int read()

	- void seek(long pos)
	  用于设置从此文件的开头开始测量的文件指针偏移量

	- long getFilePointer()
	  获取当前光标的位置

	- void write(int b)

	- void close()

- 文件复制
  使用一个大小适当的数组用来缓存读取到的字节，一个数组一个数组的搬运数据  
  ```java  
  fr = new FileInputStream(src);  
  fw = new FileOutputStream(dest);  
    
  byte[] content = new byte[1024];  
  int res = 0;  
  while (-1 != (res=fr.read(content))) {  
         fw.write(content, 0, res);  
  }  
  ```  
  使用 BufferedOutputStream、BufferedInputStream 提高效率

## net

### tcp

传输控制协议(Transmission Control Protocol)，是一种面向连接的协议，类似于打电话。  
* 建立连接 => 进行通信 => 断开连接   
* 在传输前采用"三次握手"方式。 在通信的整个过程中全程保持连接，形成数据传输通道。   
* 保证了数据传输的可靠性和有序性。   
* 是一种全双工的字节流通信方式，可以进行大数据量的传输。   
* 传输完毕后需要释放已建立的连接，发送数据的效率比较低。

- ServerSocket
  java.net.ServerSocket类主要用于描述服务器套接字信息  
    
  服务器:  
  (1)创建ServerSocket类型的对象并提供端口号;   
  (2)等待客户端的连接请求，调用accept()方法;  
  (3)使用输入输出流进行通信;  
  (4)关闭Socket;

	- ServerSocket(int port)
	  根据参数指定的端口号来构造对象

	- Socket accept()
	  侦听并接收到此套接字的连接请求

	- void close()
	  用于关闭套接字

- Socket
  java.net.Socket类主要用于描述客户端套接字，是两台机器间通信的端点  
    
  客户端:   
  (1)创建Socket类型的对象并提供服务器的IP地址和端口号;   
  (2)使用输入输出流进行通信;  
  (3)关闭Socket;  
    
  **注意事项**  
  * 客户端 Socket 与服务器端 Socket 对应, 都包含输入和输出流。   
  * 客户端的 socket.getInputStream() 连接于服务器socket.getOutputStream()。   
  * 客户端的socket.getOutputStream()连接于服务器socket.getInputStream()  
  * 使用BufferedReader接收字符串时，输出方务必调用`flush`，不然程序会无限等待

	- Socket(String host, int port)
	  根据指定主机名和端口来构造对象

	- InputStream getInputStream()
	  用于获取当前套接字的输入流

	- OutputStream getOutputStream()
	  用于获取当前套接字的输出流

	- void close()
	  用于关闭套接字

### udp

* 用户数据报协议(User Datagram Protocol)，是一种非面向连接的协议，类似于写信。  
	* 在通信的整个过程中不需要保持连接，其实是不需要建立连接。   
	* 不保证数据传输的可靠性和有序性。   
	* 是一种全双工的数据报通信方式，每个数据报的大小限制在64K内。   
	* 发送数据完毕后无需释放资源，开销小，发送数据的效率比较高，速度快。  
  
* 编程模型  
	* 接收方:  
		(1)创建DatagramSocket类型的对象并提供端口号;   
		(2)创建DatagramPacket类型的对象并提供缓冲区;   
		(3)通过Socket接收数据内容存放到Packet中，调用receive方法; 		  
		(4)关闭Socket;  
	* 发送方:  
		(1)创建DatagramSocket类型的对象;   
		(2)创建DatagramPacket类型的对象并提供接收方的通信地址; 		(3)通过Socket将Packet中的数据内容发送出去，调用send方法;   
		(4)关闭Socket;

- DatagramSocket
  java.net.DatagramSocket类主要用于描述发送和接收数据报的套接字

	- DatagramSocket()
	  使用无参的方式构造对象

	- DatagramSocket(int port)
	  根据参数指定的端口号来构造对象

	- void receive(DatagramPacket p)
	  用于接收数据报存放到参数指定的位置

	- void send(DatagramPacket p)
	  用于将参数指定的数据报发送出去

	- void close()

- DatagramPacket
  java.net.DatagramPacket类主要用于描述数据报，数据报用来实现无连接包裹投递服务

	- DatagramPacket(byte[] buf, int length)
	  根据参数指定的数组来构造对象，用于接 收长度为length的数据报

	- DatagramPacket(byte[] buf, int length, InetAddress address, int port)
	  根据参数指定数组来构造对象，将数据报发送到指定地址和端口

	- InetAddress getAddress()
	  用于获取发送方或接收方的通信地址

	- int getPort()
	  用于获取发送方或接收方的端口号

	- int getLength()
	  用于获取发送数据或接收数据的长度

- InetAddress
  java.net.InetAddress类主要用于描述互联网通信地址信息

	- static InetAddress getLocalHost()
	  用于获取当前主机的通信地址

	- static InetAddress getByName(String host)
	  根据参数指定的主机名获取通信地址

### URL

* java.net.URL(Uniform Resource Identifier)类主要用于表示统一的资源定位器，也就是指向万维网上“资源”的指针。这个资源可以是简单的文件或目录，也可以是对复杂对象的引用，例如对数 据库或搜索引擎的查询等。   
* 通过URL可以访问万维网上的网络资源，最常见的就是www和ftp站点，浏览器通过解析给定的 URL可以在网络上查找相应的资源。  
* URL的基本结构如下:   
<传输协议>://<主机名>:<端口号>/<资源地址>

- URL(String spec)
  根据参数指定的字符串信息构造对象

- String getProtocol()
  获取协议名称

- String getHost()
  获取主机名称

- int getPort()
  获取端口号

- String getPath()
  获取路径信息

- String getFile()
  获取文件名

- URLConnection openConnection()
  获取URLConnection类的实例

### URLConnection

java.net.URLConnection类是个抽象类，该类表示应用程序和URL之间的通信链接的所有类的超  
类，主要实现类有支持HTTP特有功能的HttpURLConnection类。

- InputStream getInputStream()
  获取输入流

- void disconnect()
  断开连接

