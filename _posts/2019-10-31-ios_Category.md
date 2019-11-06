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
创建了 `_category_t` 结构体， 类的关联使用独立函数`OBJC_CATEGORY_SETUP_$_AYPerson_$_Run`，说明关联类是异步操作.
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
objc 源码分析，category 的调用过程
`objc-os.mm`
```cpp
/***********************************************************************
* _objc_init
* Bootstrap initialization. Registers our image notifier with dyld.
* Called by libSystem BEFORE library initialization time
**********************************************************************/
void _objc_init(void)
{
    static bool initialized = false;
    if (initialized) return;
    initialized = true;
    // fixme defer initialization until an objc-using image is found?
    environ_init();
    tls_init();
    static_init();
    lock_init();
    exception_init();

    _dyld_objc_notify_register(&map_images, load_images, unmap_image);
}
```
程序启动加载objc初始化, 注册模块  `_dyld_objc_notify_register`, `map_images`
```cpp
/***********************************************************************
* map_images
* Process the given images which are being mapped in by dyld.
* Calls ABI-agnostic code after taking ABI-specific locks.
*
* Locking: write-locks runtimeLock
**********************************************************************/
void
map_images(unsigned count, const char * const paths[],
           const struct mach_header * const mhdrs[])
{
    mutex_locker_t lock(runtimeLock);
    return map_images_nolock(count, paths, mhdrs);
}
```
```cpp
/***********************************************************************
* map_images_nolock
* Process the given images which are being mapped in by dyld.
* All class registration and fixups are performed (or deferred pending
* discovery of missing superclasses etc), and +load methods are called.
*
* info[] is in bottom-up order i.e. libobjc will be earlier in the 
* array than any library that links to libobjc.
*
* Locking: loadMethodLock(old) or runtimeLock(new) acquired by map_images.
**********************************************************************/
void 
map_images_nolock(unsigned mhCount, const char * const mhPaths[],
                  const struct mach_header * const mhdrs[])
{
	... 搜索所有类信息
	if (hCount > 0) {
        _read_images(hList, hCount, totalClasses, unoptimizedTotalClasses);
    	}
	...
}
```
`_read_images`读取模块
```cpp
/***********************************************************************
* _read_images
* Perform initial processing of the headers in the linked 
* list beginning with headerList. 
*
* Called by: map_images_nolock
*
* Locking: runtimeLock acquired by map_images
**********************************************************************/
void _read_images(header_info **hList, uint32_t hCount, int totalClasses, int unoptimizedTotalClasses)
{
	header_info *hi;
    uint32_t hIndex;
    size_t count;
    size_t i;
    Class *resolvedFutureClasses = nil;
    size_t resolvedFutureClassCount = 0;
    static bool doneOnce;
    TimeLogger ts(PrintImageTimes);

    runtimeLock.assertLocked();

#define EACH_HEADER \
    hIndex = 0;         \
    hIndex < hCount && (hi = hList[hIndex]); \
    hIndex++

    // Discover classes. Fix up unresolved future classes. Mark bundle classes.
	...

    ts.log("IMAGE TIMES: discover classes");

    // Fix up remapped classes
    // Class list and nonlazy class list remain unremapped.
    // Class refs and super refs are remapped for message dispatching.
    ...
    ts.log("IMAGE TIMES: remap classes");

    // Fix up @selector references
	...

    ts.log("IMAGE TIMES: fix up selector references");

    // Discover protocols. Fix up protocol refs.
	...

    ts.log("IMAGE TIMES: discover protocols");

    // Fix up @protocol references
    // Preoptimized images may have the right 
    // answer already but we don't know for sure.
	...

    ts.log("IMAGE TIMES: fix up @protocol references");

    // Realize non-lazy classes (for +load methods and static instances)
	...

    ts.log("IMAGE TIMES: realize non-lazy classes");

    // Realize newly-resolved future classes, in case CF manipulates them
	...

    ts.log("IMAGE TIMES: realize future classes");

    // Discover categories.  处理加载到的分类
    for (EACH_HEADER) {
        category_t **catlist = 
            _getObjc2CategoryList(hi, &count);
			// 获取分类列表
        bool hasClassProperties = hi->info()->hasCategoryClassProperties();

        for (i = 0; i < count; i++) {
            category_t *cat = catlist[i];
            Class cls = remapClass(cat->cls);

	   // 寻找分类的源类，没有找到就跳过
            if (!cls) {
                // Category's target class is missing (probably weak-linked).
                // Disavow any knowledge of this category.
                catlist[i] = nil;
                if (PrintConnecting) {
                    _objc_inform("CLASS: IGNORING category \?\?\?(%s) %p with "
                                 "missing weak-linked target class", 
                                 cat->name, cat);
                }
                continue;
            }

            // Process this category. 
            // First, register the category with its target class. 
            // Then, rebuild the class's method lists (etc) if 
            // the class is realized. 
            bool classExists = NO;
            if (cat->instanceMethods ||  cat->protocols  
                ||  cat->instanceProperties) 
            {
                addUnattachedCategoryForClass(cat, cls, hi);
                if (cls->isRealized()) {
                    remethodizeClass(cls);
                    classExists = YES;
                }
                if (PrintConnecting) {
                    _objc_inform("CLASS: found category -%s(%s) %s", 
                                 cls->nameForLogging(), cat->name, 
                                 classExists ? "on existing class" : "");
                }
            }

            if (cat->classMethods  ||  cat->protocols  
                ||  (hasClassProperties && cat->_classProperties)) 
            {
                addUnattachedCategoryForClass(cat, cls->ISA(), hi);
                if (cls->ISA()->isRealized()) {
                    remethodizeClass(cls->ISA());
                }
                if (PrintConnecting) {
                    _objc_inform("CLASS: found category +%s(%s)", 
                                 cls->nameForLogging(), cat->name);
                }
            }
        }
    }

    ts.log("IMAGE TIMES: discover categories");

    // Category discovery MUST BE LAST to avoid potential races 
    // when other threads call the new category code before 
    // this thread finishes its fixups.

    // +load handled by prepare_load_methods()
	...
    // Print preoptimization statistics
    ...
}
```
上面读取模块的实现中只保留了和处理 `category` 有关的代码，关键是这个操作
```c
// Process this category. 
处理分类
// First, register the category with its target class. 
首先，注册分类到目标类
// Then, rebuild the class's method lists (etc) if 
然后，如歌目标类已经实现，把分类的方法合并到目标类
// the class is realized. 
```
再来看一下`remethodizeClass`的实现，这个方法把分类方法合并到目标类中
```cpp

/***********************************************************************
* remethodizeClass
* Attach outstanding categories to an existing class.
* Fixes up cls's method list, protocol list, and property list.
* Updates method caches for cls and its subclasses.
* Locking: runtimeLock must be held by the caller
**********************************************************************/
static void remethodizeClass(Class cls)
{
    category_list *cats;
    bool isMeta;

    runtimeLock.assertLocked();

    isMeta = cls->isMetaClass();

    // Re-methodizing: check for more categories
    if ((cats = unattachedCategoriesForClass(cls, false/*not realizing*/))) {
        if (PrintConnecting) {
            _objc_inform("CLASS: attaching categories to class '%s' %s", 
                         cls->nameForLogging(), isMeta ? "(meta)" : "");
        }
        
        attachCategories(cls, cats, true /*flush caches*/);        
        free(cats);
    }
}
```
`attachCategories` 把分类列表 和 目标类 合并, 把类列表，属性列表，协议列表添加到目标类中，添加的顺序是 最老的在前面。
```cpp
// Attach method lists and properties and protocols from categories to a class.
// Assumes the categories in cats are all loaded and sorted by load order, 
// oldest categories first.
static void 
attachCategories(Class cls, category_list *cats, bool flush_caches)
{
    if (!cats) return;
    if (PrintReplacedMethods) printReplacements(cls, cats);

    bool isMeta = cls->isMetaClass();

    // fixme rearrange to remove these intermediate allocations
    method_list_t **mlists = (method_list_t **)
        malloc(cats->count * sizeof(*mlists));
    property_list_t **proplists = (property_list_t **)
        malloc(cats->count * sizeof(*proplists));
    protocol_list_t **protolists = (protocol_list_t **)
        malloc(cats->count * sizeof(*protolists));

    // Count backwards through cats to get newest categories first
    int mcount = 0;
    int propcount = 0;
    int protocount = 0;
    int i = cats->count;
    bool fromBundle = NO;
    while (i--) {
        auto& entry = cats->list[i];

        method_list_t *mlist = entry.cat->methodsForMeta(isMeta);
        if (mlist) {
            mlists[mcount++] = mlist;
            fromBundle |= entry.hi->isBundle();
        }

        property_list_t *proplist = 
            entry.cat->propertiesForMeta(isMeta, entry.hi);
        if (proplist) {
            proplists[propcount++] = proplist;
        }

        protocol_list_t *protolist = entry.cat->protocols;
        if (protolist) {
            protolists[protocount++] = protolist;
        }
    }

	// 获取类信息
    auto rw = cls->data();

	// 预处理列表
    prepareMethodLists(cls, mlists, mcount, NO, fromBundle);

	// 把方法列表附加到类中
    rw->methods.attachLists(mlists, mcount);
    free(mlists);
    if (flush_caches  &&  mcount > 0) flushCaches(cls);

	// 把属性列表附加到类中
    rw->properties.attachLists(proplists, propcount);
    free(proplists);

	// 把协议列表附加到类中
    rw->protocols.attachLists(protolists, protocount);
    free(protolists);
}
```
再看一下`attachLists`的实现
```cpp
void attachLists(List* const * addedLists, uint32_t addedCount) {
    if (addedCount == 0) return;

    if (hasArray()) {
        // many lists -> many lists
        uint32_t oldCount = array()->count;
        uint32_t newCount = oldCount + addedCount;
	// 重新分类空间，扩容
        setArray((array_t *)realloc(array(), array_t::byteSize(newCount)));
        array()->count = newCount;
	// 把原来的方法移动到数组后面
        memmove(array()->lists + addedCount, array()->lists, 
                oldCount * sizeof(array()->lists[0]));
	// 把新的方法添加到数组前面
        memcpy(array()->lists, addedLists, 
               addedCount * sizeof(array()->lists[0]));
    }
    else if (!list  &&  addedCount == 1) {
        // 0 lists -> 1 list
        list = addedLists[0];
    } 
    else {
        // 1 list -> many lists
        List* oldList = list;
        uint32_t oldCount = oldList ? 1 : 0;
        uint32_t newCount = oldCount + addedCount;
        setArray((array_t *)malloc(array_t::byteSize(newCount)));
        array()->count = newCount;
        if (oldList) array()->lists[addedCount] = oldList;
        memcpy(array()->lists, addedLists, 
               addedCount * sizeof(array()->lists[0]));
    }
}
```
通过查看源码可以知道`Category`的加载处理过程
1. 通过Runtime加载某个类的所有Category数据
2. 把所有Category的方法、属性、协议数据，合并到一个大数组中
(后面参与编译的Category数据，会在数组的前面)
3. 将合并后的分类数据（方法、属性、协议），插入到类原来数据的前面

**注意**:分类方法并非真的覆盖目标类方法，只是分类的方法和目标类方法合并后，分类方法在数组的前面，调用的时候会优先调用数组前面的方法。

### Category && Extension
`Category` 编译的时候会被编译成 `struct category_t` 结构体，在运行时加载到内存中，跟目标类的方法、协议、属性，进行合并.
`Extends` 编译的时候就会将方法、协议、属性合并到 `class_t` 结构体中.

### Load 方法
每个类，包括分类都有一个`load`方法，程序启动时调用，加载类到内存中。每个类，还有分类都会调用自己的`load`方法
查看objc源码，研究load的调用机制
```cpp
/***********************************************************************
* _objc_init
* Bootstrap initialization. Registers our image notifier with dyld.
* Called by libSystem BEFORE library initialization time
**********************************************************************/

void _objc_init(void)
{
    static bool initialized = false;
    if (initialized) return;
    initialized = true;
    
    // fixme defer initialization until an objc-using image is found?
    environ_init();
    tls_init();
    static_init();
    lock_init();
    exception_init();

    _dyld_objc_notify_register(&map_images, load_images, unmap_image);
}
```
同样是从 `_objc_init`方法开始, 这里调用了`load_images`
```cpp

/***********************************************************************
* load_images
* Process +load in the given images which are being mapped in by dyld.
*
* Locking: write-locks runtimeLock and loadMethodLock
**********************************************************************/
extern bool hasLoadMethods(const headerType *mhdr);
extern void prepare_load_methods(const headerType *mhdr);

void
load_images(const char *path __unused, const struct mach_header *mh)
{
    // Return without taking locks if there are no +load methods here.
    if (!hasLoadMethods((const headerType *)mh)) return;

    recursive_mutex_locker_t lock(loadMethodLock);

    // Discover load methods
    {
        mutex_locker_t lock2(runtimeLock);
		// 搜获所有类、分类的load方法，并添加到一个数组中
        prepare_load_methods((const headerType *)mh);
    }

    // Call +load methods (without runtimeLock - re-entrant)
	// 调用load方法
    call_load_methods();
}
```
查看`prepare_load_methods`方法实现, 搜获所有类、分类的load方法，并添加到一个数组中
```cpp
void prepare_load_methods(const headerType *mhdr)
{
    size_t count, i;

    runtimeLock.assertLocked();

    // 查找 class 的 load 方法，并添加到一个数组
    classref_t *classlist = 
        _getObjc2NonlazyClassList(mhdr, &count);
    for (i = 0; i < count; i++) {
        schedule_class_load(remapClass(classlist[i]));
    }

    // 查找 category 的 load 方法，并添加到一个数组
    category_t **categorylist = _getObjc2NonlazyCategoryList(mhdr, &count);
    for (i = 0; i < count; i++) {
        category_t *cat = categorylist[i];
        Class cls = remapClass(cat->cls);
        if (!cls) continue;  // category for ignored weak-linked class
        if (cls->isSwiftStable()) {
            _objc_fatal("Swift class extensions and categories on Swift "
                        "classes are not allowed to have +load methods");
        }
        realizeClassWithoutSwift(cls);
        assert(cls->ISA()->isRealized());
        add_category_to_loadable_list(cat);
    }
}
```
`schedule_class_load` 查找`class`的`load`方法，添加到数组中，如果有父类，先添加父类方法
```cpp
/***********************************************************************
* prepare_load_methods
* Schedule +load for classes in this image, any un-+load-ed 
* superclasses in other images, and any categories in this image.
**********************************************************************/
// Recursively schedule +load for cls and any un-+load-ed superclasses.
// cls must already be connected.
static void schedule_class_load(Class cls)
{
    if (!cls) return;
    assert(cls->isRealized());  // _read_images should realize

    if (cls->data()->flags & RW_LOADED) return;

    // Ensure superclass-first ordering
	// 递归调用，如果有superclass，会一级一级往上找
    schedule_class_load(cls->superclass);

	// 查找class，并把load方法添加到数组中
    add_class_to_loadable_list(cls);
    cls->setInfo(RW_LOADED); 
}
```
`add_class_to_loadable_list`查找`class`，并把`load`方法添加到数组中
```cpp
typedef void(*load_method_t)(id, SEL);
// 存 class 和 load 方法的结构体
struct loadable_class {
    Class cls;  // may be nil
    IMP method;
};
// List of classes that need +load called (pending superclass +load)
// This list always has superclasses first because of the way it is constructed
static struct loadable_class *loadable_classes = nil;
static int loadable_classes_used = 0;
static int loadable_classes_allocated = 0;
/***********************************************************************
* add_class_to_loadable_list
* Class cls has just become connected. Schedule it for +load if
* it implements a +load method.
**********************************************************************/
void add_class_to_loadable_list(Class cls)
{
    IMP method;

    loadMethodLock.assertLocked();

    method = cls->getLoadMethod();
    if (!method) return;  // Don't bother if cls has no +load method
    
    if (PrintLoading) {
        _objc_inform("LOAD: class '%s' scheduled for +load", 
                     cls->nameForLogging());
    }
    
    if (loadable_classes_used == loadable_classes_allocated) {
        loadable_classes_allocated = loadable_classes_allocated*2 + 16;
        loadable_classes = (struct loadable_class *)
            realloc(loadable_classes,
                              loadable_classes_allocated *
                              sizeof(struct loadable_class));
    }
    
    loadable_classes[loadable_classes_used].cls = cls;
    loadable_classes[loadable_classes_used].method = method;
    loadable_classes_used++;
}
```
`add_category_to_loadable_list` 查找`category`，并把`load`方法添加到数组中
```cpp
struct loadable_category {
    Category cat;  // may be nil
    IMP method;
};
// List of categories that need +load called (pending parent class +load)
static struct loadable_category *loadable_categories = nil;
static int loadable_categories_used = 0;
static int loadable_categories_allocated = 0;
/***********************************************************************
* add_category_to_loadable_list
* Category cat's parent class exists and the category has been attached
* to its class. Schedule this category for +load after its parent class
* becomes connected and has its own +load method called.
**********************************************************************/
void add_category_to_loadable_list(Category cat)
{
    IMP method;

    loadMethodLock.assertLocked();

    method = _category_getLoadMethod(cat);

    // Don't bother if cat has no +load method
    if (!method) return;

    if (PrintLoading) {
        _objc_inform("LOAD: category '%s(%s)' scheduled for +load", 
                     _category_getClassName(cat), _category_getName(cat));
    }
    
    if (loadable_categories_used == loadable_categories_allocated) {
        loadable_categories_allocated = loadable_categories_allocated*2 + 16;
        loadable_categories = (struct loadable_category *)
            realloc(loadable_categories,
                              loadable_categories_allocated *
                              sizeof(struct loadable_category));
    }

    loadable_categories[loadable_categories_used].cat = cat;
    loadable_categories[loadable_categories_used].method = method;
    loadable_categories_used++;
}
```
**总结:** `+load`方法会在`runtime`加载类、分类时调用
每个类、分类的`+load`，在程序运行过程中只调用一次

 调用顺序
* 先调用类的`+load`
* 按照编译先后顺序调用（先编译，先调用）
* 调用子类的`+load`之前会先调用父类的`+load`

* 再调用分类的`+load`
* 按照编译先后顺序调用（先编译，先调用）


reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)