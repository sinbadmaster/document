# vueRouter源码学习

前端路由的实现原理简要来说就是：url改变后，无需请求服务器资源，即可自动刷新页面视图。
对于vue，react此类spa来说，即为在url改变后自动渲染对应的页面组件即可。

## 改变url

首先来看改变浏览器url的方式都有哪些？

  1. 用户于浏览器地址栏手动输入
  2. 浏览器导航按钮
  3. 编程改变

对于以上的改变方法，路由通过统一定义，规范编程方式改变url从而使我们的应用可以有效的知道何时通过此种方式改变了路由，需要切换页面视图。那么对于另外两种方式，我们又是否有方法可以知道什么时候url改变了呢？答案是肯定的，在vueRouter中监听上两种改变url变化的方法是通过监听'hashchange', 'popstate'两个事件来实现的。

```javascript
// hash.js
setupListeners () {
    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll
    // 初始化页面滚动
    if (supportsScroll) {
      setupScroll()
    }
    // 监听用户造成的url变动
    window.addEventListener(
      supportsPushState ? 'popstate' : 'hashchange',
      () => {
        const current = this.current
        if (!ensureSlash()) {
          return
        }
        // 通知路由实例地址改变
        this.transitionTo(getHash(), route => {
          if (supportsScroll) {
            handleScroll(this.router, route, current, true)
          }
          if (!supportsPushState) {
            replaceHash(route.fullPath)
          }
        })
      }
    )
  }

  // html5.js
  const initLocation = getLocation(this.base)
    window.addEventListener('popstate', e => {
      const current = this.current

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation(this.base)
      if (this.current === START && location === initLocation) {
        return
      }
      // 通知路由实例地址改变
      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    })
```
由此我们知道已经统一了第一个问题：路由改变，应用可以知道并且可以通知到应用进行后续动作

## 未请求服务器资源

在hash模式下，我们知道hash值得改变本就不会对服务器资源进行请求，因此主要问题在history模式下。而history模式，是在浏览器支持```history.pushState```方法才会支持的，否则会回退到hash模式。而通过此方法改变url地址时也不会触发请求服务器资源，但是如果是直接输入一个url就是从新请求服务器了，这个怎么解决呢？[VueRouter](https://router.vuejs.org/zh/guide/essentials/history-mode.html#%E5%90%8E%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BE%8B%E5%AD%90)通过配置一个覆盖全路由均返回当前应用document的配置来解决了这个问题。

```
location / {
  try_files $uri $uri/ /index.html;
}
```

## 更新视图

vueRouter的做法是路由切换后更新当前路由项，对应的在vue上挂载了对当前路由的响应式数据，借此来触发vue的render函数更新对应的视图。
```javascript
//base.js
transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    const route = this.router.match(location, this.current)
    this.confirmTransition(
      route,
      () => {
        // 更新路由信息
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
        if (onAbort) {
          onAbort(err)
        }
        if (err && !this.ready) {
          this.ready = true
          this.readyErrorCbs.forEach(cb => {
            cb(err)
          })
        }
      }
    )
  }

  updateRoute (route: Route) {
    const prev = this.current
    this.current = route
    // 触发路由实例上的回调
    this.cb && this.cb(route)
    this.router.afterHooks.forEach(hook => {
      hook && hook(route, prev)
    })
  }
  // 路由实例上的监听回调
  listen (cb: Function) {
    this.cb = cb
  }
  // index.js
  export default class VueRouter {
    init(app) {
      history.listen(route => {
        // 触发对应vue组件实例的响应式数据_route
        this.apps.forEach((app) => {
          app._route = route
        })
      })
    }
  }
```