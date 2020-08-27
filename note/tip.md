# 小知识合集

一些开发中使用到的小知识

## 导入文件

1. 通过input accept可以控制选择文件框的文件后缀名, 如：

```html
<input type="file" accept=".doc,.xls">
```

![accept](/image/accept2.png)

2. accept单一后缀可以让导入框识别对应mimeType从而显示对应得文件中文描述，如：

```html
<input type="file" accept=".doc">
```

![accept](/image/accept.png)

## 微信小程序

1. 小程序中文字显示省略号不能使用text标签，可以使用view标签

## import/export 语法

export 导出的是动态的变量
export default 导出的是静态的值

import 静态导入文件
import() 提案语法，动态导入文件，返回一个promise对象

## 宏任务与微任务

1. 微任务：Promise, MutationObserver, process.nextTick
2. 宏任务：script, ajax, 事件, requestAnimationFrame, setTimeout, setInterval, setImmediate, MessageChannel, I/O, UI rendering

## node的eventLoop

[参考](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

1. 主栈执行
2. 清空微任务
3. timer -> 到执行时间 -> 进入主栈执行
4. poll -> I/O -> check(此处如果没有I/O则等待一下timer，再向下执行)

## cross-env

实现跨平台环境变量设置。

## node单文件模块

模块儿的分类：

- node核心模块
- 第三方模块
- 单文件模块

node每一个文件都可以作为一个模块儿运行，在运行的时候，该文件的作用域处于一个模块作用域下（即一个函数作用域），此函数会默认传入模块儿参数，具体如下：

```javascript
console.log(
  '模块儿参数', arguments,
  arguments[0] === module.exports,
  arguments[1] === require,
  arguments[2] === module,
  arguments[3] === __filename,
  arguments[4] === __dirname
)
```
