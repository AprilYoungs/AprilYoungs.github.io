---
layout: post
title:  "Class struct 的组成"
date:   2019-10-28
categories: ios
---
### Class 结构体
直接点击XCode中NSObject会索引到如下结构体，这个是已经弃用的结构
```c
struct objc_class {
    Class _Nonnull isa  OBJC_ISA_AVAILABILITY;

#if !__OBJC2__
    Class _Nullable super_class                              OBJC2_UNAVAILABLE;
    const char * _Nonnull name                               OBJC2_UNAVAILABLE;
    long version                                             OBJC2_UNAVAILABLE;
    long info                                                OBJC2_UNAVAILABLE;
    long instance_size                                       OBJC2_UNAVAILABLE;
    struct objc_ivar_list * _Nullable ivars                  OBJC2_UNAVAILABLE;
    struct objc_method_list * _Nullable * _Nullable methodLists                    OBJC2_UNAVAILABLE;
    struct objc_cache * _Nonnull cache                       OBJC2_UNAVAILABLE;
    struct objc_protocol_list * _Nullable protocols          OBJC2_UNAVAILABLE;
#endif

} OBJC2_UNAVAILABLE;
```
查看objc4的源码可以索引到如下Class结构
```c
typedef struct objc_class *Class;
typedef struct objc_object *id;

struct objc_class : objc_object {
    // Class ISA;
    Class superclass;
    // 指向父类
    cache_t cache;             // formerly cache pointer and vtable 
    // 存有方法相关信息?
    class_data_bits_t bits;    // class_rw_t * plus custom rr/alloc flags  
    // 存有指向类数据的指针，成员变量、方法、协议列表等

    // 获取类数据，信息
    class_rw_t *data() { 
        return bits.data();
    }
    void setData(class_rw_t *newData) {
        bits.setData(newData);
    }
    ...
    结构体方法
};
struct objc_object {
private:
    isa_t isa;
public:
    ...
    结构体方法
};
// 联合体中第一个元素是class指针
union isa_t {
    isa_t() { }
    isa_t(uintptr_t value) : bits(value) { }

    Class cls;
    uintptr_t bits;
#if defined(ISA_BITFIELD)
    struct {
        ISA_BITFIELD;  // defined in isa.h
    };
#endif
};

// cache_t 存有方法指针
#if __LP64__
typedef uint32_t mask_t;  // x86_64 & arm64 asm are less efficient with 16-bits
#else
typedef uint16_t mask_t;
#endif
typedef unsigned int uint32_t;
struct cache_t {
    struct bucket_t *_buckets;
    mask_t _mask;
    mask_t _occupied;
};

// class方法的结构体
// _sel 是指向函数名的指针
// _imp 是指向函数实现的指针
typedef unsigned long           uintptr_t;
typedef uintptr_t SEL;
struct bucket_t {
private:
    // IMP-first is better for arm64e ptrauth and no worse for arm64.
    // SEL-first is better for armv7* and i386 and x86_64.
#if __arm64__
    uintptr_t _imp;
    SEL _sel;
#else
    SEL _sel;
    uintptr_t _imp;
#endif
};

// 指向类数据的指针
struct class_data_bits_t {
    // Values are the FAST_ flags above.
    uintptr_t bits;

    class_rw_t* data() {
        return (class_rw_t *)(bits & FAST_DATA_MASK);
    }
    ...
    结构体方法
};

// 存有方法、属性变量、协议等列表
struct class_rw_t {
    // Be warned that Symbolication knows the layout of this structure.
    uint32_t flags;
    uint32_t version;

    const class_ro_t *ro;

    method_array_t methods;        //方法列表
    property_array_t properties;  //属性变量列表
    protocol_array_t protocols;     //协议列表

    Class firstSubclass;
    Class nextSiblingClass;

    char *demangledName;

#if SUPPORT_INDEXED_ISA
    uint32_t index;
#endif
    ...
    结构体方法
};

// 存有方法、成员变量、协议等列表
struct class_ro_t {
    uint32_t flags;
    uint32_t instanceStart;
    uint32_t instanceSize;
#ifdef __LP64__
    uint32_t reserved;
#endif
    const uint8_t * ivarLayout;
    
    const char * name;
    method_list_t * baseMethodList;
    protocol_list_t * baseProtocols;
    const ivar_list_t * ivars;  //成员变量列表

    const uint8_t * weakIvarLayout;
    property_list_t *baseProperties;
    ...
    结构体方法
};
````

[重写了官方的结构体，方便观察Class的内部结构](https://github.com/AprilYoungs/MJ_course/tree/master/ReviewPrepare/02-isa和superclass/AYClassStruct)

reference: [apple objc4 源码](https://opensource.apple.com/tarballs/objc4/)