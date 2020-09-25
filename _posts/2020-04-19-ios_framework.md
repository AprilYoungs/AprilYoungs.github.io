---
layout: post
title:  "How to build an iOS framework"
date:   2020-04-19
categories: ios
---

In this post, you'll learn how to create an iOS framework written by swift and Objective-C, adding bundle resources, and how to integrate the framework to your project. [sample code](https://github.com/AprilYoungs/FrameWorkDemo)

### Initialize an empty Framework
#### Create a framework
Create a new project, and choose `Framework`
<br>![](/resource/framework/chooseFramework.jpg)

Let me choose swift

<br>![](/resource/framework/chooseFramework2.jpg)

So I have this project here
<br>![](/resource/framework/chooseFramework3.jpg)

#### Create a resource bundle
File->New->Target, choose `macOS`, search for bundle
<br>![](/resource/framework/bundle.jpg)
<br>![](/resource/framework/bundle2.jpg)

select this bundle, go to Build `Setting->Base SDK`, set the value to `iOS`
<br>![](/resource/framework/bundle3.jpg)

Select the framework->Build Phases->Dependencies, add bundle
<br>![](/resource/framework/bundle4.jpg)

<br>Now this project is ready to used, let's integrate this framework to an iOS project. And write some codes.

### Integrate with project
Create a new project

<br>![](/resource/framework/demo.jpg)

Drag the framework project to the new created project.

<br>![](/resource/framework/demo2.jpg)
Select your project, add this demo framework
<br>![](/resource/framework/demo3.jpg)
Go to Build Phases->Copy Bundle Resources, drag the bundle to the resources list.
<br>![](/resource/framework/demo4.jpg)

All set let's write some codes.

I will just write some simple code here, a viewcontroll with a xib, and add an image xcassets.
<br>![](/resource/framework/coding1.jpg)
<br>![](/resource/framework/coding2.jpg)
Because apple woundn't accept framework with resources inside, so we need to move any resource files that is not code file to the resource bundle.
<br>![](/resource/framework/coding3.jpg)
<br>![](/resource/framework/coding4.jpg)
Here's my xib for `ToolViewController`.
<br>![](/resource/framework/coding5.jpg)<br>
Now I will import my framework, and try to use the `ToolViewController`, but it seems XCode can't find this class. This is cause by the [access control](https://docs.swift.org/swift-book/LanguageGuide/AccessControl.html). The default one is `internal`, let's set `ToolViewController` to be `public`. And try again.
<br>![](/resource/framework/coding7.jpg)
<br>![](/resource/framework/coding8.jpg)<br>
Now I can run the project without error, but when I click `setImage`. Nothing happen, it seems I can't find the image with this line.
```swift
imageView2.image = UIImage(named: "peisongcheSVG")
```
Because with `UIImage(named: "imageName")`, it will just search for image inside our `main bundle`, apparently, my image is not inside the `main bundle`
<br>![](/resource/framework/coding9.jpg)

Set the right bundle, and we'll found the image.
<div style="text-align: center;">
    <image src="/resource/framework/coding10.jpg" style="width: 375px; max-width:auto;"/>
</div>

#### Code with Objective-C 
What if I want to write with Objective-C.
<br>![](/resource/framework/objc1.jpg)

Write something
<br>![](/resource/framework/objc2.jpg)

Import header files
<br>![](/resource/framework/objc3.jpg)

And yet can't find the class
<br>![](/resource/framework/objc4.jpg)

You need to set the header file to be `public`, the default value is `project`
<br>![](/resource/framework/objc5.jpg)

Now it work.

#### Export and add framework to another project
<br>![](/resource/framework/addFrameWork5.jpg)
<br>![](/resource/framework/addFrameWork1.jpg)

I will just copy `MyFrameWorkDemo` and remove the reference to Framework project.
<br>![](/resource/framework/addFrameWork2.jpg)

Open the framework project, drag the framework and bundle to the new project. Then run the new project.
<br>![](/resource/framework/addFrameWork4.jpg)

You will probably get this error.
<br>![](/resource/framework/addFrameWork3.jpg)

Select you project and set the `framework Embed` to `Embeded&Sign`. Everything will work just like before.

### Add the framework project to workspace
I just show you how to develop a framework and integrate to a project.
But what if your project need to use `CocoaPod`, or your framework need to use `CocoaPod`.

<br>![](/resource/framework/workspace1.jpg)

I will make a copy of my demo project and my framework project.

<br>![](/resource/framework/workspace2.jpg)

Create a workspace.

<br>![](/resource/framework/workspace3.jpg)

Drag the demo project and the framework project into the workspace

<br>![](/resource/framework/workspace4.jpg)

Same as before, drag the framework

<br>![](/resource/framework/workspace5.jpg)

Drag the bundle.
And everything will work fine. 
But look at the path of the bundle, if I give my project to you, you probably can't run the project without error. This is not the elegant way.

#### Copy bundle when building
Now I will remove this bundle here. And add a run script.
<br>![](/resource/framework/workspace6.jpg)
<br>![](/resource/framework/workspace7.jpg)
```shell
yes | cp -R -L -fi "${BUILT_PRODUCTS_DIR}/MyFrameworkBundle.bundle" "${BUILT_PRODUCTS_DIR}/${CONTENTS_FOLDER_PATH}/"
```
Now try again, everything should work. 

#### Add other frameworks through Cocoapod
<br>![](/resource/framework/workspace8.jpg)
Open your project in terminal, and try `pod init`
I will add `SDWebImage`, so inside my podfile I write this
``` ruby
platform :ios, '9.0'
use_frameworks!
# remove warning [!] [Xcodeproj] Generated duplicate UUIDs
install!'cocoapods',:deterministic_uuids=>false

# Add specific workspace if you have multi sub projects
workspace 'MyFrameWorkDemo.xcworkspace'

# reuse pods
def pods
  pod 'SDWebImage', '~> 5.0'
end

target 'SampleFramework' do
  # find the project
  project '../SampleFrameworkForPod/SampleFramework.xcodeproj'
  pods
end

target 'MyFrameWorkDemo' do
  pods
end
```
<br>![](/resource/framework/workspace9.jpg)
run `pod install`, close your project and open again, you will find `Pod` is integrate to you workspace.
<br>![](/resource/framework/workspace10.jpg)
<br>![](/resource/framework/workspace11.jpg)

import and try the `SDWebImage` inside my framework
<div style="text-align: center;">
    <image src="/resource/framework/workspace12.png" style="width: 375px; max-width:auto;"/>
</div>


So far so good. How about create my owe cocoapod and share my framework?

### Create your Cocoapod
I will make another copy of the demo project and the framework project.
<br>![](/resource/framework/pod1.jpg)

Now go to `SampleFrameworkForPod` and create a pod config file
<br>![](/resource/framework/pod2.jpg)
```shell
pod spec create SampleFramework
```
<br>![](/resource/framework/pod4.jpg)

You will get this file `*.podspec`, open it and config you project. For more reference [Podspec Syntax Reference](https://guides.cocoapods.org/syntax/podspec.html)
<br>![](/resource/framework/pod5.jpg)
<br>![](/resource/framework/pod6.jpg)
Open your project and remove all the config that relate to last pod setting. And the link to framework.
<br>![](/resource/framework/pod7.jpg)<br>
Create a new pod file
inside the new podfile, just 
```ruby
 pod "SampleFramework", { :path => "../SampleFrameworkForPod"}
```
<br>![](/resource/framework/pod8.jpg)

`pod install`
and open the new generate `MyFrameWorkDemo.xcworkspace`

<br>![](/resource/framework/pod9.jpg)

You should run the project without error, but wait

<br>![](/resource/framework/pod3.jpg)

When you click `jump to framework`, you will see this error.

<br>![](/resource/framework/pod10.jpg)

The bundle is added to different location, you need to update you bundle path just like the code above.

<br>![](/resource/framework/pod11.jpg)

Remove this two files and `pod install` again, or the code udpate wouldn't work. Then run the project again, it should run without error.

----
Reference: 
* [iOS Tutorial: Building Dynamic Frameworks](https://www.youtube.com/watch?v=9Ynv8X9KcHc)
* [Creating a Framework for iOS](https://www.raywenderlich.com/5109-creating-a-framework-for-ios)
* [Resource Bundles & Static Library in iOS](https://medium.com/@09mejohn/resource-bundles-in-ios-static-library-beba3070fafd)
* [Build Setting Reference](https://developer.apple.com/library/archive/documentation/DeveloperTools/Reference/XcodeBuildSettingRef/1-Build_Setting_Reference/build_setting_ref.html)
* [Better Xcode Run Script Build Phases](https://www.mokacoding.com/blog/better-build-phase-scripts/)