# jwt

简书中对于jwt的描述[参考文章](https://www.jianshu.com/p/576dbf44b2ae)

## jwt的构成

### header

jwt的header由类型(jwt)及加密算法类型(通常默认使用 HMAC SHA256)构成：

```json
{ "typ": "jwt", "alg": "HS256" }
```
