---
layout: post
title:  "扫描线算法"
date:   2021-5-5
categories: algorithm
---

#### 定义

计算几何中，**扫描线算法**（Sweep Line Algorithm）或平面扫描算法（Plane Sweep Algorithm）是一种算法模式，虚拟扫描线或扫描面来解决欧几里德空间中的各种问题，一般被用来解决图形面积，周长等问题，是计算几何中的关键技术之一。

<img src="/resource/lineswaping/assets/1618897743-oiAjqL-line-sweep.gif" alt="1618897743-oiAjqL-line-sweep" style="zoom:50%;" />

这种算法背后的想法是想象一条线（通常是一条垂直线）在平面上扫过或移动，在某些点停止。几何操作仅限于几何对象，无论何时停止，它们都与扫描线相交或紧邻扫描线，并且一旦线穿过所有对象，就可以获得完整的解。

#### 理解

简单一点理解就是把N维数据，转化成N-1维数据，线扫过的地方会做降维(聚合操作)。下面通过算法题做详细说明

#### **一般解题步骤**

1. 数据排序
2. 扫描排序后的数据，聚合有共性的数据
3. 用一个新的数据结构存聚合后的结果

#### [天际线问题](https://leetcode-cn.com/problems/the-skyline-problem/)

<div class="notranslate"><p>城市的天际线是从远处观看该城市中所有建筑物形成的轮廓的外部轮廓。给你所有建筑物的位置和高度，请返回由这些建筑物形成的<strong> 天际线</strong> 。</p>

<p>每个建筑物的几何信息由数组 <code>buildings</code> 表示，其中三元组 <code>buildings[i] = [lefti, righti, heighti]</code> 表示：</p>

<ul>
	<li><code>left<sub>i</sub></code> 是第 <code>i</code> 座建筑物左边缘的 <code>x</code> 坐标。</li>
	<li><code>right<sub>i</sub></code> 是第 <code>i</code> 座建筑物右边缘的 <code>x</code> 坐标。</li>
	<li><code>height<sub>i</sub></code> 是第 <code>i</code> 座建筑物的高度。</li>
</ul>

<p><strong>天际线</strong> 应该表示为由 “关键点” 组成的列表，格式 <code>[[x<sub>1</sub>,y<sub>1</sub>],[x<sub>2</sub>,y<sub>2</sub>],...]</code> ，并按 <strong>x 坐标 </strong>进行 <strong>排序</strong> 。<strong>关键点是水平线段的左端点</strong>。列表中最后一个点是最右侧建筑物的终点，<code>y</code> 坐标始终为 <code>0</code> ，仅用于标记天际线的终点。此外，任何两个相邻建筑物之间的地面都应被视为天际线轮廓的一部分。</p>

<p><strong>注意：</strong>输出天际线中不得有连续的相同高度的水平线。例如 <code>[...[2 3], [4 5], [7 5], [11 5], [12 7]...]</code> 是不正确的答案；三条高度为 5 的线应该在最终输出中合并为一个：<code>[...[2 3], [4 5], [12 7], ...]</code></p>

<p>&nbsp;</p>

<p><strong>示例 1：</strong></p>
<img style="width: 800px; height: 331px;" src="/resource/lineswaping/assets/merged.jpg" alt="">

<pre><strong>输入：</strong>buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]
<strong>输出：</strong>[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]
<strong>解释：</strong>
图 A<strong> </strong>显示输入的所有建筑物的位置和高度，
图 B 显示由这些建筑物形成的天际线。图 B 中的红点表示输出列表中的关键点。</pre>

<p><strong>示例 2：</strong></p>

<pre><strong>输入：</strong>buildings = [[0,2,3],[2,5,3]]
<strong>输出：</strong>[[0,3],[5,0]]
</pre>

<p>&nbsp;</p>

<p><strong>提示：</strong></p>

<ul>
	<li><code>1 &lt;= buildings.length &lt;= 10<sup>4</sup></code></li>
	<li><code>0 &lt;= left<sub>i</sub> &lt; right<sub>i</sub> &lt;= 2<sup>31</sup> - 1</code></li>
	<li><code>1 &lt;= height<sub>i</sub> &lt;= 2<sup>31</sup> - 1</code></li>
	<li><code>buildings</code> 按 <code>left<sub>i</sub></code> 非递减排序</li>
</ul>
</div>
**解析：** 这道题是经典的扫描线算法题，三维空间中有多个重叠的建筑，希望使用一个二维平面来表示，可以想象一下拍照，把立体的空间用二维的图片展示出来。重叠的部位将会被忽略，在同一个x坐标，如果有不同建筑，取高度最高的，就可以描绘出外轮廓。

**解题步骤:**

1. `int[n][3] buildings` 重构成一个`List<int[2]>` 的数组all，`int[2]` 0 位表示x坐标，1位表示y坐标，左边转成负数，然后可以按照x从小到大排序，x相等则y从小到大排序(左边的y是负数，所以绝对值是按从大到小排序)
2. 使用一个优先队列来缓存当前扫描到的位置所有建筑的高度
3. 遍历all中的元素，遇到y为负数是建筑的起始位置，加入优先队列，遇到y为正数是建筑的结束位置，从优先队列中移除这个高度；每遇到一个新的点都要判断是否为新的高度，如果是加入结果集

```java
// java
class Solution {
    public List<List<Integer>> getSkyline(int[][] buildings) {
        List<int[]> all = new ArrayList<>();
        for (int[] e : buildings) {
            all.add(new int[]{e[0], -e[2]}); //left top corner
            all.add(new int[]{e[1], e[2]}); //right top corner
        }
        // sort by x asc, if x is equal , by y desc
        all.sort((o1, o2) -> o1[0]-o2[0]==0 ?  o1[1]-o2[1] : o1[0]-o2[0]);

        List<List<Integer>> res = new ArrayList<>();
        // queue to store heights
        PriorityQueue<Integer> heights = new PriorityQueue<>(Comparator.reverseOrder());
        // when the last build gone, the max height is 0
        heights.add(0);

        // last point's height
        int maxHeight = 0;
        for (int[] p: all) {
            // p[1] < 0 left corner, add height to stack
            // else right corner, remove height from stack
            if (p[1] < 0) heights.add(-p[1]);
            else heights.remove(p[1]);

            // meet change point, add it to the result list
            if (maxHeight != heights.peek()) {
                maxHeight = heights.peek();
                res.add(Arrays.asList(p[0], maxHeight));
            }
        }

        return res;
    }
}
```

#### [包含每个查询的最小区间](https://leetcode-cn.com/problems/minimum-interval-to-include-each-query/)

<div class="notranslate">
  <p>给你一个二维整数数组 <code>intervals</code> ，其中 <code>intervals[i] = [left<sub>i</sub>, right<sub>i</sub>]</code> 表示第 <code>i</code> 个区间开始于 <code>left<sub>i</sub></code> 、结束于 <code>right<sub>i</sub></code>（包含两侧取值，<strong>闭区间</strong>）。区间的 <strong>长度</strong> 定义为区间中包含的整数数目，更正式地表达是 <code>right<sub>i</sub> - left<sub>i</sub> + 1</code> 。</p>


<p>再给你一个整数数组 <code>queries</code> 。第 <code>j</code> 个查询的答案是满足&nbsp;<code>left<sub>i</sub> &lt;= queries[j] &lt;= right<sub>i</sub></code> 的 <strong>长度最小区间 <code>i</code> 的长度</strong> 。如果不存在这样的区间，那么答案是 <code>-1</code> 。</p>

<p>以数组形式返回对应查询的所有答案。</p>

<p>&nbsp;</p>

<p><strong>示例 1：</strong></p>

<pre><strong>输入：</strong>intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]
<strong>输出：</strong>[3,3,1,4]
<strong>解释：</strong>查询处理如下：
- Query = 2 ：区间 [2,4] 是包含 2 的最小区间，答案为 4 - 2 + 1 = 3 。
- Query = 3 ：区间 [2,4] 是包含 3 的最小区间，答案为 4 - 2 + 1 = 3 。
- Query = 4 ：区间 [4,4] 是包含 4 的最小区间，答案为 4 - 4 + 1 = 1 。
- Query = 5 ：区间 [3,6] 是包含 5 的最小区间，答案为 6 - 3 + 1 = 4 。
</pre>

<p><strong>示例 2：</strong></p>

<pre><strong>输入：</strong>intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]
<strong>输出：</strong>[2,-1,4,6]
<strong>解释：</strong>查询处理如下：
- Query = 2 ：区间 [2,3] 是包含 2 的最小区间，答案为 3 - 2 + 1 = 2 。
- Query = 19：不存在包含 19 的区间，答案为 -1 。
- Query = 5 ：区间 [2,5] 是包含 5 的最小区间，答案为 5 - 2 + 1 = 4 。
- Query = 22：区间 [20,25] 是包含 22 的最小区间，答案为 25 - 20 + 1 = 6 。
</pre>

<p>&nbsp;</p>

<p><strong>提示：</strong></p>

<ul>
	<li><code>1 &lt;= intervals.length &lt;= 10<sup>5</sup></code></li>
	<li><code>1 &lt;= queries.length &lt;= 10<sup>5</sup></code></li>
	<li><code>queries[i].length == 2</code></li>
	<li><code>1 &lt;= left<sub>i</sub> &lt;= right<sub>i</sub> &lt;= 10<sup>7</sup></code></li>
	<li><code>1 &lt;= queries[j] &lt;= 10<sup>7</sup></code></li>
</ul>
</div>

**解析：** 这道题同样可以使用扫描线算法，遇到区间的左、右端点，还有查询点，都可以看作一个<事件>, 扫描线会扫过每一个<事件>。

**题解一：**

<img src="/resource/lineswaping/assets/image-20210505125316243.png" alt="image-20210505125316243" style="zoom:50%;" />

还是一样的思路，先数据排序，这里需要把端点和查询合并到一个数组，为了好理解，这里使用`class Event` 来封装数据。如上图，绿色的槽表示区间interval，红色的线表示查询事件query，红线每次只会穿过满足条件的intervals，而且是从左向右扫，所以可以一个优先队列（interval值从小到大）来缓存满足条件的intervals，红线移动的时候，遇到槽的起点，入栈，遇到槽的终点，出栈。

```java
class Event implements Comparable<Event> {
     // 0 -> left point; 1 -> query; 2 -> right point
     int type;
     // position
     int pos;
     // left point, right point -> interval; query -> index
     int para;

			public Event(int type, int pos, int para) {
         this.type = type;
         this.pos = pos;
         this.para = para;
     }

     @Override
     public int compareTo(Event that) {
       // 按x在位置排序，如果x相同，则左端点=》查询事件=》右端点
         return this.pos==that.pos ? this.type-that.type : this.pos-that.pos;
     }
}
```

接下来就是扫描并合并数据，降维处理，还是使用优先队列来缓存当前扫描到的数据

```java
 public int[] minInterval(int[][] intervals, int[] queries) {
        /**
         * 方法一：离线算法, 扫描线算法
         * 提示1
         * 如果我们可以将给定的区间和询问重新排序，那么是否可以使得问题更加容易解决？
         *
         * 提示2
         * 我们可以将区间的左右端点以及询问都看成一个「事件」，如果我们将这些「事件」按照位置进行升序排序，那么：
         * 如果我们遇到一个表示区间左端点的「事件」，那么可以将该区间加入某一「数据结构」中；
         * 如果我们遇到一个表示区间右端点的「事件」，那么可以将该区间从「数据结构」中移除；
         * 如果我们遇到一个表示询问的「事件」，那么需要在「数据结构」中寻找最短的区间。
         * 提示3
         * 你能想出一种合适的「数据结构」吗？
         */

        class Event implements Comparable<Event> {
            // 0 -> left point; 1 -> query; 2 -> right point
            int type;
            // position
            int pos;
            // left point, right point -> interval; query -> index
            int para;

            public Event(int type, int pos, int para) {
                this.type = type;
                this.pos = pos;
                this.para = para;
            }

            @Override
            public int compareTo(Event that) {
                return this.pos==that.pos ? this.type-that.type : this.pos-that.pos;
            }
        }

        List<Event> eventList = new ArrayList<>();
        for (int i=0; i<queries.length; i++) {
            eventList.add(new Event(1, queries[i], i));
        }

        for (int i=0; i<intervals.length; i++) {
            int interv = intervals[i][1] - intervals[i][0] + 1;
            // left point
            eventList.add(new Event(0, intervals[i][0], interv));
            // right point
            eventList.add(new Event(2, intervals[i][1], interv));
        }

        eventList.sort(Event::compareTo);

        int[] ans = new int[queries.length];
        PriorityQueue<Integer> seq = new PriorityQueue<>();
        for (Event e: eventList) {
            switch (e.type) {
                case 0: seq.add(e.para); break; //left point
                case 1: ans[e.para] = seq.isEmpty() ? -1
                                    : seq.peek();
                        break; //query
                case 2: seq.remove(e.para); break; //left point
            }
        }
        return ans;
    }
```

时间复杂度：intervals 的长度用n表示， queries的长度用m表示，排序时间复杂度`O((n+m)log(n+m))`，遍历时间复杂度`O(n+m)`, 最终时间复杂度`O((n+m)(log(n+m)+1))`

在leetcode上面提交会超时，还有更优的解法

**题解二：**

因为要查询，所以还是要排序，不然时间复杂度就是O(n*m) 。

1. 将间隔`intervals` 按照左端点从小到大排序
2. 因为结果需要按照 `query` 的顺序，所以将`query` 转化成 `int[][2]` 的数据结构，0位存query的值，1位存query的序号，然后按query的值从小到大排序
3. 遍历`query`的值，按顺序查询排序后的`interval`，并用一个优先队列缓存满足条件的`intervals`

```java
// 双排序队列，滑动查询，优先队列
public int[] minInterval(int[][] intervals, int[] queries) {
    // 区间按照开始位置排序
    Arrays.sort(intervals, (o1, o2) -> o1[0]-o2[0]);

    // 生成query的二元数组并按p[i][0]排序，p[i][0]是query的值， p[i][1]是query的序号
    // p[i][0] 用来从intervals中查询，p[i][1] 用来把结果写入对应的结果数组
    int[][] p = new int[queries.length][2];
    for (int i=0; i<queries.length; i++) {
        p[i][0] = queries[i];
        p[i][1] = i;
    }
    Arrays.sort(p, (o1, o2) -> o1[0]-o2[0]);

    // 按照区间从小到大的优先队列
    // 用来缓存满足当前query的区间
    PriorityQueue<int[]> pq = new PriorityQueue<>((o1, o2)-> o1[1]-o1[0]-(o2[1]-o2[0]));
    // 结果集
    int[] ans = new int[queries.length];
    Arrays.fill(ans, -1);
    int index = 0;
    for (int i=0; i<queries.length; i++) {
        // 添加可能满足条件的区间
        while (index<intervals.length && intervals[index][0] <= p[i][0]) {
            pq.add(intervals[index]);
            index++;
        }
        // 过滤掉不满足条件的区间
        while (!pq.isEmpty() && pq.peek()[1] < p[i][0]) {
            pq.poll();
        }

        // 取出最小的区间，如果存在的话
        if (!pq.isEmpty()) {
            int[] tmp = pq.peek();
            ans[p[i][1]] = tmp[1] - tmp[0] + 1;
        }
    }
    return ans;
}
```

**时间复杂度**：intervals 的长度用n表示， queries的长度用m表示，排序时间复杂度`O(n*logn+m*logm)`，遍历时间复杂度`O(n+m)`, 最终时间复杂度`O(n*logn+m*logm+n+m)`，数学推导可以知道比解法一复杂度小