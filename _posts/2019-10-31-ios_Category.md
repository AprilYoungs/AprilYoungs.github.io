---
layout: post
title:  "Category"
date:   2019-10-31
categories: ios
---

`Category` 即分类，`Objective-C`中的分类的可以给`源类`增加一些类方法、实例方法、还有遵守更多协议(`protocol`), 分类如果有源类方法的实现，会覆盖`源类`的方法.

### Category 的使用
下面定义一个`AYPerson`类，它是分类的`源类`
```objectivec
@interface AYPerson : NSObject
@property(nonatomic, assign) NSInteger age;
@property(nonatomic, strong) NSString *name;
+ (void)classPerson;
- (void)thePerson;
@end

@implementation AYPerson
+ (void)classPerson
{
    NSLog(@"%@-%@", self, NSStringFromSelector(_cmd));
}
- (void)thePerson
{
    NSLog(@"%@-%@", self, NSStringFromSelector(_cmd));
}
@end
```
再定义一个分类`AYPerson (Run)`
```objectivec
@interface AYPerson (Run)<NSCopying, NSCoding>
+ (void)cateRun;
- (void)run;
- (void)runrun;
@end

@implementation AYPerson (Run)
+(void)cateRun
{
    NSLog(@"%@-%@", self, NSStringFromSelector(_cmd));
}
- (void)run
{
    NSLog(@"%@-%@", self, NSStringFromSelector(_cmd));
}
- (void)runrun
{
    NSLog(@"%@-%@", self, NSStringFromSelector(_cmd));
}
@end
```
使用的时候导入分类头文件 `#import "AYPerson+Run.h"`
```objectivec
AYPerson *p = [[AYPerson alloc] init];
[p thePerson];
[p run];
[p runrun];

[AYPerson classPerson];
[AYPerson cateRun];

/**
 <AYPerson: 0x100544010>-thePerson
 <AYPerson: 0x100544010>-run
 <AYPerson: 0x100544010>-runrun
 AYPerson-classPerson
 AYPerson-cateRun
 */
```
分类的方法会合并到源类的方法中，可以跟调用源类方法一样调用

### Category 的底层结构
可以使用如下指令把`object-c`的 `.m` 文件编译出`c++`代码，用来窥探`category`的实现方法
```c
xcrun -sdk iphoneos clang -arch arm64 -rewrite-objc AYPerson+Run.m
```
关于`xcrun`的更多使用可以使用`xcrun --help`查看
下面是编译好之后的 `AYPerson+Run.cpp` 的部分关键代码

```cpp
// 类结构体
struct _class_t {
	struct _class_t *isa;
	struct _class_t *superclass;
	void *cache;
	void *vtable;
	struct _class_ro_t *ro;
};

// 分类结构体
struct _category_t {
	const char *name;   //源类的名字
	struct _class_t *cls;   //指向源类的指针
	const struct _method_list_t *instance_methods; //实例方法列表
	const struct _method_list_t *class_methods; //类方法列表
	const struct _protocol_list_t *protocols;   //遵守的协议列表
	const struct _prop_list_t *properties;  //属性列表，没有使用
};
```
创建 `_category_t` 分了结构体， 类的关联使用独立函数`OBJC_CATEGORY_SETUP_$_AYPerson_$_Run`，说明关联类是异步操作.
```cpp
static struct _category_t _OBJC_$_CATEGORY_AYPerson_$_Run __attribute__ ((used, section ("__DATA,__objc_const"))) = 
{
	"AYPerson",
	0, // &OBJC_CLASS_$_AYPerson,
	(const struct _method_list_t *)&_OBJC_$_CATEGORY_INSTANCE_METHODS_AYPerson_$_Run,
	(const struct _method_list_t *)&_OBJC_$_CATEGORY_CLASS_METHODS_AYPerson_$_Run,
	(const struct _protocol_list_t *)&_OBJC_CATEGORY_PROTOCOLS_$_AYPerson_$_Run,
	0,
};
static void OBJC_CATEGORY_SETUP_$_AYPerson_$_Run(void ) {
	_OBJC_$_CATEGORY_AYPerson_$_Run.cls = &OBJC_CLASS_$_AYPerson;
}
#pragma section(".objc_inithooks$B", long, read, write)
__declspec(allocate(".objc_inithooks$B")) static void *OBJC_CATEGORY_SETUP[] = {
	(void *)&OBJC_CATEGORY_SETUP_$_AYPerson_$_Run,
};

```