---
layout: post
title:  "WKWebView 与JS 交互，及内存泄漏解决"
date:   2019-10-11
categories: ios
---

### 使用 WKWebview 和JS交互

```swift
 {
    let config = WKWebViewConfiguration()
    let messageName = "test"
/*
Adding a scriptMessageHandler adds a function
     window.webkit.messageHandlers.<name>.postMessage(<messageBody>) for all frames
*/
// 添加消息监听, 一个类型使用一个messageName
    config.userContentController.add(self, name: messageName)
    webView = WKWebView(frame: view.bounds, configuration: config)
    webView?.navigationDelegate = self
}

// 实现代理方法就可以，接送JS送过来的数据
 extension WKUserContentController {
 func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "test"
        {
            //接收js发过来的数据
            print(message.body)
        }
    }
}
```
使用上面的方法就可以监听JS发过来的数据，响应调用，但是会出现内存泄漏

### 内存泄漏检测 debug memory graph
使用XCode 9 以后版本可以点击下方的 Debug Memory Graph，来查看当前应用在留在内存中的变量
![debug memory graph](/resource/ios_web/debugmemory.png)
![控制器没有释放](/resource/ios_web/memoryStack.png)
![webkit引用](/resource/ios_web/webscript.png)


从上图可以看到同一个使用了WKWebView的控制器，出现了多个实例, 被webkit引用 造成的内存泄漏

### 解除循环引用
问题出现在这一行，webview持有configuration, config.serContentController 持有 调用的控制器
```swift
 config.userContentController.add(self, name: messageName)
 webView = WKWebView(frame: view.bounds, configuration: config)
```
![image.png](/resource/ios_web/addHandler.png)

这里需要把self换成其他变量，可以使用下面的类把self包一下，变成弱引用即可
```swift
/// 解决 WKUserContentController 强引用控制器的问题
class AYScriptMessageHandler: NSObject, WKScriptMessageHandler {

    weak var delegate: WKScriptMessageHandler?
    
    init(_ delegate: WKScriptMessageHandler) {
        super.init()
        
        self.delegate = delegate
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        
        self.delegate?.userContentController(userContentController, didReceive: message)
    }
}

extension WKUserContentController {
    func addHandler(_ message: Any, name: String) {
        if let msg = message as? WKScriptMessageHandler {
            self.add(AYScriptMessageHandler(msg), name: name)
        }
    }
}
```
然后改一下上面添加监听的代码
```swift
// 把它换成
// config.userContentController.add(self, name: messageName)

config.userContentController.add(AYScriptMessageHandler(self), name: messageName)

// 或者
config.userContentController. addHandler(self, name: messageName)
```

这样就可以解决内存泄漏啦