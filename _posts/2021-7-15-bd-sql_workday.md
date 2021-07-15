---
layout: post
title:  "SQL--如何用SQL求第10个工作日"
date:   2021-7-15
categories: big data
---

运行环境: PostpreSQL + linux 

今天被一道题问住了, 给一个日期和节假日映射表,如何求每个一天的第10个工作日?
如果只是求某个特定的日期的第10个工作日,思路很直接

假如我们有如下的表

```sql
create table day_table (
	the_day varchar(80) comment '日期',
    flag varchar(1) comment 'W 代表工作日, H 代表假日'
);

insert into day_table values('2021-07-15','W');
insert into day_table values('2021-07-14','W');
insert into day_table values('2021-07-13','W');
insert into day_table values('2021-07-12','W');
insert into day_table values('2021-07-11','H');
insert into day_table values('2021-07-10','H');
insert into day_table values('2021-07-09','W');
insert into day_table values('2021-07-08','W');
insert into day_table values('2021-07-07','W');
insert into day_table values('2021-07-06','W');
insert into day_table values('2021-07-05','W');
insert into day_table values('2021-07-04','H');
insert into day_table values('2021-07-03','H');
insert into day_table values('2021-07-02','W');
insert into day_table values('2021-07-01','W');
insert into day_table values('2021-06-30','W');
insert into day_table values('2021-06-29','W');
insert into day_table values('2021-06-28','W');
insert into day_table values('2021-06-27','H');
insert into day_table values('2021-06-26','H');
insert into day_table values('2021-06-25','W');
insert into day_table values('2021-06-24','W');
insert into day_table values('2021-06-23','W');
insert into day_table values('2021-06-22','W');
insert into day_table values('2021-06-21','W');
insert into day_table values('2021-06-20','H');
insert into day_table values('2021-06-19','H');
insert into day_table values('2021-06-18','W');
insert into day_table values('2021-06-17','W');
insert into day_table values('2021-06-16','W');
insert into day_table values('2021-06-15','W');
```

比如我们要求`2021-06-15`的第10个工作日, 只需要过滤出W的日期,然后升序排序,取第10天即可
```sql
select the_day from (
	select the_day, 
		row_number() over(order by the_day asc) ind 
	from day_table where flag='W' and the_day > '2021-06-15'
) t1 where ind=10;

-- 输出结果
the_day   |
----------+
2021-06-29|
```

但是求整个表所有日期的第10个工作日就没那么容易有思路<br>
纠结了1个多小时之后,解题思路如下<br>

因为是求所有日期的第10个工作日, 那么就是要数数, 从当天开始往后数, 遇到工作日算1天, 遇到假期不算,所以加0, 一直数到10, 第一个10就是我们要的日期啦<br>
这个问题又可以抽象为差值问题, 如果给所有日期从小到大编码(遇到非工作日不递增), 那么每个日期的第10个工作日就是码值比当前日期大10的工作日

实现代码如下
```sql
-- 先生成一个带编码的日期表
create temporary view date_table_indexed as
select
	the_day,
	flag,
  -- 从第一行到当前行求和
	sum(flag_w) over(order by the_day asc) ind
from
(
	select
		the_day,
		flag,
    -- 工作日加1, 非工作日加0
		case flag 
			when 'W' then 1
			when 'H' then 0
		end as flag_w
	from day_table
) t1;
select * from date_table_indexed;

-- 输出结果
the_day   |flag|ind|
----------+----+---+
2021-06-15|W   |  1|
2021-06-16|W   |  2|
2021-06-17|W   |  3|
2021-06-18|W   |  4|
2021-06-19|H   |  4|
2021-06-20|H   |  4|
2021-06-21|W   |  5|
2021-06-22|W   |  6|
2021-06-23|W   |  7|
2021-06-24|W   |  8|
2021-06-25|W   |  9|
2021-06-26|H   |  9|
2021-06-27|H   |  9|
2021-06-28|W   | 10|
2021-06-29|W   | 11|
2021-06-30|W   | 12|
2021-07-01|W   | 13|
2021-07-02|W   | 14|
2021-07-03|H   | 14|
2021-07-04|H   | 14|
2021-07-05|W   | 15|
2021-07-06|W   | 16|
2021-07-07|W   | 17|
2021-07-08|W   | 18|
2021-07-09|W   | 19|
2021-07-10|H   | 19|
2021-07-11|H   | 19|
2021-07-12|W   | 20|
2021-07-13|W   | 21|
2021-07-14|W   | 22|
2021-07-15|W   | 23|


-- 接下来join 上面的结果了
-- 如果给所有日期从小到大编码(遇到非工作不递增), 那么每个日期的第10个工作日就是码值比当前日期大10的工作日
select t1.the_day,t1.flag,t10.the_day as w_day10
from date_table_indexed t1 
left outer join
date_table_indexed t10
on t1.ind+10=t10.ind and t10.flag='W';

-- 输出结果
the_day   |flag|w_day10   |
----------+----+----------+
2021-06-15|W   |2021-06-29|
2021-06-16|W   |2021-06-30|
2021-06-17|W   |2021-07-01|
2021-06-18|W   |2021-07-02|
2021-06-19|H   |2021-07-02|
2021-06-20|H   |2021-07-02|
2021-06-21|W   |2021-07-05|
2021-06-22|W   |2021-07-06|
2021-06-23|W   |2021-07-07|
2021-06-24|W   |2021-07-08|
2021-06-25|W   |2021-07-09|
2021-06-26|H   |2021-07-09|
2021-06-27|H   |2021-07-09|
2021-06-28|W   |2021-07-12|
2021-06-29|W   |2021-07-13|
2021-06-30|W   |2021-07-14|
2021-07-01|W   |2021-07-15|
2021-07-02|W   |          |
2021-07-03|H   |          |
2021-07-04|H   |          |
2021-07-05|W   |          |
2021-07-06|W   |          |
2021-07-07|W   |          |
2021-07-08|W   |          |
2021-07-09|W   |          |
2021-07-10|H   |          |
2021-07-11|H   |          |
2021-07-12|W   |          |
2021-07-13|W   |          |
2021-07-14|W   |          |
2021-07-15|W   |          |
```

生成上面数据插入语句的脚本, 需要在linux环境运行
```shell
#!/bin/bash

# 生成30内日期和flag,周末用H表示,周内用W表示
# 用来插入数据到类sql数据库
for i in {0..30};do
	week_date=`date -d "${i} days ago" +%w`
	if [ $week_date -eq 6  -o $week_date -eq 0 ];then
		val=\'`date -d "${i} days ago" +%F`\',\'H\'
	else
		val=\'`date -d "${i} days ago" +%F`\',\'W\'
	fi

	echo "insert into day_table values($val);"
done
```

好啦,到此圆满结束, 🎉🎉🎉🎉