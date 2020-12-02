# uni-app

关于uni-app的一些学习和使用的心得。

## 框架用法

此次学习和使用的主要为uni-app的开发，基于VUE框架开发。uni-app模板的app开发内置vue.js框架，uni平台的api规范与微信小程序的api规范相近。
开发过程中需要多读，多熟悉官方文档，查找官方论坛问答对问题解惑有比较大的帮助。

## 插件安装

因开发使用的是Windows系统电脑，在下载安装HBuilderX之后就可以前往插件市场进行插件安装了。此处有一个需要注意的地方：**windows下有的文件夹的名字具有权限限制，如果遇上下载插件报错网络问题，但是电脑网络没有问题，就需要检查一下文件夹下的对应权限。**

### uni-app 调试插件问题

在下载安装了**uni-app调试**插件后启动debugger出现报错**Chromium revision is not downloaded**可以临时修改puppeteer插件下的lib文件夹下的Laucher.js，参考[论坛问答](https://ask.dcloud.net.cn/article/37973)

```javascript
// HBuilderX的插件地址
// D:\HBuilderX\plugins\uniapp-debugger\node_modules\puppeteer-cn-2\node_modules\puppeteer\lib\Laucher.js
// 86行
const {
  ignoreDefaultArgs = false,
  args = [],
  dumpio = false,
  executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // 本机Chrome浏览器地址
  pipe = false,
  env = process.env,
  handleSIGINT = true,
  handleSIGTERM = true,
  handleSIGHUP = true,
  ignoreHTTPSErrors = false,
  defaultViewport = { width: 800, height: 600 },
  slowMo = 0,
  timeout = 30000,
} = options;
```

## uni.scss使用问题

项目跟目录下的uni.scss中的变量可以在单文件的style标签下直接使用，但是需要给style标签添加```lang="scss"```的标记，并且需要到插件市场下载**scss/sass编译**插件。
