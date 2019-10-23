---
layout: post
title:  "NSObject 的本质"
date:   2019-10-11
categories: ios
---

OC的类是使用C/C++的结构体来实现的

可以在terminal中运行如下代码, 把OC代码转换成c++代码，方便研究
```Object-C
xcrun -sdk iphoneos clang -arch arm64 -rewrite-objc objcFile.m -o objcFile_arm64.cpp
```

#### 一个NSObject对象占用多少内存？
* 系统分配了16个字节给NSObject对象（通过malloc_size函数获得）
```Object-C

 NSObject *obj = [[NSObject alloc] init];
        
        // 获取实例占有内存的空间 8
 NSLog(@"NSOject instance size -> %zu", class_getInstanceSize([NSObject class]));
        
```
* 但NSObject对象内部只使用了8个字节的空间（64bit环境下，可以通过class_getInstanceSize函数获得）
```Object-C
// 获取指针指向地址占用内存的空间 16
NSLog(@"Malloc size -> %zd", malloc_size((__bridge void *)obj));
```
查看源码，可以看到OC对象的最小占用空间是 16 bit，不足 16 bit 时补足到 16 bit.
![](/resource/nsobject/alloc_size.png)


reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)