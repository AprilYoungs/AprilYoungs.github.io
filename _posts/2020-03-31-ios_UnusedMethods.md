---
layout: post
title:  "How to find all the unused Objective-C selector"
date:   2020-03-31
categories: ios
---

After several iterations, we may find our iOS project has many unused selectors or class, if we can to clear the code and make the project run faster. We might need to remove some unused code, some unused methods.

#### Make it short
**Get all methods**:We can find all the Objective-C methods from **linkMap**<br>
**Get all used selector**: Export used selector from MachO file with this command<br>
`otool -v -s __DATA __objc_selrefs machOFile`<br>
**Unused methods**: unused methods = All methods - used methods

Here's the demo project: [FindOCUnusedSelectors](https://github.com/AprilYoungs/FindOCUnusedSelectors)

### Prepare a link map file
[link map file](https://programmer.help/blogs/a-preliminary-understanding-of-link-map-file.html)
![](/resource/ununsedSelector/linkmap.jpg)
Select your target and go to build Settings, search for map, set **Write Link Map File** to **YES**, and change the path to somewhere you can find easily. Now build the project, you will get a linkMap.txt file.

### Get the MachO file
[MachO file](https://www.objc.io/issues/6-build-tools/mach-o-executables/)

<div style="text-align: center;">
    <image src="/resource/ununsedSelector/macho1.jpg" style="width: 375px; max-width:auto;"/>
</div>

<div style="text-align: center;">
    <image src="/resource/ununsedSelector/macho2.jpg" style="width: auto; max-width:auto;"/>
</div>

<div style="text-align: center;">
    <image src="/resource/ununsedSelector/macho3.jpg" style="width: auto; max-width:auto;"/>
</div>
You can find your MachO file after you build your project, just follow the step show above.

With this MachO file you can find a lot of information about you project, you can check this file with [Otool](https://www.manpagez.com/man/1/otool/), a command line app, or with [MachOView, GUI tool](https://github.com/gdbinit/MachOView).
Now we will use this command to show the referenced selectors
```
otool -v -s __DATA __objc_selrefs TestDemo
```

### Get the unused methods
Download my [demo project](https://github.com/AprilYoungs/FindOCUnusedSelectors) and open the `ununsedSel.py` file, change the paths to your project.
![](/resource/ununsedSelector/script.jpg)

Then run the python script with 
```
python3 ununsedSel.py
```
<div style="text-align: center;">
    <image src="/resource/ununsedSelector/script2.jpg" style="width:auto; max-width:auto;"/>
</div>
You will get a file list all the methods and indicate is it used or not.
<div style="text-align: center;">
    <image src="/resource/ununsedSelector/result.jpg" style="width: 375px; max-width:auto;"/>
</div>
