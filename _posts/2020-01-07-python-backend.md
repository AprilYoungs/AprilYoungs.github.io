---
layout: post
title:  "使用python搭建简单的后台"
date:   2020-01-07
categories: python
---
[just give me the code](https://github.com/AprilYoungs/python-backend/tree/master)
### 环境搭建
首先确认安装了 python3.x, 可以去官网下载, [python org](https://www.python.org/downloads/)
![](/resource/pythonbackend/pythonorg.jpg)

然后安装[Visual Studio Code](https://code.visualstudio.com), 因为它可以很方便的编辑python 和 h5 等语言，还可以debug，打断点
![](/resource/pythonbackend/vscode1.jpg)

然后安装python插件
![](/resource/pythonbackend/vscode.jpg)

安装了python之后终端输入
```shell
pip3 install tornado
```
安装`python`的`rest`框架 `tornado`
![](/resource/pythonbackend/installpackage.jpg)

### 创建一个简单的get请求
创建第一个接口， 使用 8801 端口
![](/resource/pythonbackend/runcode1.jpg)

使用debug 模型运行
![](/resource/pythonbackend/runcode2.jpg)

启动成功之后可以看到当成程序的状态
![](/resource/pythonbackend/runcode3.jpg)

因为是在本机运行的，所以这里使用 `localhost:8801` 作为根地址
![](/resource/pythonbackend/runcode4.jpg)
可以看到请求结果，第一个api创建成功了

也可以使用 `127.0.0.1` 也是本机地址
<div class="center">
<image src="/resource/pythonbackend/url1.jpg" style="width: 400px;"/>
</div>

或者使用本机的ip地址，这样在同一个局域网下都可以访问
<div class="center">
<image src="/resource/pythonbackend/url2.jpg" style="width: 500px;"/>
</div>
macOs 查看ip的方式
<div class="center">
<image src="/resource/pythonbackend/url3.jpg" style="width: 500px;"/>
</div>

至此我们已经搭建好环境，并创建了一个get请求

### get的其他形式
#### 返回h5
```python
app = tornado.web.Application([
        # create the root request, return a html
        (r"/", rootRequestHandler),
        (r"/quoting", quotingRequestHandler)
    ])

# deal with the root request
class rootRequestHandler(tornado.web.RequestHandler):
    def get(self):
        # return and a html from a file
        self.render("index.html")
```
创建一个根请求，处理get请求，返回一个本地的h5文件，访问这个链接可以看到渲染好的网页
<div class="center">
<image src="/resource/pythonbackend/url4.jpg" style="width: 500px;"/>
</div>

#### 处理get参数
```python
app = tornado.web.Application([
        # create the root request, return a html
        (r"/", rootRequestHandler),
        # the basic get, no parameter
        (r"/quoting", quotingRequestHandler),
        # get with query params
        (r"/isEven", queryParamRequestHandler)
    ])

class queryParamRequestHandler(tornado.web.RequestHandler):
    def get(self):
        # deal with arguments
        num = self.get_argument("num")
        if num.isdigit():
            r = "odd" if int(num) % 2 else "even"
            self.write(f"The number {num} is {r}")
        else:
            self.write(f"{num} is not a valid number.")
```
<div class="center">
<image src="/resource/pythonbackend/getparam1.jpg" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/pythonbackend/getparam2.jpg" style="width: 500px;"/>
</div>

<div class="center">
<image src="/resource/pythonbackend/getparam3.jpg" style="width: 500px;"/>
</div>

#### 处理某种类型的get请求
```python
app = tornado.web.Application([
        # create the root request, return a html
        (r"/", rootRequestHandler),
        # the basic get, no parameter
        (r"/quoting", quotingRequestHandler),
        # get with query params
        (r"/isEven", queryParamRequestHandler),
        # [A-z] A to z, "+" infinity
        (r"/students/([A-z]+)/([0-9]+)", resourceParamRequestHandler)
    ])

class resourceParamRequestHandler(tornado.web.RequestHandler):
    def get(self, studentName, courseId):
        # get regex path, this can just return html, or anything you like
        self.write(f"Welcome {studentName} the course you are enter is {courseId}")
```
`[A-z]+` 所有字母，`[0-9]+` 所有数字
`/students/([A-z]+)/([0-9]+)`接收`students/`后面跟着字母组合，数字组合的链接
<div class="center">
<image src="/resource/pythonbackend/getparam4.jpg" style="width: 500px;"/>
</div>
链接没有处理，会出现 404 异常
<div class="center">
<image src="/resource/pythonbackend/getparam5.jpg" style="width: 500px;"/>
</div>

#### 使用json返回服务器数据
```python
import json

app = tornado.web.Application([
        # create the root request, return a html
        (r"/", rootRequestHandler),
        # the basic get, no parameter
        (r"/quoting", quotingRequestHandler),
        # get with query params
        (r"/isEven", queryParamRequestHandler),
        # [A-z] A to z, "+" infinity
        (r"/students/([A-z]+)/([0-9]+)", resourceParamRequestHandler),
        # load and show server file
        (r"/list", listRequestHandler)
    ])

class listRequestHandler(tornado.web.RequestHandler):
    def get(self):
        with open("data.txt", "r") as f:
            # read file
            content = f.read().splitlines()
            # to json
            jsonContent = json.dumps(content)
            # return a json read from server
            self.write(jsonContent)
```
<div class="center">
<image src="/resource/pythonbackend/getData1.jpg" style="width: 700px;"/>
</div>
<div class="center">
<image src="/resource/pythonbackend/getData2.jpg" style="width: 500px;"/>
</div>

### Post请求
`Post`请求通常用来更改数据, 而且只能通过代码，或者其他工具来请求

#### Post 添加数据
```python
class listRequestHandler(tornado.web.RequestHandler):
    def get(self):
        with open("data.txt", "r") as f:
            # read file
            content = f.read().splitlines()
            # to json
            jsonContent = json.dumps(content)
            # return a json read from server
            self.write(jsonContent)
    def post(self):
        with open("data.txt", "a") as f:
            # just get the argument, body first then url
            print(f"{self.get_argument('animal')}")
            # just get the query argument in the url
            print(f"{self.get_query_argument('animal')}")
            # just get the body argument in "form-data"
            # print(f"{self.get_body_argument('animal')}")
            animal = self.get_argument("animal")
            f.write("\n"+animal)
            self.write({"msg": f"{animal} is successful added"})
```
在前面获取动物列表的请求处理中添加`post`的处理，使用[postman](https://www.getpostman.com)来验证
<div class="center">
<image src="/resource/pythonbackend/post1.jpg" style="width: 500px;"/>
</div>

#### Post 上传文件
因为需要和h5联动，可以查看[示例demo](https://github.com/AprilYoungs/python-backend/tree/master)

### 查看服务器的图片资源
```python
app = tornado.web.Application([
        # create the root request, return a html
        (r"/", rootRequestHandler),
        # the basic get, no parameter
        (r"/quoting", quotingRequestHandler),
        # get with query params
        (r"/isEven", queryParamRequestHandler),
        # [A-z] A to z, "+" infinity
        (r"/students/([A-z]+)/([0-9]+)", resourceParamRequestHandler),
        # load and show server file
        (r"/list", listRequestHandler)
    ])
    #  read server's files
        #  The handler constructor requires a ``path`` argument, which specifies the
        #  local root directory of the content to be served.
        (r"/img/(.*)", tornado.web.StaticFileHandler, {"path": "img"})
    ])
```
`r"/img/(.*)"`可以通过这个路径访问资源文件
<div class="center">
<image src="/resource/pythonbackend/getimg1.jpg" style="width: 400px;"/>
</div>
访问服务器上的文件
<div class="center">
<image src="/resource/pythonbackend/getimg2.jpg" style="width: 500px;"/>
</div>

reference: <br>
[Python on the Backend | Udemy](https://www.udemy.com/course/python-on-the-back-end-for-beginners-http-server/)