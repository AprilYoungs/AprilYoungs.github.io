---
layout: post
title:  '如何对别人的iOS应用"动手脚"'
date:   2020-01-08
categories: ios
---
这篇文章会讲如何改造你手机里的iOS应用，让它成为你想要的样子，当然，这里只是抛砖引玉，关键还是要看读者的想象力。

[示例代码](https://github.com/AprilYoungs/Debug-Others-iOS-application)

### 准备工作
下载应用包

首先安装[PP助手](https://pro.25pp.com)到Mac端。
然后在PP助手的应用商店找到你想要“动手脚”的app包，这里以`开眼`为例
<div class="center">
<image src="/resource/iosInject/i4iphone1.jpg" style="width: 750px;"/>
</div>
<br>

点击下载完成后，点右上角的`Downloads`

<div class="center">
<image src="/resource/iosInject/i4iphone2.jpg" style="width: 750px;"/>
</div>
<br>
打开文件位置

<div class="center">
<image src="/resource/iosInject/i4iphone3.jpg" style="width: 750px;"/>
</div>

OKay, 已经获得一个越狱应用，越狱应用就是没有加密的应用

### 正文
使用`XCode`随意创建一个iOS工程，选择自己喜欢的语言，这里选择`Object-C`
<div class="center">
<image src="/resource/iosInject/project1.jpg" style="width: 750px;"/>
</div>

然后运行起来，让这个应用先运行到自己的iPhone上

<div class="center">
<image src="/resource/iosInject/project2.jpg" style="width: 750px;"/>
</div>

然后创建一个叫 [appSign.sh](/resource/iosInject/appSign.sh)的脚本文件，里边写上如下内容
```shell
# ${SRCROOT} 它是工程文件所在的目录
TEMP_PATH="${SRCROOT}/Temp"
#资源文件夹，我们提前在工程目录下新建一个APP文件夹，里面放ipa包
ASSETS_PATH="${SRCROOT}/APP"
#目标ipa包路径
TARGET_IPA_PATH="${ASSETS_PATH}/*.ipa"
#清空Temp文件夹
rm -rf "${SRCROOT}/Temp"
mkdir -p "${SRCROOT}/Temp"

#----------------------------------------
# 1. 解压IPA到Temp下
unzip -oqq "$TARGET_IPA_PATH" -d "$TEMP_PATH"
# 拿到解压的临时的APP的路径
TEMP_APP_PATH=$(set -- "$TEMP_PATH/Payload/"*.app;echo "$1")
# echo "路径是:$TEMP_APP_PATH"

#----------------------------------------
# 2. 将解压出来的.app拷贝进入工程下
# BUILT_PRODUCTS_DIR 工程生成的APP包的路径
# TARGET_NAME target名称
TARGET_APP_PATH="$BUILT_PRODUCTS_DIR/$TARGET_NAME.app"
echo "app路径:$TARGET_APP_PATH"

rm -rf "$TARGET_APP_PATH"
mkdir -p "$TARGET_APP_PATH"
cp -rf "$TEMP_APP_PATH/" "$TARGET_APP_PATH"

#----------------------------------------
# 3. 删除extension和WatchAPP.个人证书没法签名Extention
rm -rf "$TARGET_APP_PATH/PlugIns"
rm -rf "$TARGET_APP_PATH/Watch"

#----------------------------------------
# 4. 更新info.plist文件 CFBundleIdentifier
#  设置:"Set : KEY Value" "目标文件路径"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $PRODUCT_BUNDLE_IDENTIFIER" "$TARGET_APP_PATH/Info.plist"

#----------------------------------------
# 5. 给MachO文件上执行权限
# 拿到MachO文件的路径
APP_BINARY=`plutil -convert xml1 -o - $TARGET_APP_PATH/Info.plist|grep -A1 Exec|tail -n1|cut -f2 -d\>|cut -f1 -d\<`
#上可执行权限
chmod +x "$TARGET_APP_PATH/$APP_BINARY"

#----------------------------------------
# 6. 重签名第三方 FrameWorks
TARGET_APP_FRAMEWORKS_PATH="$TARGET_APP_PATH/Frameworks"
if [ -d "$TARGET_APP_FRAMEWORKS_PATH" ];
then
for FRAMEWORK in "$TARGET_APP_FRAMEWORKS_PATH/"*
do

#签名
/usr/bin/codesign --force --sign "$EXPANDED_CODE_SIGN_IDENTITY" "$FRAMEWORK"
done
fi

#注入
#InjectFrameworkName=AprilInject
#./yololib "$TARGET_APP_PATH/$APP_BINARY" "Frameworks/$InjectFrameworkName.framework/$InjectFrameworkName"
```

然后你需要下载一个 CLI 软件[yololib](/resource/iosInject/appSign.sh), 点击链接下载即可

打开工程文件夹, 先创建一个 `APP`的文件夹，把准备好的`*.ipa`包放进去，还有`appSign.sh`、`yololib`，全放进去，如下图
<div class="center">
<image src="/resource/iosInject/project3.jpg" style="width: 750px;"/>
</div>

然后在工程的 `Build Phases` 添加 `New Run Script Phase`
<div class="center">
<image src="/resource/iosInject/project4.jpg" style="width: 750px;"/>
</div>

在 `shell` 中写上，这样每次`XCode`运行程序的时候都会运行我们的脚本
```shell
${SRCROOT}/appSign.sh
```
`${SRCROOT}`表示取相对根地址
<div class="center">
<image src="/resource/iosInject/project5.jpg" style="width: 750px;"/>
</div>
<br>

Okay, 见证奇迹的时候到了， 现在再次运行我们的工程
<div class="center">
<image src="/resource/iosInject/project6.jpg" style="width: 400px;"/>
</div>
<br>

糟糕，收到这个的错误，不过没关系，点`OK`，再次运行就好

<div class="center">
<image src="/resource/iosInject/project7.png" style="width: 400px;"/>
</div>
<br>

<div class="center">
<image src="/resource/iosInject/project8.jpg" style="width: 700px;"/>
</div>
<br>

现在我们可以用 `XCode` 来`debug`别人的应用了

### 注入Framework
首先新建一个`Framework`
<div class="center">
<image src="/resource/iosInject/project9.jpg" style="width: 700px;"/>
</div>
<br>
<div class="center">
<image src="/resource/iosInject/project10.jpg" style="width: 700px;"/>
</div>
<br>

创建一个继承 `NSObject`的类，在`+load`中打印点东西，确认注入成功
<div class="center">
<image src="/resource/iosInject/project11.jpg" style="width: 700px;"/>
</div>
<br>

打开脚本中屏蔽的最后一段，把`InjectFrameworkName`改成自己的 `framework`名
<div class="center">
<image src="/resource/iosInject/project12.jpg" style="width: 700px;"/>
</div>
<br>

重新运行一下程序，如果遇到下面的提示
<div class="center">
<image src="/resource/iosInject/project14.jpg" style="width: 300px;"/>
</div>
<br>

在 `terminal` 中运行如下代码就可以, 它让mac信任这个软件
```shell
xattr -rc yololib
```

程序运行起来后，我们可以看到控制台打印了🌝🌝🌝🌝🌝🌝🌝， 说明`framework`注入成功
<div class="center">
<image src="/resource/iosInject/project13.jpg" style="width: 700px;"/>
</div>
<br>

接下来就可以在 `+load`替换原来的方法<br>
比如可以写一下如下的代码
```objective-c
Method m1 = class_getInstanceMethod(objc_getClass("QLUserCenterViewController"), sel_registerName("searchButtonClicked:"));
Method m2 = class_getInstanceMethod(objc_getClass("AYInjection"), sel_registerName("searchButtonClicked:"));
method_exchangeImplementations(m1, m2);
```

