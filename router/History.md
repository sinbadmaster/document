# 浅析vue-router中history模式

[toc]

之前的学习中写过一篇有关vue-router中[hash模式的一点思考](https://blog.csdn.net/qq_39217871/article/details/105675485)现在呢有时间就打算把history模式的源码也看一看学习一下。然后写一下自己对于history模式的理解。

## 路由初始化

本次学习使用的是vue-router v3.0.2版本源码进行。对于前端路由主要就是解决了改变浏览器url输入框中的值，可以在不整体刷新页面的情况下动态的改变页面中的显示的内容，即可以部分刷新页面。这也是SPA应用的一个基本述求。相较于MPA应用每次都会重新获取不同的html文档是一种全新不同的使用体验。
在vue-router中更是使用不同的模式来实现这一述求：

- hash模式
- history模式
- abstract模式
  
本次学习的目标主要是history模式下vue-router的工作原理。

```javascript
// index.js主要代码 代码类型检测使用的flow
export default class VueRouter {
  // 省略了部分类中的属性
  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)
    // mode由初始化时传入的mode初次决定
    let mode = options.mode || 'hash'
    // 是否回退的flag，此处supportsPushState检测了浏览器是否支持h5的history api
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode
    // 此处进入router的最终初始化
    switch (mode) {
      case 'history':
        // 传入router自身，及options的base选项
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
}
```

## history模式初始化

可以看到这里决定了最终将会采用什么mode来进行router的初始化，此处进入history模式的初始化中。

```javascript
// html5.js主要代码 代码类型检测使用的flow
export class HTML5History extends History {
  // 继承自公共的router父类
  constructor (router: Router, base: ?string) {
    super(router, base)
    // 这里解释一下这个base，即为如果网站发布到服务器二级目录时在option中加的那个base路径
    // 初始路由 默认为 '/'
    const initLocation = getLocation(this.base)
    // 添加路由变化监听
    window.addEventListener('popstate', e => {
      const current = this.current

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      const location = getLocation(this.base)
      if (this.current === START && location === initLocation) {
        return
      }
      // 路由到对应地址
      this.transitionTo(location, route => {
        if (supportsScroll) {
          handleScroll(router, route, current, true)
        }
      })
    })
  }
}
```

## history模式浏览器行为监听

此处就是初始化history模式的路由的关键内容了。可以简单的理解为添加路由变化监听，并且路由到初始路由中去。
关键内容就是这个监听路由变化的事件**popstate**，此处可以参见MDN上对于**popstate**事件的描述：

> 当活动历史记录条目更改时，将触发**popstate事件**。如果被激活的历史记录条目是通过对history.pushState（）的调用创建的，或者受到对history.replaceState（）的调用的影响，popstate事件的state属性包含历史条目的状态对象的副本。
> 需要注意的是**调用history.pushState()或history.replaceState()不会触发popstate事件。只有在做出浏览器动作时，才会触发该事件，如用户点击浏览器的回退按钮（或者在Javascript代码中调用history.back()或者history.forward()方法。**
> 不同的浏览器在加载页面时处理popstate事件的形式存在差异。页面加载时Chrome和Safari通常会触发(emit )popstate事件，但Firefox则不会。

对于这一段话我的理解就是，监听这个popstate事件的目的就是为了可以在触发浏览器动作时进行页面视图更新，即让路由可以响应浏览器的前进后退按钮操作，和js方法引起的操作。另值得一提的是 **history.go()** 方法也是可以触发popstate事件的。
那么现在浏览器事件中前进后退已经都有了解决方案，刷新呢？这里先看一下hash模式，hash模式刷新的时候是如何请求服务器的？显然hash值是不会带给服务器的，那么一个hash路由```localhost:8080/#/test```发送到服务器时事实上服务器接收到的请求只是```localhost:8080/```就会查找对应根目录下的index.html返回文档，然后交给前端路由处理。
而在history模式中显然是不行的```localhost:8080/test```一个这样的地址请求到服务器，就会交由服务器来处理这个```/test```目录，那么显然就无法返回我们所需要的index.html文档。所以在vue-router的[官方文档](https://router.vuejs.org/zh/guide/essentials/history-mode.html#%E5%90%8E%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BE%8B%E5%AD%90)中给出了对应的配置内容，如NGINX：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

这里主要是对 try_files 指令的使用，简单的说 try_files 会依次查找指令后的目录文件，并返回第一个匹配到的文件，如果没有匹配到就会去请求最后配置的uri。详细讲解可参考[nginx配置选项try_files详解](https://blog.csdn.net/dianpeng3749/article/details/101761720)。这里就可以解决刷新时请求服务器并返回想要的目录下的index.html文档的问题。

## history模式路由导航流程

至此针对浏览器操作的路由响应都已经有了对应的解决方法和实现，然后就可以学习一下再history模式中路由的跳转具体是如何实现的了。

```javascript
// constructor方法中的路由跳转
this.transitionTo(location, route => {
  if (supportsScroll) {
    handleScroll(router, route, current, true)
  }
})
// push方法
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  // 调用跳转方法
  this.transitionTo(location, route => {
    // 调用history api改变浏览器url值
    pushState(cleanPath(this.base + route.fullPath))
    handleScroll(this.router, route, fromRoute, false)
    onComplete && onComplete(route)
  }, onAbort)
}
```

跳转的关键方法封装在```this.transitionTo```中。这个方法是封装在与其他模式共有的父类History中的。

```javascript
export class History {
  transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
      // 成功回调，即完成更新本次路由跳转前置后调用
      // 此处只是调用全局的后置守卫钩子
      this.updateRoute(route)
      onComplete && onComplete(route)
      // 确保url显示当前路由的值
      this.ensureURL()

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => { cb(route) })
      }
    }, err => {
      // 失败回调
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
  }
  // 路由跳转的关键方法
  confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    // 取消跳转的方法
    const abort = err => {
      if (isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => { cb(err) })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      route.matched.length === current.matched.length
    ) {
      this.ensureURL()
      return abort()
    }
    // 获取当前路由和即将跳转的路由的匹配路由选项
    // 确定出待跳转路由中哪些是已更新的路由，哪些是需要激活的路由
    // 以及确定出当前路由哪些需要失活
    const {
      updated,
      deactivated,
      activated
    } = resolveQueue(this.current.matched, route.matched)
    // 将上方获取的列表进行组装
    const queue: Array<?NavigationGuard> = [].concat(
      // in-component leave guards
      // 返回组件内的 beforeRouteLeave 钩子
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      // 返回重复使用的路由组件内的 beforeEnter 钩子
      extractUpdateHooks(updated),
      // in-config enter guards
      // 返回待激活的路由组件的 beforeEnter 钩子
      activated.map(m => m.beforeEnter),
      // async components
      // 解析异步路由组件
      resolveAsyncComponents(activated)
    )

    this.pending = route
    const iterator = (hook: NavigationGuard, next) => {
      // 调用钩子函数
    }
    // 按上面的队列顺序进行调用
    runQueue(queue, iterator, () => {
      const postEnterCbs = []
      const isValid = () => this.current === route
      // wait until async components are resolved before
      // extracting in-component enter guards
      // 返回待激活路由组件内部的 beforeRouteEnter 钩子
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
      // 拼装上全局的 beforeResolve 
      const queue = enterGuards.concat(this.router.resolveHooks)
      runQueue(queue, iterator, () => {
        if (this.pending !== route) {
          return abort()
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
          this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => { cb() })
          })
        }
      })
    })
  }
}
```

至此一个完整的history模式的路由跳转就结束了。事实上路由跳转的时候内部的执行逻辑和hash模式是一致的因此就有了一个完整的路由导航的流程：

1. 触发路由导航
2. 调用将要失活的路由组件内的 beforeRouteLeave 钩子
3. 调用全局的 beforeEach 钩子
4. 调用互用的路由组件内的 beforeRouteUpdate 钩子
5. 调用路由配置中的 beforeEnter 钩子
6. 解析异步路由
7. 调用路由组件中的 beforeRouteEnter 钩子
8. 调用全局的 resolve 钩子
9. 调用 afterEach 钩子
10. 触发对应路由组件的render函数

[1] [nginx配置选项try_files详解](https://blog.csdn.net/dianpeng3749/article/details/101761720)
[2] [vue-router官方文档](https://router.vuejs.org/zh/)
[3] [MDN官方文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onpopstate)
