---
layout: post
title:  "CSS, js, jQuery, vue"
date:   2020-12-17
categories: java web
---
# 前端可视化

## css

* CSS是指层叠样式表 cascading style sheets  
* 引入CSS的方式  
	1. 直接在标签里写 
     
    ```html
	<div style=“color:red”>hello</div>  
	```
	2. 内部样式表在head和body之间插入<style></style>  
	3. 外部样式表  

	```html  
	1.  
	<link rel="stylesheet" href="css/css01.css">  
	2.  
	<style>  
     @import url("css/css01.css");  
	</style>  
	```
	* import vs link  
	> 1. 加载顺序不同  
@import方式导入会先加载html，然后才导入css样式，那么如果网络条件不好，就会先看到没有 修饰的页面，然后才看到修饰后的页面。 如果使用link方式，它会先加载样式表，也就是说，我们看到的直接就是修饰的页面;  
2. @import方式导入css样式，它是不支持javascript的动态修改的。而link支持。

### 选择器

- 元素选择器

	- div

- 类选择器

	- .class

- id选择器

	- #id

- 属性选择器

	- tagName[attrName]

	- tagName[attrName=‘xxx’]

- 选择器组

	- div, img (`||` 满足一个条件)

	- div.class (`&&`必须满足两个条件)

- 派生选择器

	- 子代 div > p

	- 后代 div p

- 伪类
  超链接的伪类要遵守顺序：LoVeHAte，lvha

	- a:active

	- a:hover

	- a:link

	- a:visited

	- li:first-child

### 文本属性

- font-family

- Font-size

- Font-weight

- color

- Text-align

- Text-decoration

- Line-height

- Text-indent

### 背景属性

- background-color

- background-image

- background-repeat
  图片重复的规则

- background-position
  图片的位置

- background-attachment
  背景图片是否跟随拖动

### 列表属性

- none

- disc

- circle

- square

- decimal

- decimal-leading-zero

- lower-roman

- upper-roman

- lower-alpha

- upper-alpha

### 边框属性

- border-width

- border-color

- border-style

	- dotted

	- dashed

	- solid

	- ...

### 轮廓属性

- outline-width

- outline-color

- outline-style

	- dotted

	- dashed

	- solid

	- ...

### css定位

- 默认定位

	- 块级元素block
	  可以改变宽高，独占一行

		- h1~h6,p,div

	- 行内元素inline
	  不能改变宽高

		- a,b,span

	- 行内块元素inline-block
	  从左向右，水平排列(自动换行);可以改变宽高

		- Input,img 

	- 改变默认定位display

- 浮动定位float
  不仅可以靠着左边或右边。还可以消除“块级”的霸道特性

	- none

	- left

	- right

- 相对定位position: relative
  原来的位置进行比较，进行移动定位

	- top

	- left

	- right

	- bottom

- 绝对定位position: absolute
  本元素与已定位的祖先元素的距离  
  * 如果父级元素定位了，就以父级为参照物;   
  * 如果父级没定位，找爷爷级，爷爷定位了，以爷爷为参照物。   
  * 如果爷爷没定位，继续向上找，都没定位的话，body是最终选择。

	- top

	- left

	- right

	- bottom

- 固定定位position: fixed
  将元素的内容固定在页面的某个位置，当用户向下滚动页面时元素框并不随着移动

	- top

	- left

	- right

	- bottom

- z-index
  如果有重叠元素，使用z轴属性，定义上下层次。

### css3

- border-radius

- box-shadow 1， 2，3， 4

- background-image:linear-gradient([方向/角度]，颜色列表)

- background-image: radial-gradient(颜色列表)

- background-origin
  指定了背景图像的位置区域

	- border-box

	- padding-box

	- content-box

- background-clip
  调整背景色的位置

	- border-box

	- padding-box

	- content-box

- background-size
  图片的大小

	- cover

	- contain

- transition{1 2 3 4}

- 动画

	- @keyframes

	- animation{ 1 , 2 , 3 , 4 , 5 }

## JavaScript

### 基本语法

- 引入script

	- 在行内直接写方法

	- 在html文件中任何位置添加<script></script>

	- 引入外部script<script src=“...”></script>

- 变量

	- 弱类型的变量

		- 局部变量用 var 声明

		- 全局变量 不用声明

	- 自动类型转换

		- 任何类型+string = string

		- Boolean 类型+number=number

	- 类型转换

		- parseInt

		- parseFloat

		- typeof -> string/boolean/number/object

	- null

	- Undefined

	- 关系运算符

		- === 严格相等，类型和数据都相等

		- == 一般相等， 1==“1” ->true

		- !== 非严格相等

- 控制流

	- if else

	- switch case 可以使用string类型

	- for(var i=0; I<10;i++) ; for(var I: arr)

	- while(){}

- 字符串

	- length

	- toUpperCase/toLowerCase

	- charAt

	- indexOf

	- lastIndexOf

	- subString

	- subStr

	- replace

	- split

- 数组

	- 初始化

		- new Array() 

		- New Array(1,2)

		- []

	- toString()

	- join(str)

	- concat(arr)

	- push(element)

	- unshift(element)

	- slice(startIndex,[endIndex])
	  裁剪成新的数组

	- reverse()

	- sort()
	  默认排序结果是字符串排序，如果是数字排序，需要传入规则

	- splice(index, [length])
	  删除元素

- Math

	- 封装了常用的数学方法

- Number

	- fixed()

- 正则表达式

	- 创建方法

		- /xxxx/

		- New RegExp(“xxxx”)

	- test()

- Date

	- getFullYear()

	- getMonth()

	- ...

- 函数

	- 函数也是一种数据类型

	- function name(x, y) {.... return 3;}

	- Var name = (x, y)=>{... return 3;};

	- 参数属性

		- arguments

	- 全局函数

		- isNaN

		- eval

		- encodeURI

		- decodeURI

	- 闭包
	  指有权访问另一个函数作用域中的变量的函数，一般情况就是在一个函数中包含另一个函数

		- 作用
		  访问函数内部变量、保持函数在环境中一直存在，不会被垃圾回收机制处理;

		- 优缺点
		  * 闭包的优点: 方便调用上下文中声明的局部变量 逻辑紧密，可以在一个函数中再创建个函数，避 免了传参的问题  
		    
		  * 闭包的缺点: 因为使用闭包，可以使函数在执行完后不被销毁，保留在内存中，如果大量使用闭 包就会造 成内存泄露，内存消耗很大

- 系统方法Window

	- alert()

	- console.log()

	- document.write()
	  会替换掉整个页面的内容

	- confirm()

	- prompt()

### DOM(Document Object Model)

- DOM修改

	- 查询

		- document.getElementById()

		- document.getElementsByName()

		- document.getElementsByTagName()

		- document.querySelector()

	- 修改

		- Element.innerHTML

		- Element.style

		- Element.appendChild()

		- Document.createElement()

		- Element.setAttribute()

	- 删除

		- Element.prarentNode.removeChild(element)

	- 替换

		- elementOld.parentNode.replaceChild(elementNew, elementOld)

- DOM事件

	- Element.addEventListener()

	- Body->onload

	- Input -> onblur

	- Input -> onfocus

	- Tag->onclick

	- Tag->ondblclick

	- Tag->onmouseout

	- Tag->onmouseover

	- Window.onkeydown

	- Window.onkeyup

- 事件传递

	- 事件冒泡
	  ```js  
	  target.addEventListener(type, listener );  
	  ```

		- 自内向外

	- 事件捕获
	  ```js  
	  target.addEventListener(type, listener [, useCapture]);  
	  ```

		- 自外向内

	- 阻断

		- e.stopPropagation()

- 面向对象

	- new Object()
	  ```js  
	  var user = new Object();   
	  user.name = "吕布";  
	  user.age = 21;  
	  user.say = function(){  
	  	console.log("大家好，我	叫:"+this.name+"，我今	年"+this.age+"岁了!"); }  
	  user.say();  
	  ```

	- 构造函数
	  ```js  
	  function userinfo(name , age){  
	      this.name = name;  
	      this.age = age;  
	      this.say = function(){  
	  console.log("大家好，我叫:"+this.name+"，我今年"+this.age+"岁了!"); }  
	  }  
	  var user = new userinfo("詹姆斯",35); user.say();  
	  ```

	- 直接量
	  ```js  
	  var user = {  
	  username : "孙悟空", age : 527,  
	  say : function(){  
	  console.log("大家好，我叫:"+this.username+"，我今年"+this.age+"岁了!"); }  
	  };  
	  user.say();  
	  ```

- JSON(JavaScript Object Notation) 

	- 就是js里边的一种数据类型

### BOM(Browser Object Model)

- window对象

	- open()

	- screen

		- width

		- height

- location

	- reload()

	- href

- history

	- back()

	- forward()

	- go()

- navigator 浏览器信息

	- appCodeName

	- appName

	- appVersion

	- platform

	- userAgent

	- cookieEnabled

- localStorage

	- setItem()

	- getItem()

	- clear()

	- removeItem()

	- length

- sessionStorage

	- setItem()

	- getItem()

	- clear()

	- removeItem()

	- length

- setInterval()

- clearInterval()

- setTimeout()

### jQuery

jQuery是一个javascript库，jQuery凭借着简洁的语法和跨平台的兼容性，极大的简化了js操作DOM、处理  
事件、执行动画等操作

- jQuery对象

	- $(“xxx”)

	- Jq对象->dom对象：jdObject[0];  
	  jdObject.get(0);

	- dom对象->Jq对象：  
	  $(dom对象)

- 调用onload方法

	- $(function(){})

	- $(document).ready(function(){  
	  })

	- 事件派发
	  ```js  
	  $(function(){  
	          $("#btn2").click(function(){  
	  		alert("jQuery想试试");   
	  	})  
	  })  
	  ```

- jQuery选择器

	- 基本选择器:和css一模一样

	- 层级选择器:和css一模一样

	- 属性选择器:和css一模一样

	- 基本过滤选择器

		- :first

		- :last

		- :even

		- :odd

		- :eq(index)

		- :gt(index)

		- :lt(index)

		- :contains(text)

	- 表单选择器

		- :input

		- :text

		- :password

		- :radio

		- :checkbox

		- :submit

		- :image

		- :reset

		- :button

		- :file

		- :hidden

- 链式编程，使用“.”调用方法

- jQuery的DOM

	- 文本查询和修改

		- val([value])

		- text([value])

		- html([value])

	- 属性操作
	  推荐使用prop，而不是attr

		- attr(name[,value])

		- prop(name[,value])

		- removeAttr(name)

	- class相关

		- css(name[,value])

		- addClass(value)

		- removeClass(value)

		- toggleClass(value)

	- 插入对象

		- $("")

		- 父元素.append(element)

		- 父元素.prepend(element)

		- 兄弟元素.before(element)

		- 兄弟元素.after(element)

	- 删除对象

		- remove()
		  整个节点都删除掉

		- empty()
		  清空节点内的html

- 遍历的方式
  ```js  
  // Way 1   
    for(var i=0;i<元素数组.length;i++){ 元素数组[i];  
  }  
    
  // way2  
   jquery对象.each(function(index,element){});  
  其中，  
  index:就是元素在集合中的索引 element:就是集合中的每一个元素对象  
    
  //way3  
   $.each(jquery对象,function(index,element){});  
  其中，  
  index:就是元素在集合中的索引 element:就是集合中的每一个元素对象  
    
  //way4  
   for(变量 of jquery对象){ 变量;  
  }  
  其中， 变量:定义变量依次接受jquery数组中的每一个元素 jquery对象:要被遍历的jquery对象   
    
  ```

- jQuery动画

	- show([speed,[easing],[fn]])

	- hide([speed,[easing],[fn]])

	- toggle([speed],[easing],[fn])

	- slideDown([speed,[easing],[fn]])

	- slideUp([speed,[easing],[fn]])

	- slideToggle([speed],[easing],[fn])

	- $(selector).animate({params},speed,callback);
	  ```js  
	  $("button").click(()=>{  
	              $("div").animate({  
	                  height: "300px",  
	                  opacity: 0.4  
	              },"slow").animate({  
	                  width: "400px",  
	                  opacity: 0.6  
	              }, "slow").animate({  
	                  left: "300px"  
	              }, "slow").animate({  
	                  top: "300px"  
	              }, "slow", ()=>{  
	                  alert("done");  
	              });  
	          })  
	  ```

### ajax

* 概念： Ajax 即"Asynchronous Javascript And XML"(异步 JavaScript 和 XML)，是指一种创建交互式网页应用的网页开发技术。  
* 功能： Ajax 是一种在无需重新加载整个网页的情况下，能够更新部分网页的技术。通过在后台与服务器进行少量数据交 换，Ajax 可以使网页实现异步更新。这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。传 统的网页(不使用 Ajax)如果需要更新内容，必须重载整个网页页面。提升用户的体验

- Js原生请求

	- XMLHttpRequest
	  ```js  
	  // create Ajax  
	  var xhr = new XMLHttpRequest();  
	  // 监听状态变化  
	  xhr.onreadystatechange = function() {  
	      //readyState 1 2 3 4,(响应结束)  
	      //status 请求状态码  
	      if (xhr.readyState == 4 && xhr.status == 200) {  
	          addContent(xhr.responseText);  
	      }  
	  }  
	  // 请求方式 ， url， 是否异步  
	  xhr.open("GET", "http://localhost:8080/demo_ajax/DemoServlet", true);  
	  // 发送请求  
	  xhr.send();  
	  ```

- jQuery

	- $.get(url, [data], [callback], [type])
	  * url: 请求的服务器端url地址  
	  * data: 发送给服务器端的请求参数，格式可以是key=value，也可以是js对象   
	  * callback: 当请求成功后的回掉函数，可以在函数体中编写我们的逻辑代码  
	  * type: 预期的返回数据的类型，取值可以是 xml, html, script, json, text, _defaul等

	- $.post(url, [data], [callback], [type])
	  * url: 请求的服务器端url地址  
	  * data: 发送给服务器端的请求参数，格式可以是key=value，也可以是js对象   
	  * callback: 当请求成功后的回掉函数，可以在函数体中编写我们的逻辑代码  
	  * type: 预期的返回数据的类型，取值可以是 xml, html, script, json, text, _defaul等

	- $.ajax([settings])
	   **setting 是一个js对象**<br>  
	  * url: 请求的服务器端url地址  
	  * data: 发送到服务器的数据，可以是键值对形式，也可以是js对象形式  
	  * type: (默认: "GET") 请求方式 ("POST" 或 "GET")， 默认为 "GET"  
	  * dataType: 预期的返回数据的类型，取值可以是 xml, html, script, json, text, _defaul等   
	  * success: 请求成功后的回调函数  
	  * error: 请求失败时调用此函数  
	  * async: (默认: true) 默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false

- json

	- jackson

		- ObjectMapper

			- public String writeValueAsString(Object var1)

		- 注解的使用

			- @JsonIgnore
			  排除属性。

			- @JsonFormat
			  属性值的格式化,例如，针对日期格式:@JsonFormat(pattern = "yyyy-MM-dd")

### vue

MVVM的实践，分离View和Model

- 基本案例
  ```html  
  <script src="../js/vue.js"></script>  
  <body>  
      <div id="app">  
          <!-- 插值表达式 -->  
          {{message}}  
      </div>  
    
  </body>  
  <script>  
      var app = new Vue({  
          // 绑定元素  
          el: "#app",  
          data: {  
              message: "Hello lagou!!"  
          }  
      })  
  </script>  
  ```

	- 插值表达式
	  {{variable}}  
	  * 可以引用data中的变量  
	  * 可以写三目运算  
	  * 可以做简单的计算

	- el挂载
	  el(ement): 通过选择器关联标签，只会关联第一个找到的元素，只有挂载的标签内部才能使用差值表达式，不作用于html和body

	- data
	  * 当data变化时，插值表达式中的内容也会随之变化  
	  * 可以写js的任意数据类型，读取的时候也可以使用js的获取语句

	- methods
	  Vue绑定的方法都要写在methods或data里边，建议写在methods里边, 调用的时候，没参数直接写函数名就可以，有参数funname(params)  
	  
	  ```html  
	  <button @click="sub">sub</button>  
	    
	    
	  var app = new Vue({  
	          el: "#app",  
	          data: {  
	              count: 1  
	          },  
	          methods: {  
	              sub() {  
	                  this.count -= 1;  
	              }  
	          }  
	      });  
	  ```

- 常用指令

	- v-text
	  把内容插入到innerText中  
	  ```html  
	  <p v-text="message+'heheh'">cgharu</p>  
	  ```

	- v-html
	  把内容插入到innerHtml中  
	  ```html  
	  <p v-html=“html”>cgharu</p>  
	  ```
	  不建议使用

	- v-if和v-show
	  用来动态决定是否显示内容  
	  v-if：直接屏蔽元素，切换开销较大  
	  v-show ：把display设置为none，早期渲染开销较大  
	  ```html  
	  <p v-if=“true”>我是p标签中的内容</p>  
	  <p v-show="isShow">我是p标签中的内容</p>  
	  ```

	- v-on
	  关联绑定方法, 可以传$event  
	  ```html  
	  <body>  
	      <div id="app">  
	          <button v-on:click="add">++++</button>  
	          <button @click="sub">----</button>  
	          <hr>  
	          <button v-on:click="count += 1">22++++</button>  
	          <button @click="count -= 1">22----</button>  
	          <hr>  
	          <button @click="fun(count)">get count</button>  
	          <button @click="fun1($event)">get event</button>  
	          <h1>{{count}}</h1>  
	          <input type="text" name="name" id="uid" @keydown="fun2($event)">  
	      </div>  
	  </body>  
	  <script>  
	      //     <!-- 1.获取元素,操作元素  
	      // 点击按钮一 count值增加  
	      // 点击按钮二 count值减少 2.参数传递  
	      // 传递count  
	      // 传递$event : 如果有一个输入框,键盘按下,只能输入数字,不能输入其他内容. 需求:有一个文本输入框,只可以输入数字0-9 ,其他内容不能输入.  
	      // -->  
	      var app = new Vue({  
	          el: "#app",  
	          data: {  
	              count: 1  
	          },  
	          methods: {  
	              add: function() {  
	                  this.count += 1;  
	    
	              },  
	              sub: function() {  
	                  this.count -= 1;  
	              },  
	              fun: function(c) {  
	                  alert(c);  
	              },  
	              fun1: function(e) {  
	                  alert(e);  
	              },  
	              fun2: function(e) {  
	                  // alert(e.keyCode);  
	                  if (e.keyCode < 48 || e.keyCode > 57) {  
	                      // 阻止默认点击事件发生  
	                      e.preventDefault()  
	                  }  
	              }  
	          }  
	      });  
	  </script>  
	  ```

		- 常用键盘事件
		  @keyup.enter

			- .enter

			- .tab

			- .delete

			- .esc

			- .right

			- .space

			- .ctrl

			- .up

			- .alt

			- .down

			- .shift

			- .left

	- v-for
	  循环遍历元素，并生成对应的list元素  
	  ```html  
	  <p v-for="(element, index) in arr">{{element}} === {{index}}</p>  
	    
	          <ul>  
	              <li v-for="(value, key, index) in person">  
	                  {{key}} === {{value}} , {{index}}  
	              </li>  
	          </ul>  
	  ```

	- V-bind
	  关联属性  
	  ```html  
	  div id="app">  
	          <!-- 绑定图片资源 -->  
	          <img v-bind:src="imgUrl" />  
	          <!-- 简化语法 -->  
	          <img :src="imgUrl" />  
	          <!-- 三目方式 -->  
	          <div v-bind:class="isDivStyle?'divStyle':''"></div>  
	          <hr>  
	          <!-- 简化方式判断是否添加class -->  
	          <div :class="{divStyle:isDivStyle}"></div>  
	          <hr>  
	          <!-- 数组方式添加 -->  
	          <p v-bind:class="[fontColor , fontSize]"> the p</p>  
	      </div>  
	  ```

	- V-model
	  双向绑定，让data中的值随着input：text的值变化  
	  
	  ```html  
	  <body>  
	      <div id="app">  
	          <input type="text" name="name" id="id" v-model="message"> <br>  
	          <input type="button" value="点击按钮修改message" @click="update"><br>  
	          <h2>{{message}}</h2>  
	      </div>  
	  </body>  
	  <script>  
	      var app = new Vue({  
	          el: "#app",  
	          data: {  
	              message: "hello"  
	          },  
	          methods: {  
	              update: function() {  
	                  this.message = "hello update";  
	              }  
	          }  
	      })  
	  </script>  
	  ```

- [生命周期](http://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
![](https://vuejs.org/images/lifecycle.png)
  <br>*必须在第一层调用*  
  1. beforeCreate 在实例初始化之后，数据观测和事件配置之前被调用。  
  2. created 在实例创建完成后被立即调用。  
  3. beforeMount 在挂载开始之前被调用。  
  4. mounted el被新创建的vm.$el替换，并挂载到实例上去之后调用该钩子。   
  5. beforeUpdate 数据更新时调用，发生在虚拟DOM打补丁之前。  
  6. updated 由于数据更改导致的虚拟DOM重新渲染和打补丁，在这之后会调用该钩子。   
  7. beforeDestroy 实例销毁之前调用。  
  8. destroyed 实例销毁后调用。  

  ```html 
  <body>  
      <div id="app">  
          <p id="span">  
              {{message}}  
          </p>  
          <button @click="updateMsg">update</button>  
      </div>  
  </body>  
  <script>  
      new Vue({  
          el: "#app",  
          data: {  
              message: "April",  
          },  
          methods: {  
              show() {  
                  console.log("Hello world!!!!");  
              },  
          updateMsg() {  
                  this.message = "ANgie";  
              
          },  
  },  
          beforeCreate() {  
              // 无数据，未初始化数据  
              console.log("---------beforeCreate----------");  
              console.log("message:" + this.message);  
              console.log("dom:" + document.getElementById("span").innerText);  
              this.show();  
              console.log("---------beforeCreate----------");  
          },  
          created() {  
              // 有数据，未渲染  
              console.log("---------created----------");  
              console.log("message:" + this.message);  
              this.show();  
              console.log("dom:" + document.getElementById("span").innerText);  
              console.log("---------created----------");  
          },  
          // mount 渲染，挂上数据  
          beforeMount() {  
              console.log("---------beforeMount----------");  
              console.log("message:" + this.message);  
              this.show();  
              console.log("dom:" + document.getElementById("span").innerText);  
              console.log("---------beforeMount----------");  
          },  
          mounted() {  
              console.log("---------mounted----------");  
              console.log("message:" + this.message);  
              this.show();  
              console.log("dom:" + document.getElementById("span").innerText);  
              console.log("---------mounted----------");  
          },  
          beforeUpdate() {  
              console.log("---------beforeUpdate----------");  
              console.log("message:" + this.message);  
              this.show();  
              console.log("dom:" + document.getElementById("span").innerText);  
              console.log("---------beforeUpdate----------");  
          },  
          updated() {  
              console.log("---------updated----------");  
              console.log("message:" + this.message);  
              this.show();  
              console.log("dom:" + document.getElementById("span").innerText);  
              console.log("---------updated----------");  
          }  
      })  
  </script>  
    ```

- axios
  配合vue使用的网络请求插件，内部封装ajax了  
  ```html  
  <!-- 官网提供的 axios 在线地址 -->  
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script> 或者去github中下载源码  
  https://github.com/axios/axios  
  ```

	- get
	  ```js  
	  格式1: axios.get(地址?key=value&key2=value2).then(function(response){},function(error){});   
	  格式2: axios.get(地址,{params:{key1:value1...}}).then(function(response){},function(error){});  
	    
	    
	    
	  <body>  
	      <div id="app">  
	          <input type="button" value="生成笑话" @click="generateJoke"><br>  
	          <p>  
	              <ul v-for="(joke, index) in jokes">  
	                  <li>\{\{index+1\}\}.\{\{joke\}\}</li>  
	              </ul>  
	          </p>  
	      </div>  
	  </body>  
	  <script>  
	      new Vue({  
	          el: "#app",  
	          data: {  
	              jokes: [""]  
	          },  
	          methods: {  
	              generateJoke() {  
	                  // 这里需要引用一下this，不然在请求结果的方法体中无法使用  
	                  var that = this;  
	                  axios.get("https://autumnfish.cn/api/joke/list?num=3").then(function(response) {  
	                      console.log(response.data.jokes);  
	                      that.jokes = response.data.jokes;  
	                  }, function(error) {  
	                      console.log("error:" + error);  
	                  })  
	              }  
	          }  
	      })  
	  </script>  
	  ```

	- post
	  ```js  
	  axios.post(地址,{key:value,key2:value2}).then(function(response){},function(error){})  
	     
	  ```

	- axios.request(config)

	- axios.get(url[, config])

	- axios.delete(url[, config])

	- axios.head(url[, config])

	- axios.post(url[, data[, config]])

	- axios.put(url[, data[, config]])

	- axios.patch(url[, data[, config]])

### 数据可视化

- HighCharts
  [演示文档](https://www.highcharts.com.cn/docs/start-helloworld)
- ECharts
  [示例文档]([https://echarts.apache.org/en/tutorial.html#Get%20Started%20with%20ECharts%20in%205%20minutes)

