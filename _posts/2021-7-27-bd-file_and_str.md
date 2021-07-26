---
layout: post
title:  "grep,sed,awk"
date:   2021-7-27
categories: big data
---

### 元字符

#### ? 字符

`?`字符代表单个字符。

 ```bash
 # 存在文件 a.txt 和 b.txt
 $ ls ?.txt
 a.txt b.txt
 ```

上面命令中，`?`表示单个字符，所以会同时匹配`a.txt`和`b.txt`。

如果匹配多个字符，就需要多个`?`连用。

 ```bash
 # 存在文件 a.txt、b.txt 和 ab.txt
 $ ls ??.txt
 ab.txt
 ```

上面命令中，`??`匹配了两个字符。

注意，`?`不能匹配空字符。也就是说，它占据的位置必须有字符存在。

#### * 字符

`*`代表任意数量的字符。

 ```bash
 # 存在文件 a.txt、b.txt 和 ab.txt
 $ ls *.txt
 a.txt b.txt ab.txt
 
 # 输出所有文件
 $ ls *
 ```

上面代码中，`*`匹配任意长度的字符。

`*`可以匹配空字符。

 ```bash
 # 存在文件 a.txt、b.txt 和 ab.txt
 $ ls a*.txt
 a.txt ab.txt
 ```

#### [...] 模式

`[...]`匹配方括号之中的任意一个字符，比如`[aeiou]`可以匹配五个元音字母。

 ```bash
 # 存在文件 a.txt 和 b.txt
 $ ls [ab].txt
 a.txt b.txt
 
 $ ls *[ab].txt
 ab.txt a.txt b.txt
 ```

`[start-end]`表示一个连续的范围。

 ```bash
 # 存在文件 a.txt、b.txt 和 c.txt
 $ ls [a-c].txt
 a.txt b.txt c.txt
 
 # 存在文件 report1.txt、report2.txt 和 report3.txt
 $ ls report[0-9].txt
 report1.txt report2.txt report3.txt
 ```

#### `[^...]` 和 `[!...]`

`[^...]`和`[!...]`表示匹配不在方括号里面的字符（不包括空字符）。这两种写法是等价的。

 ```bash
 # 存在文件 a.txt、b.txt 和 c.txt
 $ ls [^a].txt
 b.txt c.txt
 ```

这种模式下也可以使用连续范围的写法`[!start-end]`。

 ```bash
 $ echo report[!1-3].txt
 report4.txt report5.txt
 ```

上面代码中，`[!1-3]`表示排除1、2和3。

#### {...} 模式

`{...}` 表示匹配大括号里面的所有模式，模式之间使用逗号分隔。

 ```bash
 $ echo d{a,e,i,u,o}g
 dag deg dig dug dog
 ```

它可以用于多字符的模式。

 ```bash
 $ echo {cat,dog}
 cat dog
 ```

`{...}`与`[...]`有一个很重要的区别。如果匹配的文件不存在，`[...]`会失去模式的功能，变成一个单纯的字符串，而`{...}`依然可以展开。

 ```bash
 # 不存在 a.txt 和 b.txt
 $ ls [ab].txt
 ls: [ab].txt: No such file or directory
 
 $ ls {a,b}.txt
 ls: a.txt: No such file or directory
 ls: b.txt: No such file or directory
 ```

上面代码中，如果不存在`a.txt`和`b.txt`，那么`[ab].txt`就会变成一个普通的文件名，而`{a,b}.txt`可以照样展开。

大括号可以嵌套。

 ```bash
 $ echo {j{p,pe}g,png}
 jpg jpeg png
 ```

大括号也可以与其他模式联用。

 ```bash
 $ echo {cat,d*}
 cat dawg dg dig dog doug dug
 ```

上面代码中，会先进行大括号扩展，然后进行`*`扩展。

#### {start..end} 模式

`{start..end}`会匹配连续范围的字符。

 ```bash
 $ echo d{a..d}g
 dag dbg dcg ddg
 
 $ echo {11..15}
 11 12 13 14 15
 ```

如果遇到无法解释的扩展，模式会原样输出。

 ```bash
 $ echo {a1..3c}
 {a1..3c}
 ```

这种模式与逗号联用，可以写出复杂的模式。

 ```bash
 $ echo .{mp{3..4},m4{a,b,p,v}}
 .mp3 .mp4 .m4a .m4b .m4p .m4v
 ```

#### 注意点

通配符有一些使用注意点，不可不知。

**（1）通配符是先解释，再执行。**

Bash 接收到命令以后，发现里面有通配符，会进行通配符扩展，然后再执行命令。

 ```bash
 $ ls a*.txt
 ab.txt
 ```

上面命令的执行过程是，Bash 先将`a*.txt`扩展成`ab.txt`，然后再执行`ls ab.txt`。

**（2）通配符不匹配，会原样输出。**

Bash 扩展通配符的时候，发现不存在匹配的文件，会将通配符原样输出。

 ```bash
 # 不存在 r 开头的文件名
 $ echo r*
 r*
 ```

上面代码中，由于不存在`r`开头的文件名，`r*`会原样输出。

下面是另一个例子。

 ```bash
 $ ls *.csv
 ls: *.csv: No such file or directory
 ```

另外，前面已经说过，这条规则对`{...}`不适用

**（3）只适用于单层路径。**

上面所有通配符只匹配单层路径，不能跨目录匹配，即无法匹配子目录里面的文件。或者说，`?`或`*`这样的通配符，不能匹配路径分隔符（`/`）。

如果要匹配子目录里面的文件，可以写成下面这样。

 ```bash
 $ ls */*.txt
 ```

**（4）可用于文件名。**

Bash 允许文件名使用通配符。这时，引用文件名的时候，需要把文件名放在单引号里面。

 ```bash
 $ touch 'fo*'
 $ ls
 fo*
 ```

上面代码创建了一个`fo*`文件，这时`*`就是文件名的一部分。

### 文本内容的查找grep

	* grep 选项 文本文件1 [ ... 文本文件n ]
 * 常用选项
   	* -i 忽略大小写
   	* -r 递归读取每一个目录下的所有文件

### sed --> stream editor for filtering and transforming text

sed 一般用于对文本内容做替换

#### sed 的替换命令

* sed 的模式空间 

  sed 的基本工作方式是:

  * 将文件以行为单位读取到内存(模式空间) 
  * 使用sed的每个脚本对该行进行操作 
  * 处理完成后输出该行

* 替换命令 s

  ```shell
  # 最基本的用法,替换第一次出现的匹配的字符
  # sed 's/old/new/' afile
  ➜   sed 's/a/aa/' afile
  aa a a
  ➜   cat afile
  a a a
  # 全局替换
  # sed 's/old/new/g' afile
  ➜   sed 's/a/aa/g' afile
  aa aa aa
  # 分隔符可以使用其他任意字符 @ :
  ➜   sed 's/////' afile
  sed: -e expression #1, char 5: unknown option to `s'
  # 替换 /
  ➜   sed 's:/:/:' afile
  a a a
  ➜   sed 's@/@/@' afile
  a a a
  # 使用@做分隔符
  ➜   sed 's@a@aa@' afile
  aa a a
  # -e 连续执行多次替换
  ➜   sed -e 's/a/aa/' -e 's/aa/cc/' afile
  cc a a
  # 也可以使用;分割多条指令
  ➜   sed  's/a/aa/;s/aa/cc/' afile
  cc a a
  # 一次处理多个文件
  ➜   sed  's/a/aa/;s/aa/cc/' afile bfile
  cc a a
  sed: can't read bfile: No such file or directory
  # -i替换之后覆盖原来的文件
  ➜   sed  -i 's/a/aa/;s/aa/cc/' afile
  ➜   cat afile
  cc a a
  # 也可以写出替换之后的内容到新的文件
  ➜   sed  's/a/aa/;s/aa/cc/' afile > bfile
  ➜   cat bfile
  cc cc a
  # 删除前三个字符
  ➜   head -5 /etc/passwd | sed 's/...//'
  t:x:0:0:root:/root:/bin/zsh
  :x:1:1:bin:/bin:/sbin/nologin
  mon:x:2:2:daemon:/sbin:/sbin/nologin
  :x:3:4:adm:/var/adm:/sbin/nologin
  x:4:7:lp:/var/spool/lpd:/sbin/nologin
  ➜   head -5 /etc/passwd
  root:x:0:0:root:/root:/bin/zsh
  bin:x:1:1:bin:/bin:/sbin/nologin
  daemon:x:2:2:daemon:/sbin:/sbin/nologin
  adm:x:3:4:adm:/var/adm:/sbin/nologin
  lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
  
  # 使用普通元字符
  ➜   sed 's/ab*/!/' bfile
  b
  !
  !a
  !aa
  !
  b!a
  !
  ➜   cat bfile
  b
  a
  aa
  aaa
  abb
  baa
  abbbb
  ➜   sed 's/ab+/!/' bfile
  b
  a
  aa
  aaa
  abb
  baa
  abbbb
  # 使用加强版元字符, 需要带 -r
  ➜   sed -r 's/ab+/!/' bfile
  b
  a
  aa
  aaa
  !
  baa
  !
  ➜   sed -r 's/ab?/!/' bfile
  b
  !
  !a
  !aa
  !b
  b!a
  !bbb
  axyzb
  ~
  
  # 回调, 使用匹配的内容修改之后回写, s/(pattern)/\1/, 使用()圈出匹配的模式,\1代表第一个匹配的模式 
  ➜   cat cfile
  axyzb
  ➜   sed -r 's/(a.*b)/\1:\1/' cfile
  axyzb:axyzb
  
  ```


#### 全局替换

* s/old/new/g

  g 为全局替换,用于替换所有出现的次数

  /如果和正则匹配的内容冲突可以使用其他符号,如 s@old@new@g

  ```shell
   # 全局替换
  ➜   head -5 /etc/passwd | sed 's/root/!!!!/'
  !!!!:x:0:0:root:/root:/bin/zsh
  bin:x:1:1:bin:/bin:/sbin/nologin
  daemon:x:2:2:daemon:/sbin:/sbin/nologin
  adm:x:3:4:adm:/var/adm:/sbin/nologin
  lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
  ➜   head -5 /etc/passwd | sed 's/root/!!!!/g'
  !!!!:x:0:0:!!!!:/!!!!:/bin/zsh
  bin:x:1:1:bin:/bin:/sbin/nologin
  daemon:x:2:2:daemon:/sbin:/sbin/nologin
  adm:x:3:4:adm:/var/adm:/sbin/nologin
  lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
  ```

#### 标志位

* 数字，第几次出现才进行替换
* g，每次出现都进行替换
* p 打印模式空间的内容

  * sed -n ‘script’ filename 阻止默认输出 

* w file 将模式空间的内容写入到文件

```shell
➜   # /2只替换第二次出现的模式
➜   head -5 /etc/passwd | sed 's/root/!!!!/2'
root:x:0:0:!!!!:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin

➜   # p 输出匹配的行替换之后的结果
➜   head -5 /etc/passwd | sed 's/root/!!!!/p'
!!!!:x:0:0:root:/root:/bin/zsh
!!!!:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin

➜   # -n 阻止默认输出,只输出匹配的那一行
➜   head -5 /etc/passwd | sed -n 's/root/!!!!/p'
!!!!:x:0:0:root:/root:/bin/zsh

➜   # w file 将模式空间的内容写入到文件
# 仅仅输出匹配的那一行
➜   head -5 /etc/passwd | sed -n 's/root/!!!!/w /tmp/a.txt'
➜   cat /tmp/a.txt
!!!!:x:0:0:root:/root:/bin/zsh
```

#### 寻址

默认对每行进行操作，增加寻址后对匹配的行进行操作

*  /正则表达式/s/old/new/g 
* 行号s/old/new/g
  *  行号可以是具体的行，也可以是最后一行 $ 符号

*  可以使用两个寻址符号，也可以混合使用行号和正则地址

```shell
➜   head -6 /etc/passwd
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
# 默认匹配全文
➜   head -6 /etc/passwd | sed 's/adm/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
!:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
# 只匹配第一行
➜   head -6 /etc/passwd | sed '1s/adm/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
# 匹配1~4行
➜   head -6 /etc/passwd | sed '1,4s/adm/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
!:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
# 匹配1到最后一行$
➜   head -6 /etc/passwd | sed '1,$s/adm/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
!:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
➜   # 使用正则寻址,包含adm的行才进行替换
➜   head -6 /etc/passwd | sed '/adm/s/adm/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
!:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync

➜   # 正则和行号混用
# bin开头的行到最后一行
➜   head -6 /etc/passwd | sed '/^bin/,$s/nologin/!/'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/!
daemon:x:2:2:daemon:/sbin:/sbin/!
adm:x:3:4:adm:/var/adm:/sbin/!
lp:x:4:7:lp:/var/spool/lpd:/sbin/!
sync:x:5:0:sync:/sbin:/bin/sync
```

#### 分组

* 寻址可以匹配多条命令
* /regular/ { s/old/new/ ; s/old/new/ }

```shell
➜   head -6 /etc/passwd
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
# 寻址bin开头的那行,进行多个模式匹配替换
➜   head -6 /etc/passwd | sed '/^bin/{s/bin/nib/2;s/nologin/ohmy/}'
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:nib:/bin:/sbin/ohmy
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
```



#### 脚本文件

	* 可以将选项保存为文件，使用-f 加载脚本文件 
	* sed -f sedscript filename

```shell
➜   cat sed.s
/^bin/{s/bin/nib/2;s/nologin/ohmy/}
# 使用保存到文件中的sed指令,文件中sed指令不需要用''包起来
➜   head -6 /etc/passwd | sed -f sed.s
root:x:0:0:root:/root:/bin/zsh
bin:x:1:1:nib:/bin:/sbin/ohmy
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
```

#### 删除命令

* [寻址]d
* 删除模式空间内容，改变脚本的控制流，读取新的输入行

```shell
➜   cat bfile
b
a
aa
aaa
abb
baa
abbbb
# 删除保护ab的行
➜   sed '/ab/d' bfile
b
a
aa
aaa
baa
# 使用/d后面的命令不会在背删除行执行
# 相当于先全局删除包含ab的行,然后再执行s/a/!/
➜   sed '/ab/d;s/a/!/' bfile
b
!
!a
!aa
b!a
# 打印内容和行号
➜   sed '/ab/d;=' bfile
1
b
2
a
3
aa
4
aaa
6
baa
```

#### 追加插入和更改

* 追加命令 a 
* 插入命令 i 
* 更改命令 c

```shell
➜   cat bfile
b
a
aa
aaa
abb
baa
abbbb
# a 追加,在匹配的行后面插入
➜   sed '/ab/a hello' bfile
b
a
aa
aaa
abb
hello
baa
abbbb
hello
# i 插入,在匹配的行前面插入
➜   sed '/ab/i hello' bfile
b
a
aa
aaa
hello
abb
baa
hello
abbbb
# c 变更,把匹配的行替换成 对应的字符串
➜   sed '/ab/c hello' bfile
b
a
aa
aaa
hello
baa
hello
```

#### 读文件和写文件

* 读文件命令 r 
* 写文件命令 w

```shell
# r read, 用文件中的内容替换匹配的行
➜  sed '/ab/r afile' bfile
b
a
aa
aaa
abb
cc a a
baa
abbbb
cc a a

# 把包含ab的行写入文件 dfile
➜  sed '/ab/w dfile' bfile
b
a
aa
aaa
abb
baa
abbbb
➜  cat dfile
abb
abbbb
```

#### 打印

* 打印命令 p

```shell
# p打印匹配的行内容, -n抑制默认输出
➜   sed -n '/ab/p' bfile
abb
abbbb
# 等价于 grep
➜   grep ab bfile
abb
abbbb
```



#### 下一行

* 下一行命令 n 
* 打印行号命令 =

```shell
# 打印包含ab的行号
➜   sed  '/ab/=' bfile
b
a
aa
aaa
5
abb
baa
7
abbbb
```

#### 退出命令

* 退出命令 q 

* 哪个效率会更高呢?
  *  sed 10q filename (checked)
  * sed -n 1,10p filename

```shell
➜   seq 1 10000000> lines.txt
➜   ll
total 76M
-rw-r--r-- 1 root root 76M Jul 24 16:55 lines.txt
# 遍历整个文件,打印前10行,效率低
➜   time sed -n '1,10p' lines.txt
1
2
3
4
5
6
7
8
9
10
sed -n '1,10p' lines.txt  0.35s user 0.02s system 110% cpu 0.327 total
# 到文件第10行退出
➜  sed_practice time sed '10q' lines.txt
1
2
3
4
5
6
7
8
9
10
sed '10q' lines.txt  0.00s user 0.00s system 91% cpu 0.006 total
```

#### sed 的多行模式

多行匹配命令

* N 将下一行加入到模式空间
* D 删除模式空间中的第一个字符到第一个换行符 
* P 打印模式空间中的第一个字符到第一个换行符

```shell
# 生成测试文件
➜ cat > b.txt << EOF
heredoc> hell
heredoc> o bash hel
heredoc> lo bash
heredoc> EOF
➜  cat b.txt
hell
o bash hel
lo bash

➜  sed 'N;s/\n//;s/hello bash/hello sed\n/;P;D' b.txt
hello sed
 hello sed
```

#### sed 的保持空间

* 什么是保持空间

  * 保持空间也是多行的一种操作方式
  * 将内容暂存在保持空间，便于做多行处理

  ![image-20210724230140649](file_and_str.assets/image-20210724230140649.png)

* 保持空间命令

  * h 和 H 将模式空间内容存放到保持空间 
  * g 和 G 将保持空间内容取出到模式空间 
  * x 交换模式空间和保持空间内容

  ```shell
  ➜  ~ head -6 /etc/passwd | cat -n
       1	root:x:0:0:root:/root:/bin/zsh
       2	bin:x:1:1:bin:/bin:/sbin/nologin
       3	daemon:x:2:2:daemon:/sbin:/sbin/nologin
       4	adm:x:3:4:adm:/var/adm:/sbin/nologin
       5	lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
       6	sync:x:5:0:sync:/sbin:/bin/sync
  # sed实现文件内容反转
  ➜  ~ head -6 /etc/passwd | cat -n | sed  '1!G;h;$!d'
       6	sync:x:5:0:sync:/sbin:/bin/sync
       5	lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
       4	adm:x:3:4:adm:/var/adm:/sbin/nologin
       3	daemon:x:2:2:daemon:/sbin:/sbin/nologin
       2	bin:x:1:1:bin:/bin:/sbin/nologin
       1	root:x:0:0:root:/root:/bin/zsh
  ➜  ~ head -6 /etc/passwd | cat -n | sed -n '1!G;h;$p'
       6	sync:x:5:0:sync:/sbin:/bin/sync
       5	lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
       4	adm:x:3:4:adm:/var/adm:/sbin/nologin
       3	daemon:x:2:2:daemon:/sbin:/sbin/nologin
       2	bin:x:1:1:bin:/bin:/sbin/nologin
       1	root:x:0:0:root:/root:/bin/zsh
  ```

  

### AWK -- pattern scanning and processing language

awk 一般用于对文本内容进行统计、按需要的格式进行输出

#### AWK 和 sed 的区别

* AWK 更像是脚本语言
* AWK 用于“比较规范”的文本处理，用于统计数量并输出指定字段 
* 使用 sed 将不规范的文本，处理为“比较规范”的文本

#### AWK 脚本的流程控制

* 输入数据前例程 BEGIN{ } 
* 主输入循环{ } 
* 所有文件读取完成例程 END{ }

#### AWK 的字段引用和分离

* 记录和字段

  * 每行称作 AWK 的记录 
  * 使用空格、制表符分隔开的单词称作字段field 
  * 可以自己指定分隔的字段sep

* 字段的引用

  * awk 中使用 `$1 $2 ... $n` 表示每一个字段

    * `awk ‘{print $1, $2, $3}’ filename`
    * `$0`代表整行
  * awk 可以使用 -F 选项改变字段分隔符

    * `awk -F ‘,’ ‘{ print $1, $2, $3}’ filename`
     * 分隔符可以使用正则表达式

```shell
# 寻找文件中以menu开头的行,并打印整行
➜   awk '/^menu/{print $0}' /boot/grub2/grub.cfg
menuentry 'CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)' --class centos --class gnu-linux --class gnu --class os --unrestricted $menuentry_id_option 'gnulinux-3.10.0-957.el7.x86_64-advanced-059e318c-0a80-4b87-9dfb-ed74aeb2afd5' {
menuentry 'CentOS Linux (0-rescue-0d9de9ab17324e10b3c3fb7a80f6e95e) 7 (Core)' --class centos --class gnu-linux --class gnu --class os --unrestricted $menuentry_id_option 'gnulinux-0-rescue-0d9de9ab17324e10b3c3fb7a80f6e95e-advanced-059e318c-0a80-4b87-9dfb-ed74aeb2afd5' {
# 寻找文件中以menu开头的行,以'为分隔符,打印第二个字段
➜   awk -F "'" '/^menu/{print $2}' /boot/grub2/grub.cfg
CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)
CentOS Linux (0-rescue-0d9de9ab17324e10b3c3fb7a80f6e95e) 7 (Core)
# 寻找文件中以menu开头的行,以'为分隔符,打印第一个字段
➜   awk -F "'" '/^menu/{print $1}' /boot/grub2/grub.cfg
menuentry
menuentry
➜   # {print x++,$2} 打印的时候x自增,显示行号
➜   awk -F "'" '/^menu/{print x++,$2}' /boot/grub2/grub.cfg
0 CentOS Linux (3.10.0-957.el7.x86_64) 7 (Core)
1 CentOS Linux (0-rescue-0d9de9ab17324e10b3c3fb7a80f6e95e) 7 (Core)
```

#### AWK 的表达式

* 赋值操作符

  * = 是最常用的赋值操作符
    * var1 = “name”
    * var2 = “hello" “world”
    * var3 = $1
  * 其他赋值操作符
    * ++ - - += -= *= /= %= ^=

* 算数操作符

  * \+ - * /% ^

* 系统变量

  * FS 和 OFS 字段分隔符，FS 表示输入的字段分隔符, OFS 表示输出的字段分隔符

    ```shell
    ➜   head -5 /etc/passwd | awk -F ':' '{print $1}'
    root
    bin
    daemon
    adm
    lp
    # begin的时候设置输入分割符
    ➜   head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print $1}'
    root
    bin
    daemon
    adm
    lp
    
    ➜   head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print $1,$3}'
    root 0
    bin 1
    daemon 2
    adm 3
    lp 4
    
    # OFS 设置输出分割符
    ➜   head -5 /etc/passwd | awk 'BEGIN{FS=":";OFS="-"}{print $1,$3}'
    root-0
    bin-1
    daemon-2
    adm-3
    lp-4
    ```

  * RS 记录分隔符

    ```shell
    # 替换默认的/n换行符,遇到:换行
    ➜   head -5 /etc/passwd | awk 'BEGIN{RS=":"}{print $0}'
    root
    x
    0
    0
    root
    /root
    /bin/zsh
    bin
    x
    1
    1
    bin
    /bin
    /sbin/nologin
    ```

  * NR 和 FNR 行数 , NR文件发生变化不会重排, FNR文件发生变化会重排

    ```shell
    # 打印行号和内容,FNR遇到新文件会重新开始计数, NR不会
    ➜   awk '{print FNR,$0}' /etc/hosts /etc/hosts
    1 127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
    2 ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
    3 192.168.0.200 centos7-1
    4 192.168.0.201 centos7-2
    5 192.168.0.202 centos7-3
    1 127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
    2 ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
    3 192.168.0.200 centos7-1
    4 192.168.0.201 centos7-2
    5 192.168.0.202 centos7-3
    ➜   awk '{print NR,$0}' /etc/hosts /etc/hosts
    1 127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
    2 ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
    3 192.168.0.200 centos7-1
    4 192.168.0.201 centos7-2
    5 192.168.0.202 centos7-3
    6 127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
    7 ::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
    8 192.168.0.200 centos7-1
    9 192.168.0.201 centos7-2
    10 192.168.0.202 centos7-3
    ```

  * NF 字段数量，最后一个字段内容可以用 $NF 取出

    ```shell
    # 打印字段数量和内容
    ➜   head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print NF, $0}'
    7 root:x:0:0:root:/root:/bin/zsh
    7 bin:x:1:1:bin:/bin:/sbin/nologin
    7 daemon:x:2:2:daemon:/sbin:/sbin/nologin
    7 adm:x:3:4:adm:/var/adm:/sbin/nologin
    7 lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
    # 打印最后一个字段的内容
    ➜   head -5 /etc/passwd | awk 'BEGIN{FS=":"}{print $NF}'
    /bin/zsh
    /sbin/nologin
    /sbin/nologin
    /sbin/nologin
    /sbin/nologin
    ```

    

* 关系操作符

  * < > <=>= == !=~!~

* 布尔操作符

  * `&& || !`

#### AWK 的条件和循环

* 条件语句

  * 条件语句使用 if 开头，根据表达式的结果来判断执行哪条语句

    ```shell
    if (expression)
    	awk语句1
    [else
    	awk语句2
    ]
    # 如果有多个语句需要执行可以使用 { } 将多个语句括起来
    ```

* 循环

  ```shell
  while( 表达式 ){
  awk语句1 
  }
  	
  do{
  	awk 语句1 
  }while( 表达式 )
  
  ## for循环
  for( 初始值 ; 循环判断条件 ; 累加 )
  	awk语句1 
  
  # 影响控制的其他语句 break, continue
  ```

  ```shell
  # 用for循环 , 求每个user的平均值
  ➜   cat kpi.txt
  user1	68	78 	45	79	90
  user2	88	68 	95	69	95
  user3	69	58 	75	79	96
  user4	38	48 	95	99	70
  user5	88	77 	65	89	75
  ➜   cat kpi.txt | awk 'BEGIN{print "user","avg"}{sum=0;for(col=2;col<=NF;col++) sum+=$col; avg=sum/(NF-1); print $1,avg}'
  user avg
  user1 72
  user2 83
  user3 75.4
  user4 70
  user5 78.8
  ```

  #### AWK 的数组

  * 数组的定义
    * 数组 :一组有某种关联的数据(变量)，通过下标依次访问
    * 数组名[ 下标 ] = 值
    * 下标可以使用数字也可以使用字符串
  * 数组的遍历
    * `for (var in array)`
    * 使用 数组名 [ 变量] 的方式依次对每个数组的元素进行操作

  * 删除数组
    * delete 数组[ 下标 ]
  * 命令行参数数组
    * ARGC, ARGV (c->count, v->variables)

  ```shell
  ➜   awk 'BEGIN{names["a"]="AA";names["b"]="BB"; for(name in names){print name,names[name];}}'
  a AA
  b BB
  
  # delete删除数组
  ➜  awk 'BEGIN{names["a"]="AA";names["b"]="BB"; for(name in names){print name,names[name];} delete names; for(name in names){print name,names[name];}}'
  a AA
  b BB
  
  # 命令行参数数组
  ➜  cat vars.awk
  BEGIN{
  	for (i=0;i<ARGC;i++) {
  		print i,ARGV[i]
  	}
  	print ARGC
  }
  
  ➜  awk_practice awk -f vars.awk 11 22 33
  0 awk
  1 11
  2 22
  3 33
  4
  ```

  #### AWK 的函数

  * 算数函数

    ```shell
    ➜   cat num.awk
    BEGIN{
    	ang=50.3
    	print "sin:",sin(ang)
    	print "cos:",cos(ang)
    	print "int:",int(ang)
    	# 使用rand()之前需要调用srand()生成随机种子,才能每次都生成新的随机数
    	srand()
    	print rand()
    }
    
    ➜   awk -f num.awk
    sin: 0.0345107
    cos: 0.999404
    int: 50
    0.299766
    ```

  * 字符串函数

    ```shell
    gsub( r, s, t ) 
    index( s, t ) 
    length( s ) 
    match( s, r ) 
    split( s, a, sep ) 
    sub( r, s, t ) 
    substr( s, p, n )
    ```

    

  * 自定义函数

    ```shell
    function 函数名( 参数 ) { 
    	awk语句
    	return awk变量 
    }
    ```

    ```shell
    ➜  awk 'function mindex(ind) {return ind+10} BEGIN{for(i=0;i<ARGV[1];i++){print mindex(i)}}' 4
    10
    11
    12
    13
    ```

    

