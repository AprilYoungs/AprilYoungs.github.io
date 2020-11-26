---
layout: post
title:  "JAVA 常用核心类库(上)"
date:   2020-11-19
categories: java se
---
# 常用核心类库(上)


## lang

该包是Java语言的核心包，并且该包中的所有内容由Java虚拟机自动导入。 如:System类、String类、...

### Object

根类，所有类是该类的直接或间接子类

- Object()
  使用无参方式构造对象

- boolean equals(Object obj)
  用于判断调用对象是否与参数对象相等。   
  1. 该方法默认比较两个对象的地址是否相等，与 == 运算符的结果一致   
  2. 若希望比较两个对象的内容，则需要重写该方法。 若该方法被重写后，则应该重写hashCode方法来保证结果的一致 性。

- int hashCode()
  返回对象的哈希码值(内存地址的编号)  
  1. 若两个对象调用equals方法相等，则各自调用该方法的结果必须相同  
  2. 若两个调用对象equals方法不相等，则各自调用该方法的结果应该 不相同。   
  3. 为了使得该方法与equals方法保持一致，需要重写该方法。使用所有成员变量生成一个哈希值  
    
  ```  
  @Override  
  public int hashCode() {  
      return Objects.hash(age, name);  
  }  
  ```

- String toString()
  用于获取调用对象的字符串形式   
  1. 该方法默认返回的字符串为:包名.类名@哈希码值的十六进制  
  2. 为了返回更有意义的数据，需要重写该方法   
  > 使用print或println打印引用或字符串拼接引用都会自动调用该方法

- Class<?> getClass()
  用于返回调用对象执行时的Class实例，反射机制使用

### 包装类

通常情况下基本数据类型的变量不是对象，为了满足万物皆对象的理念就需要对基本数据类型的变  
量进行打包封装处理变成对象，而负责将这些变量声明为成员变量进行对象化处理的相关类，叫做包装  
类。

- Integer
  java.lang.Integer类内部包装了一个int类型的变量作为成员变量，主要用于实现对int类型的包装并 提供int类型到String类之间的转换等方法。

	- 常量

		- MAX_VALUE
		  表示int类型可以描述的最大值，即2^31-1

		- MIN_VALUE
		  表示int类型可以描述的最小值，即-2^31

		- SIZE
		  表示int类型采用二进制补码形式的位数

		- BYTES
		  表示int类型所占的字节个数

		- TYPE
		  表示int类型的Class实例

	- Integer(int value)
	  @Deprecated

	- Integer(String s)
	  @Deprecated

	- int intValue()

	- static int parseInt(String s)

	- static Integer valueOf(int i)

	- boolean equals(Object obj)

	- static String toString(int i)

	- static String toBinaryString(int i)

	- static String toHexString(int i)

	- static String toOctalString(int i)

- 装箱
  Integer i4 = Integer.valueOf(674);

	- 自动装箱
	  Java5 开始有自动装箱  
	    
	  Integer i4 = 678;

- 拆箱
  int i5 = i4.intValue();

	- 自动拆箱
	  Java5 开始有自动拆箱  
	    
	  Integer i4 = 45;  
	  int i5 = i4;

- *自动装箱池*笔试
  在Integer类的内部提供了自动装箱池技术，将-128到127之间的整数已经装箱完毕，当程序中使用 该范围之间的整数时，无需装箱直接取用自动装箱池中的对象即可，从而提高效率。

	- CharacterCache(0 ~ 128)

	- IntegerCache (-128~127)

- Double
  ava.lang.Double类型内部包装了一个double类型的变量作为成员变量，主要用于实现对double 类型的包装并提供double类型到String类之间的转换等方法。

	- 常量

		- SIZE

		- BYTES

		- TYPE

	- Double(double value)

	- Double(String s)

	- double doubleValue()

	- static Double valueOf(double d)

	- boolean equals(Object obj)

	- String toString()

	- static double parseDouble(String s)

	- boolean isNaN()
	  判断调用对象的数值是否为非数字（0/0.0）

- Boolean
  java.lang.Boolean类型内部包装了一个boolean类型的变量作为成员变量，主要用于实现对 boolean类型的包装并提供boolean类型到String类之间的转换等方法。

	- 常量

		- FALSE

		- TRUE

		- TYPE

	- Boolean(boolean value)

	- Boolean(String s)

	- boolean booleanValue()

	- static Boolean valueOf(boolean b)

	- boolean equals(Object obj)

	- String toString()

	- static boolean parseBoolean(String s)
	  ```java  
	  public static boolean parseBoolean(String s) {  
	      return "true".equalsIgnoreCase(s);  
	  }  
	  ```

- Character

	- 常量

		- SIZE

		- BYTES

		- TYPE

	- Character(char value)

	- char charValue()

	- static Character valueOf(char c)

	- boolean equals(Object obj)

	- String toString()

	- static boolean isUpperCase(char ch)

	- static boolean isLowerCase(char ch)

	- static boolean isDigit(char ch)

	- static char toUpperCase(char ch)

	- static char toLowerCase(char ch)

- Byte

- Short

- Long

- Float

### 数据处理类

- Math
  java.lang.Math类主要用于提供执行数学运算的方法，如:对数，平方根。

	- static int max(int a, int b)

	- static int min(int a, int b)

	- static double pow(double a, double b)

	- static int abs(int a)

	- static long round(double a)
	  返回参数四舍五入的结果

	- static double sqrt(double a)

	- static double random()
	  返回0.0到1.0的随机数

- BigDecimal
  由于float类型和double类型在运算时可能会有误差，若希望实现精确运算则借助  
  java.math.BigDecimal类型加以描述。

	- BigDecimal(String val)

	- BigDecimal add(BigDecimal augend)

	- BigDecimal subtract(BigDecimal subtrahend)

	- BigDecimal multiply(BigDecimal multiplicand)

	- BigDecimal divide(BigDecimal divisor)
	  ⚠️ 除法除不尽的时候会报错

- BigInteger
  若希望表示比long类型范围还大的整数数据，则需要借助java.math.BigInteger类型描述

	- BigInteger(String val)

	- BigInteger add(BigInteger val)

	- BigInteger subtract(BigInteger val)

	- BigInteger multiply(BigInteger val)

	- BigInteger divide(BigInteger val)

	- BigInteger remainder(BigInteger val)
	  用于实现取余运算

	- BigInteger[] divideAndRemainder(BigInteger val)
	  用于实现取商和余数的运算

### String

* java.lang.String类用于描述字符串，Java程序中所有的字符串字面值都可以使用该类的对象加以描 述，如:"abc"  
* 该类由final关键字修饰，表示该类不能被继承。   
* 从jdk1.9开始该类的底层不使用char[]来存储数据，而是改成 byte[]加上编码标记，从而节约了一 些空间。  
* 该类描述的字符串内容是个常量不可更改，因此可以被共享使用。

- 常量池
  由于String类型描述的字符串内容是常量不可改变，因此Java虚拟机将首次出现的字符串放入常量 池中，若后续代码中出现了相同字符串内容则直接使用池中已有的字符串对象而无需申请内存及创建对 象，从而提高了性能。

- constructor

	- String()

	- String(byte[] bytes, int offset, int length)

	- String(byte[] bytes)

	- String(char[] value, int offset, int count)

	- String(char[] value)

	- *String(String original)*
	  根据参数指定的字符串内容来构造对象，新创建对象为参数对象的副本  
	    
	  > 有一个对象在常量池，有一个对象在堆区  
	    
	  笔试题：  
	  ```java  
	  // 请问下面的代码会创建几个对象？分别存放在什么地方？  
	  String str1 = "hello"; //1个对象 常量池  
	  String str2 = new String("hello"); //2个对象，1个在常量池，1个在堆区  
	    
	  String str3 = "hello";  
	  String str4 = "hello";  
	  String str5 = new String("hello");  
	  String str6 = new String("hello");  
	  System.out.println(str3 == str4);       //比较地址 true  
	  System.out.println(str3.equals(str4));  //比较内容 true  
	  System.out.println(str5 == str6);       //比较地址 false  
	  System.out.println(str5.equals(str6));  //比较内容 true  
	  System.out.println(str4 == str6);       //比较地址 false  
	  System.out.println(str4.equals(str6));  //比较内容 true  
	    
	  String str7 = "abcd";  
	  String str8 = "ab" + "cd";          // 常量优化机制 "abcd"  
	  System.out.println(str7 == str8);       //比较地址 true  
	    
	  String str9 = "ab";  
	  String str10 = str9 + "cd";         // 没有常量优化，相当于使用StringBuilder去做拼接  
	  System.out.println(str9 == str10);      //比较地址 true  
	  ```

- 成员方法

	- String toString()

	- byte[] getBytes()

	- char[] toCharArray()

	- char charAt(int index)

	- int length()

	- boolean isEmpty()

	- int compareTo(String anotherString)
	  先比较字符，如果前面字符都一样，后面长度不一样，则用长度做减法  
	    
	  > 例如: “hello” vs “helloworld” = -5

	- int compareToIgnoreCase(String str)

	- String concat(String str)

	- boolean contains(CharSequence s)

	- String toLowerCase()

	- String toUpperCase()

	- String trim()

	- boolean startsWith(String prefix)

	- boolean startsWith(String prefix, int offset)

	- boolean endsWith(String suffix)

	- boolean equals(Object anObject)

	- int hashCode()

	- boolean equalsIgnoreCase(String anotherString)

	- int indexOf(int ch)

		- int lastIndexOf(int ch)

	- int indexOf(int ch, int fromIndex)

		- int lastIndexOf(int ch, int fromIndex)

	- int indexOf(String str)

		- int lastIndexOf(String str)

	- int indexOf(String str, int fromIndex)

		- int lastIndexOf(String str, int fromIndex)

	- String substring(int beginIndex, int endIndex)

	- String substring(int beginIndex)

	- String valueOf(xxx)

- 正则表达式

	- boolean matches(String regex)
	  判断当前正在调用的字符串是否匹配参数指定的正则表达式规 

	- String[] split(String regex)

	- String replace(char oldChar, char newChar)

		- String replace(CharSequence target, CharSequence replacement)

	- String replaceFirst(String regex, String replacement)

	- String replaceAll(String regex, String replacement)

### StringBuilder

StringBuilder类是从jdk1.5开始存在，属于非线程安全的类，效率比较高。（不是String的子类）

- constructor

	- StringBuilder()
	  使用无参方式构造对象，容量为16

	- StringBuilder(String str)
	  容量为:16+字符串长度

	- StringBuilder(int capacity)
	  根据参数指定的容量来构造对象，容量为参数指定大小

- 成员方法

	- int capacity()
	  用于返回调用对象的容量

	- int length()
	  用于返回字符串的长度，也就是字符的个数

	- StringBuilder insert(int offset, String str)
	  插入字符串并返回调用对象的引用，就是自己。

	- StringBuilder append(String str)
	  追加字符串

	- StringBuilder deleteCharAt(int index)
	  将当前字符串中下标为index位置的单个字符 删除

	- StringBuilder delete(int start，int end)
	  删除字符串

	- StringBuilder replace(int start，int end，  
	  String str)
	  替换字符串

	- StringBuilder reverse()
	  字符串反转

- 笔试考点
  1. 既然StringBuilder类的对象本身可以修改，那么为什么成员方法还返回值呢？  
  > 为了连续调用  
  2. String和StringBuilder之间如何相互转化  
  ```java  
  String str3 = sb3.toString();  
  StringBuilder = new StringBuilder(str3)  
  ```  
  3. String、StringBuilder、StringBuffer之间效率谁高？排列如何？  
  > String < StringBuffer < StringBuilder

### StringBuffer

StringBuffer类是从jdk1.0开始存在，属于线程安全的类，因此效率比较低。

### System

Java.lang.System类中提供了一些有用的类字段和方法

- static long currentTimeMillis()
  返回当前时间与1970年1月1日0时0分0秒之间以毫秒为单位的时 

## util

该包是Java语言的工具包，里面提供了大量工具类以及集合类等。 如:Scanner类、Random类、List集合、...

### Date

java.util.Date类主要用于描述特定的瞬间，也就是年月日时分秒，可以精确到毫秒

- Date()
  使用无参的方式构造对象，也就是当前系统时间

- Date(long date)
  根据参数指定毫秒数构造对象， 参数为距离1970年1月1日0时0分0秒 的毫秒数

- long getTime()
  获取调用对象距离1970年1月1日0时0分0秒的毫秒数

- void setTime(long time)
  设置调用对象为距离基准时间time毫秒的时间点

### SimpleDateFormat

java.text.SimpleDateFormat类主要用于实现日期和文本之间的转换。

- SimpleDateFormat()
  使用无参方式构造对象

- SimpleDateFormat(String  pattern)
  根据参数指定的模式来构造对象，模式主要有: y-年 M-月 d-日 H-时 m-分 s-秒

- final String format(Date date)
  用于将日期类型转换为文本类型

- Date parse(String source)
  用于将文本类型转换为日期类型

### Calendar

* java.util.Calender类主要用于描述特定的瞬间，取代Date类中的过时方法实现全球化。   
* 该类是个抽象类，因此不能实例化对象，其具体子类针对不同国家的日历系统，其中应用最广泛的 是GregorianCalendar(格里高利历)，对应世界上绝大多数国家/地区使用的标准日历系统。

- static Calendar getInstance()
  用于获取Calendar类型的引 用

- void set(int year, int month, int date, int hourOfDay, int minute, int second)
  用于设置年月日时分秒信息

- Date getTime()
  用于将Calendar类型转换为 Date类型

- void set(int field, int value)
  设置指定字段的数值

- void add(int field, int amount)
  向指定字段增加数值

### Collection接口

java.util.Collection接口是List接口、Queue 接口以及Set接口的父接口，因此该接口里定义的方法 既可用于操作List集合，也可用于操作Queue集合和Set集合

- 常用方法

	- boolean add(E e);

	- boolean addAll(Collection<? extends E> c)

	- boolean contains(Object o);
	  判断是否包含指定对象  
	  > 工作原理：判断Collection中是否有元素 e.equals(o)，如果要比较自定义对象的内容是否相同，需要重写对应类的equals和hashCode方法

	- boolean containsAll(Collection<?> c)
	  判断是否包含参数指定的所有对象

	- boolean retainAll(Collection<?> c)
	  保留当前集合中存在且参数集合中存在的所有对象  
	  > 求交集，并保存到当前集合中。 当结果又改变的时候返回true，不然为false

	- boolean remove(Object o);
	  从集合中删除对象  
	  > 删除完第一次查找到的元素就结束

	- boolean removeAll(Collection<?> c)
	  从集合中删除参数指定的所有对象  
	  > 删除与c集合的并集元素

	- void clear();
	  清空集合

	- int size();
	  返回包含对象的个数

	- boolean isEmpty();
	  判断是否为空

	- boolean equals(Object o)
	  判断是否相等  
	  > 判断集合长度是否相同，按顺序判断每个元素是否相等

	- int hashCode()
	  获取当前集合的哈希码值

	- Object[] toArray()
	  将集合转换为数组

		- Arrays-> public static <T> List<T> asList(T... a)
		  数组转Collection

- List接口
  * java.util.List集合是Collection集合的子集合，该集合中允许有重复的元素并且有先后放入次序  
  * 该集合的主要实现类有:ArrayList类、LinkedList类、Stack类、Vector类  
  * 

	- ArrayList
	  底层是采用动态数组进行数据管理的，支持下标访问，增删元素不方便  
	    
	  无参初始化时容量为零，当需要扩容的时候扩展为原来的1.5倍

	- LinkedList
	  底层是采用双向链表进行数据管理的，访问不方便，增删元素方便

	- Stack
	  底层是采用动态数组进行数据管理的，该类主要用于描述一种具有后进先出特征的  
	  数据结构，叫做栈(last in first out LIFO)。

	- Vector
	  底层是采用动态数组进行数据管理的，该类与ArrayList类相比属于**线程安全的类**，效率比较低，以后开发中基本不用  
	  扩容的时候 x2

	- 常用方法

		- void add(int index, E element)
		  向集合中指定位置添加元素

		- boolean addAll(int index, Collection<? extends E> c)
		  向集合中添加所有元素

		- E get(int index)
		  从集合中获取指定位置元素

		- int indexOf(Object o)

		- int lastIndexOf(Object o)

		- E set(int index, E element)
		  修改指定位置的元素, 返回被替换的元素

		- E remove(int index)
		  删除指定位置的元素  
		  连续删除的时候注意下标，还有size()

		- List subList(int fromIndex, int toIndex)
		  用于获取子List  
		  >⚠️注意：子List和原来的list共用一块的内存，修改原list可能会导致子List访问异常

- Queue接口
  * java.util.Queue集合是Collection集合的子集合，与List集合属于平级关系。   
  * 该集合的主要用于描述具有先进先出特征的数据结构，叫做队列(first in first out FIFO)。   
  * 该集合的主要实现类是LinkedList类，因为该类在增删方面比较有优势。

	- LinkedList

	- 常用方法

		- boolean offer(E e)
		  将一个对象添加至队尾，若添加成功则返回true

		- E poll()
		  从队首删除并返回一个元素

		- E peek()
		  返回队首的元素(但并不删除)

- Set接口
  该集合中元素没有先后放入次序，且不允许重复。

	- TreeSet
	  * 底层是采用红黑树(特殊的有序二叉树)进行数据管理的  
	  * 由于TreeSet集合的底层采用红黑树进行数据的管理，当有新元素插入到TreeSet集合时，需要使 用新元素与集合中已有的元素依次比较来确定新元素的合理位置。  
	  * 比较元素大小的规则有两种方式: 	* 使用元素的自然排序规则进行比较并排序，让元素类型实现java.lang.Comparable接口;   
	  	* 使用比较器规则进行比较并排序，构造TreeSet集合时传入java.util.Comparator接口;  
	  ```java  
	  // 构建匿名类传入  
	  Comparator<Student> comparator  = new Comparator<Student>() {  
	      @Override  
	      public int compare(Student o1, Student o2) {  
	          return o1.getAge()-o2.getAge();  
	      }  
	  };  
	  Set<Student> s2 = new TreeSet<>(comparator);  
	    
	  // 直接使用lambda表达式  
	  Set<Student> s2 = new TreeSet<>((o1, o2) -> o1.getAge()-o2.getAge());  
	  ```  
	  * 自然排序的规则比较单一，而比较器的规则比较多元化，而且比较器优先于自然排序;

	- HashSet
	  底层是采用哈希表进行数据管理的

		- LinkedHashSet
		  LinkedHashSet类与HashSet类的不同之处在于内部维护了一个双向链表，链表中记录了元 素的迭代顺序，也就是元素插入集合中的先后顺序，因此便于迭代

		- 元素放入HashSet集合的原理
		  * 使用元素调用hashCode方法获取对应的哈希码值，再由某种哈希算法计算出该元素在数组中的索引位置。  
		  * 若该位置没有元素，则将该元素直接放入即可。  
		  * 若该位置有元素，则使用新元素与已有元素依次比较哈希值，若哈希值不相同，则将该元素直接放入。  
		  * 若新元素与已有元素的哈希值相同，则使用新元素调用equals方法与已有元素依次比较。   
		  * 若相等则添加元素失败，否则将元素直接放入即可。

### Iterator接口

* java.util.Iterator接口主要用于描述迭代器对象，可以遍历Collection集合中的所有元素。   
* java.util.Collection接口继承Iterator接口，因此所有实现Collection接口的实现类都可以使用该迭 代器对象。

- boolean hasNext()
  判断集合中是否有可以迭代/访问的元素

- E next()
  用于取出一个元素并指向下一个元素

- void remove()
  用于删除访问到的最后一个元素

- for each循环
  * Java5推出了增强型for循环语句，可以应用数组和集合的遍历。  
  * 是经典迭代的“简化版”。  
    
  * 语法  
  ```java  
  for(元素类型 变量名 : 数组/集合名称) { 循环体;  
  }  
  ```  
    
  * 执行流程  
  > 不断地从数组/集合中取出一个元素赋值给变量名并执行循环体，直到取完所有元素为止。

### 泛型机制(type parameter)

* 从Java5开始增加泛型机制，也就是在集合名称的右侧使用<数据类型> 的方式来明确要求该集合中可以存放的元素类型，若放入其它类型的元素则编译报错。   
* 泛型只在编译时期有效，在运行时期不区分是什么类型

- 菱形特性
  java7 开始可以省略后面构建方法的类型  
  ```java  
  List<String> lt1 = new LinkedList<>();  
  ```

- 底层原理
  让数据类型作为一个参数传递  
  其中E相当于形式参数负责占位， 而使用集合时<>中的数据类型相当于实际参数，用于给形式参数E进行初始化，从而使得集合中所 有的E被实际参数替换，由于实际参数可以传递各种各样广泛的数据类型，因此得名为泛型。

- 自定义泛型类
  泛型类和普通类的区别就是类名后面添加了类型参数列表，可以有多个类型参数，如:<E, T, .. > 等。  
    
  ```java  
  // 父类  
  public class Person<T> { … }  
    
  // 子类  
  // 保留父类泛型  
  public class SubPerson<T> extends Person<T> { … }  
    
  // 不保留父类泛型，并指定类型  
  public class SubPerson extends Person<String> { … }  
    
  // 丢弃父类泛型  
  public class SubPerson extends Person { … }  
  ```  
    
  使用的时候，不指定类型T，就默认为Object

- 自定义泛型方法
  泛型方法就是我们输入参数的时候，输入的是泛型参数，而不是具体的参数。我们在调用这个泛型 方法的时需要对泛型参数进行实例化。  
    
  泛型方法的格式:  
  >[访问权限] <泛型> 返回值类型 方法名([泛型标识 参数名称]) { 方法体; }  
    
  ```java  
  // 在返回类型前添加<>表示泛型  
  public static  <T1> void printArray(T1[] arr) {  
      for (T1 o: arr) {  
          System.out.println(o);  
      }  
  }  
    
  // 使用的时候直接传Object类型的数据就可以  
  ```

- 通配符的使用
  有时候我们希望传入的类型在一个指定的范围内，此时就可以使用泛型通配符了。一般在类定义或方法参数中使用

	- <?> 
	  无限制通配符:表示我们可以传入任意类型的参数。  
	    
	  *List<?> lt* 可以直线任意类型的List数组，但是不支持添加新元素，从lt中取出的元素都是Object类型，需要转化成相应的类型  
	    
	  ```java  
	  List<Person> l1 = new LinkedList<>();  
	  List<SubPerson> l2 = new LinkedList<>();  
	  List<?> l3 = new LinkedList<>();  
	  l3 = l1;  
	  l3 = l2;  
	  // cannot be converted to capture#1 of ?  
	  // l3.add(new Person());  
	  ```

	- <? extends E>
	  表示类型的上界是E，只能是E或者是E的子类。  
	    
	  不支持添加元素， 取的时候当成E处理

	- <? super E> 
	  表示类型的下界是E，只能是E或者是E的父类。  
	    
	  可以添加 E及其子类元素， 取的时候都会当成 Object处理  
	    
	  >使用场景  
	  ```java  
	  // TreeSet传递比较器的时候的类型不能是E的子类，如果是E的子类，然而Set里边的元素其实是E就会类型转换失败。Comparator使用E的父类是可以正常转化并比较的  
	  public TreeSet(Comparator<? super E> comparator)  
	  ```

### Map接口

* java.util.Map<K,V>集合中存取元素的基本单位是:单对元素，其中类型参数如下:   
K - 此映射所维护的键(Key)的类型，相当于目录。  
V - 映射值(Value)的类型，相当于内容。  
* 该集合中key是不允许重复的，而且一个key只能对应一个value。

- HashMap
  底层是采用哈希表进行数据管理的

	- LinkedHashMap
	  HashMap类的不同之处在于内部维护了一个双向链表，链表中记录了 元素的迭代顺序，也就是元素插入集合中的先后顺序，因此便于迭代

	-  元素放入HashMap集合的原理
	  * 使用元素的key调用hashCode方法获取对应的哈希码值，再由某种哈希算法计算在数组中的索引 位置。  
	  * 若该位置没有元素，则将该键值对直接放入即可。   
	  * 若该位置有元素，则使用key与已有元素依次比较哈希值，若哈希值不相同，则将该元素直接放 入。  
	  * 若key与已有元素的哈希值相同，则使用key调用equals方法与已有元素依次比较。  
	  *  若相等则将对应的value修改，否则将键值对直接放入即可。

- TreeMap
  底层是采用红黑树进行数据管理的

- Hashtable
  古老的Map实现类，与HashMap类相比属于线程安全的类，且不允许null作 为key或者value的数值。

	- Properties
	  Hashtable类的子类，该对象用于处理属性文件，key和value都是String类 型的。

- 常用方法

	- V put(K key, V value)
	  将Key-Value对存入Map，若集合中已经包含该Key，则替换该Key所对 应的Value，返回值为该Key原来所对应的Value，若没有则返回null

	- V get(Object key)
	  返回与参数Key所对应的Value对象，如果不存在则返回null

	- boolean containsKey(Object key);
	  判断集合中是否包含指定的Key

	- boolean containsValue (Object value);
	  判断集合中是否包含指定的Value

	- V remove(Object key)
	  根据参数指定的key进行删除

	- Set keySet()
	  返回此映射中包含的键的Set视图

	- Collection values()
	  返回此映射中包含的值的Set视图

	- Set<Map.Entry<K,V>> entrySet()
	  返回此映射中包含的映射的Set视图

### Collections工具类

- static <T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll)
  根据元素的自然顺序返回给定集合的最大元素

- static T max(Collection<? extends T> coll, Comparator<? super T> comp)
  根据指定比较器引发的顺序返回给定集合的最大元素

- static <T extends Object & Comparable<?super T>> T min(Collection<? extends T> coll)
  根据元素的自然顺序返回给定集合的最小元素

- static T min(Collection<? extends T> coll, Comparator<? super T> comp)
  根据指定比较器引发的顺序返回给定集合的最小元素

- static void copy(List<? super T> dest, List<? extends T> src)
  将一个列表中的所有元素复制到另一个列表中

- static void reverse(List<?> list)
  反转指定列表中元素的顺序

- static void shuffle(List<?> list)
  使用默认的随机源随机置换指定的列表

- static <T extends Comparable<? super T>> void sort(List list)
  根据其元素的自然顺序将指定列表按升序排序

- static void sort(List list, Comparator<? super T> c)
  根据指定比较器指定的顺序对指定列表进行排序

- static void sort(List list, Comparator<? super T> c)
  根据指定比较器指定的顺序对指定列表进行排序

- static void swap(List<?> list, int i, int j)
  交换指定列表中指定位置的元素

## time

java8 开始才有

### LocalDate

java.time.LocalDate类主要用于描述年-月-日格式的日期信息，该类不表示时间和时区信息。

- static LocalDate now()
  在默认时区中从系统时钟获取当前日期

### LocalTime

java.time.LocalTime 类主要用于描述时间信息，可以描述时分秒以及纳秒。

- static LocalTime now()
  从默认时区的系统时间中获取当前时间

- static LocalTime now(ZoneId zone)
  获取指定时区的当前时间

### LocalDateTime

java.time.LocalDateTime类主要用于描述ISO-8601日历系统中没有时区的日期时间，如2007-12- 03T10:15:30

### Instant

java.time.Instant类主要用于描述瞬间的时间点信息(使用0时区)

- static Instant now()
  从系统时钟上获取当前时间

- OffsetDateTime atOffset(ZoneOffset offset)
  将此瞬间与偏移量组合以创建偏移日期时间

- static Instant ofEpochMilli(long epochMilli)
  根据参数指定的毫秒数来构造对象，参数为距离1970年1月1 日0时0分0秒的毫秒数

- long toEpochMilli()
  获取距离1970年1月1日0时0分0秒的毫秒数

### DateTimeFormatter

ava.time.format.DateTimeFormatter类主要用于格式化和解析日期

- static DateTimeFormatter ofPattern(String pattern)
  根据参数指定的模式来获取对象

- String format(TemporalAccessor temporal)
  将参数指定日期时间转换为字符串

- TemporalAccessor parse(CharSequence text)
  将参数指定字符串转换为日期时间

## io

该包是Java语言中的输入输出包，里面提供了大量读写文件相关的类等。 如:FileInputStream类、FileOutputStream类、...

## net

该包是Java语言中的网络包，里面提供了大量网络编程相关的类等。 如:ServerSocket类、Socket类、...

