# http相关

## 七层网络结构

- 应用层 http
- 表示层
- 会话层
- 传输层 tcp
- 网络层 ip
- 数据链路层
- 物理层

## http状态码

1. 1xx websocket
2. 2xx 200 204 无响应体 206分段传输
3. 3xx 301 永久重定向 302 临时重定向 304 缓存
4. 4xx 400 参数错误 401 没权限 403 权限不够
5. 5xx 502 负载均衡错误 504 网关超时

## node中的http服务

1. nodejs单线程服务，因此在server监听中应该尽量采用异步代码
2. nodejs应该避免cpu密集型运算，自身计算会阻塞应用
3. nodejs中的http是一个双工流，request代表的是客户端信息，是一个可读流。response是代表的是服务端，是一个可写流。
4. response头部信息标识返回结果，content-type用于标识数据的实体类型

## node设置cros跨域

```typescript
private apiHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');             // 可接收的源
  res.setHeader('Access-Control-Allow-Headers', 'token');        // 可接收的header
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE');   // 可接收的请求方式，get post默认支持
  res.setHeader('Access-Control-Max-Age', 10 * 60);              // 预请求缓存有效时间
  res.end('ok');
}
```

## http缓存

1. 强制缓存

   - Expires 以标准时间来规定缓存有效时间，类比cookie
   - Cache-control 规定

2. 协商缓存

   - Last-Modified 根据文件最后修改时间判断（秒级），缺点是文件未改变时间改变，或一秒内改变多次导致缓存失效
   - Etag 根据文件二进制提取文件摘要控制文件是否改变，缺点如果读取全文件获取摘要性能差

## Referer

可以利用Referer进行防盗用链接的处理

## Content-Disposition

在http中将表明返回消息以何种形式展示，如在页面中展示或下载为附件。inline 表示预览展示，attachment 表示下载为附件。[详细参考](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition)
