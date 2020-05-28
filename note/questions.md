# 小题

标签（空格分隔）： 基础

---

## 1. http2 与 http1.x的区别，优势？
    1.0 请求连接，关闭连接
    1.1 串行连接，keep-alive，长连接
    2.0 二进制传输，实现更加通用健壮
        服务端推送，可以将静态资源推送到客户端，减少请求次数
        多路并行，基于tcp的慢启动可以有效利用带宽，提高web性能
        请求头压缩，通过服务端及客户端维护请求头字典，进行头部信息差量传递，减少传输大小
        
## 2. 从输入url到显示页面的过程？
    两大步骤：
        1. 请求资源
            dns-tcp-http-连接结束
        2. 页面渲染
            数据解析-dom tree-css tree-layout-print
            
## 3. 大文件上传前端
        文件分片上传，基本思路，使用FormData，及file对进行分片。从而实现大文件化小分片上传、断点续    传、并行上传等。
        图片压缩上传，可以使用canvas.drawImage限制图片大小，canvas.toBlob限制图片质量，然后上传二    进制文件数据即可。
        
## 4. http缓存
    https://www.jianshu.com/p/227cee9c8d15
### 4.1 强制缓存:
使用强缓存则直接返回状态码 200

|header属性|可选值|优先级|优缺点
|:--|:--|:--|:--|
|Pragma|no-cache:根据新鲜度来使用|高|
|Cache-Control|1.no-cache:根据新鲜度来使用 2.no-store:不使用缓存 3.max-age：xxs，缓存时长 4.public/private：个人使用|中|
|Expires|GMT时间|低|

在html文档中我们可以通过对meta字段来设置，从而达到对强制缓存一定的控制效果（取决于服务器设置）
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="no-cache">
    <meta http-equiv="Expires" content="0">
</head>
```

### 4.2 协商缓存：
如果首次请求没有Cache-Control，Expires，或已过期，或no-cache。即使用协商缓存。如果服务器资源没有修改就直接返回304。

|header属性|可选值|优先级|优缺点
|:--|:--|:--|:--|
|ETag、If-Not-Match|校验值|高|1.hash 2.精确计算 3.性能损耗
|Last-Modified、If-Modified-Since|GMT时间|低|1.资源修改就返回资源 2.时刻为标识，无法识别s级以下 3.有些服务器无法准确获取最后修改时间

## 5. meta字段 X-UA-Compatible
此字段是对ie文档兼容性视图的定义，自ie8后添加```<meta http-equiv="X-UA-Compatible" content="ie=edge">```表明采用当前版本所支持的最高标准模式渲染。避免进入兼容性视图模式，即使没有声明DOCTYPE。最佳采用```<meta http-equiv="X-UA-Cpmpatible" content="ie=edge,chrome=1">```副作用是无法通过W3C验证。

## 6. 手写一个Array.prototype.map
```javascript
if (!Array.prototype.map) {
  // 可选的第二参数是执行cb的this上下文
  Array.prototype.map = function (cb /*, thisArg*/) {
    // T 是否传递进来的this上下文 A map返回的新数组 k 遍历时的下标
    var T, A, k
    if (this == null) {
      // 调用为null时抛出异常
      throw new TypeError('cannot read property of null or undefined')
    }
    // 将this转object
    var O = Object(this)
    // 将length转换为unit32数字
    var len = O.length >>> 0
    // 检测cb是否为函数
    if (typeof cb !== 'function') {
      throw new TypeError(cb + 'is not function')
    }

    // 最后的结果数组
    A = new Array(len)
    if (arguments.length > 1) {
      T = arguments[1]
    }
    k = 0
    while (k < len) {
      if (k in O) {
        // k 是 O的自有可枚举属性时执行以下逻辑
        var kValue = O[k]
        var mappedValue = cb.call(T, kValue, k, O)
        A[k] = mappedValue
      }
      k++
    }
    return A
  }
}
```
## 7. 极简手写一个Promise

```javascript
function Promise(excutor) {
  var self = this
  self.onResolvedCallback = []
  function resolve(value) {
    setTimeout(() => {
      self.data = value
      self.onResolvedCallback.forEach(callback => callback(value))
    })
  }
  excutor(resolve.bind(self))
}

Promise.prototype.then = function(onResolved) {
  var self = this
  return new Promise(resolve => {
    self.onResolvedCallback.push(function() {
      var result = onResolved(self.data)
      if (result instanceof Promise) {
        result.then(resolve)
      } else {
        resolve(result)
      }
    })
  })
}
```
## 8.导入文件
 1. 通过input accept可以控制选择文件框的文件后缀名
 2. 通过设置accept的接受mimeType可以改变选择文件框中的文件描述