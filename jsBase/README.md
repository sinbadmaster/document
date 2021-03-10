# js基础知识

## 垃圾回收机制

js中的垃圾回收机制采用的是标记清除模式，即当从全局作用域（root）去搜索再无法获取到对象时认为此对象不再被使用，即可以被回收。

js的内存限制在64位约1.4g，32位约0.7g。其中新生代在64位中占32M，老生代占1400M.
新生代主要使用Scavenge进行管理，大致过程为将空间分为from和to两个空间，开始回收的时候扫描from空间，将可达到的对象拷贝到to空间中，之后回收from空间，交换from和to空间。如此几次后依旧存在的对象将被移动到老生代空间中。
老生代主要采用Mark-Sweep（标记清除，可能导致内存碎片问题）和Mark-Compact（标记整理，速度慢）两种算法进行垃圾回收。

## cookie参数简述

cookie可以用来自动向服务器发送数据，作为用户校验，状态保持的一种方案。cookie因为存在客户端，用户可以在客户端进行修改，所以并不是一个完全可信的标。cookie传递的信息都应该做一定的脱敏操作。对cookie添加签名可以使cookie的信任度提高。

cookie参数描述：

|name|value|domain|path|expires/max-age|size|httpOnly|priority|
|:---|:----|:-----|:---|:--------------|:---|:-------|:-------|
|字段名|字段值|可使用的域名|可使用cookie的路径|有效期绝对时间/有效时长|大小|是否仅能在http中使用|优先级|

## js事件循环机制

简单描述事件循环 执行主栈 -> 将microTask队列依次执行 -> 取macroTask队列中的首位加入主栈执行
其中微任务与宏任务都会具有自己的任务队列，不同之处在与微任务会在主栈执行结束后将队列清空，再等待宏任务入主栈

```javascript
console.log('主栈开始')

  setTimeout(() => {
    console.log('宏任务1')
    Promise.resolve().then(() => {
      console.log('宏1中的微任务')
    })
  });

  setTimeout(() => {
    console.log('宏任务2')
  })

  Promise.resolve().then(() => {
    console.log('微任务1')
    setTimeout(() => {
      console.log('微1中的宏任务')
    })
    setTimeout(() => {
      console.log('微1中的宏任务2')
    })
    Promise.resolve().then(() => {
      console.log('微1中新加微任务')
    })
  }).then(() => {
    console.log('微任务2')
    setTimeout(() => {
      console.log('微2中的宏任务')
    })
  })

  Promise.resolve().then(() => {
    console.log('微任务3')
  })

console.log('主栈结束')
```
