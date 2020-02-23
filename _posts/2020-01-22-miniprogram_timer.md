---
layout: post
title:  "Timer for toastmasters' timer"
date:   2020-01-22
categories: mini-program
---

This is a wechat mini program dedicated for toastmasters' timer. It follow the time rule and show you the color to post your card.

## How to use it?

### Add timer list
First you need to add a timer list before the meeting, just tap the "+" button, and add some timers you are about to use during the meeting. And the timer list will save in your wechat account.
Swipe left to remove a timer.
<div style="text-align: center;">
    <image src="/resource/timer/timer1.jpg" style="inline; width: 375px; max-width:auto;"/>
     <image src="/resource/timer/timer2.jpg" style="inline; width: 375px; max-width:auto;"/>
     <image src="/resource/timer/timer3.jpg" style="inline; width: 375px; max-width:auto;"/>
     <image src="/resource/timer/timer8.jpg" style="inline; width: 375px; max-width:auto;"/>
</div>


### Start a count down timer
Just tap the any timer in the list, and it will begin to count down. The time string in the circle show the time you left, and in the bottom show the time span of the timer.
Input the name of speaker, then you can see the records later.
<div style="text-align: center;">
    <image src="/resource/timer/timer4.jpg" style="width: 375px; max-width:auto;"/>
</div>


When the time span is **bigger or equal to 5:00**, and the time left is **within 2:00**, the screen will become green and blink, the device will begin to vibrate;<br>
When the time span is **within 5:00**, and the time left is **within 1:00**, the screen will become green and blink, the device will begin to vibrate.<br>
That means your should post your **green card** to the speaker, and then just tap anywhere in the screen, it will stop vibrating and become the normal look like before.
<div style="text-align: center;">
    <image src="/resource/timer/timer10.jpg" style="width: 338px; max-width:auto;"/>
</div>

When the time span is **bigger or equal to 5:00**, and the time left is **within 1:00**, the screen will become yellow and blink, the device will begin to vibrate;<br>
When the time span is **within 5:00**, and the time left is **within 0:30**, the screen will become yellow and blink, the device will begin to vibrate.<br>
That means your should post your **yellow card** to the speaker, and then just tap anywhere in the screen, it will stop vibrating and become the normal look like before.

<div style="text-align: center;">
    <image src="/resource/timer/timer11.jpg" style="width: 375px; max-width:auto;"/>
</div>

When the time is **less or equal then 0 sec** the screen will become red and blink, the device will begin to vibrate.<br>
That means your should post your **red card** to the speaker, and then just tap anywhere in the screen, it will stop vibrating and become the normal look like before.
<div style="text-align: center;">
    <image src="/resource/timer/timer12.jpg" style="width: 375px; max-width:auto;"/>
</div>

When the time span is **bigger or equal to 5:00**, and the time is **exceed -0:30**, the screen will become purple and blink, the device will begin to vibrate and ring;<br>
When the time span is **within 5:00**, and the time left is **exceed -0:15**, the screen will become purple and blink, the device will begin to vibrate and ring.<br>
That means your should **hit the bell** in your desk with the hammer, and then just tap anywhere in the screen, it will stop vibrating and become the normal look like before.

<div style="text-align: center;">
    <image src="/resource/timer/timer13.jpg" style="width: 375px; max-width:auto;"/>
</div>

Anytime you want to pause the timer, make the screen become normal (that means you can see the circle in the center) and then tap the circle, the timer will pause and below will show the **total time span**. Above the circle is a reset button, tap it and the timer will set to its initial state and begin to count down again. The name will be clear too, you need to input the new speaker's name.

<div style="text-align: center;">
    <image src="/resource/timer/timer5.jpg" style="width: 375px; max-width:auto;"/>
</div>

#### Timing to record the time(important)
1. Everytime you hit the reset button, the name will be clear, the record is saved. then you can input a new name for the new timer
2. Everytime you back to the previous view to choose a new timer, the record is saved.



#### Check the records
<div style="text-align: center;">
    <image src="/resource/timer/timer9.jpg" style="width: 375px; max-width:auto;"/>
     <image src="/resource/timer/timer6.jpg" style="width: 375px; max-width:auto;"/>
</div>

You can remove all at the beginning of the meeting, or remove some records.

<span style="color:#0a0">Green</span> means the time the speaker used is less then the time span, <span style="color:#a00">red</span> means used extra time.

[Source code]()