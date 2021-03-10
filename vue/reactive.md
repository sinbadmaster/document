# reactive源码学习

这次clone下来的vue3.0.5的代码，学习reactive模块相关内容。了解vue3中的响应式数据的设计、实现。首先进入到源码中，可以很方便的找到reactivity模块。打开这个模块之后呢？要如何下手就一脸懵逼了，然后猛然发现了__test__文件夹，灵机一动从单测入手不就可以快速的知道这个模块下主要暴露出的api会有哪些，具体的功能会有哪些了吗？于是就愉快的开始阅读单测相关的内容。

## 测试用例

第一个相关单测：

```javascript
test('Object', () => {
  const original = { foo: 1 }                       // 原始数据
  const observed = reactive(original)               // 响应式数据
  expect(observed).not.toBe(original)               // 响应式数据和原始数据不能是同一个引用
  expect(isReactive(observed)).toBe(true)
  expect(isReactive(original)).toBe(false)
  // get
  expect(observed.foo).toBe(1)                      // 获取到的值与原始数据保持一致
  // has
  expect('foo' in observed).toBe(true)              // 具有原始数据的key值
  // ownKeys
  expect(Object.keys(observed)).toEqual(['foo'])    // key值是自有可见的
})
```

第二个相关单测：

```javascript
// 嵌套数据的响应式
test('nested reactives', () => {
  const original = {
    nested: {
      foo: 1
    },
    array: [{ bar: 2 }]
  }
  const observed = reactive(original)
  expect(isReactive(observed.nested)).toBe(true) // 嵌套对象响应式
  expect(isReactive(observed.array)).toBe(true) // 嵌套数组响应式
  expect(isReactive(observed.array[0])).toBe(true) // 嵌套数组中的对象依然响应式
})
```

第三个及第四个相关单测：
这里的两个单测就说明了vue3中的响应式数据操作可以直接在proxy数据上进行操作即可。

```javascript
// 响应式数据上改变的数据需要修改到原始数据上
test('observed value should proxy mutations to original (Object)', () => {
  const original: any = { foo: 1 }
  const observed = reactive(original)
  // set 在代理对象上设置了新数据，原始对象上也会新增数据
  observed.bar = 1
  expect(observed.bar).toBe(1)
  expect(original.bar).toBe(1)
  // delete 在代理对象上删除了数据，原始对象也会删除对应的数据
  delete observed.foo
  expect('foo' in observed).toBe(false)
  expect('foo' in original).toBe(false)
})
// 原始数据上修改的数据需要反映到响应式数据中
test('original value change should reflect in observed value (Object)', () => {
  const original: any = { foo: 1 }
  const observed = reactive(original)
  // set
  original.bar = 1
  expect(original.bar).toBe(1)
  expect(observed.bar).toBe(1)
  // delete
  delete original.foo
  expect('foo' in original).toBe(false)
  expect('foo' in observed).toBe(false)
})
```

单测文件看到这里也对proxy的响应式数据有了一个基本了解，现在可以去看看在以上测试用例中一直出现的一个关键性方法```reactive```了。从用例上就可以看出来这个方法就是定义响应式数据的方法。通过用例的引入语句```import { reactive, isReactive, toRaw, markRaw } from '../src/reactive'```知道这个方法是从reactive.ts文件中引入的。

## reactive源码

```javascript
// reactive.ts
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  // 调用创建响应式数据方法
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}
```

此方法比较简单就检测是否为只读的代理数据，不是就调用创建响应式数据的方法。

```javascript
// reactive.ts
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  // 检测是否是广义的对象数据
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // 已经是代理数据的直接返回
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // 获取数据是否为可代理类型数据
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  // 创建代理并记录到缓存map中
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
// 此处可以看到在获取类型时 常规的object和array都是被定义为common类型的数据  而map set数据类型被定义为collection类型数据
function targetTypeMap(rawType: string) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

function getTargetType(value: Target) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value))
}
```

到此一个proxy数据就已经创建出来了，那么这个数据是如何起到响应式的作用的呢？就需要进一步查看传入proxy中的handler对象了。
从上面的代码中可以看到collection类的数据类型主要是Map和Set的数据，常用的数据类型是在common中的。因此先看baseHandlers中的内容是怎样的。再根据传入的参数可以知道这里的baseHandlers就是mutableHandlers.

```javascript
// baseHandlers.ts
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```

这里的handler内容呢首先需要了解一下ProxyHandler的相关知识：
> 此处可以理解为由Proxy所暴露出的钩子函数，handler作为挂载钩子函数的对象存在，不同的操作会触发不同的钩子函数，handler提供了覆写钩子函数的方法。所有的钩子函数是可选的。如果某个钩子没有定义，那么就会保留默认行为。

proxy可以代理拦截的钩子函数一共有13种，分别是：

```javascript
handler.apply() // 拦截函数对象调用操作的钩子
handler.construct() // 拦截new 操作符
handler.defineProperty()
handler.deleteProperty()
handler.get()
handler.getOwnPropertyDescriptor()
handler.getPrototypeOf()
handler.has()
handler.isExtensible()
handler.ownKeys()
handler.preventExtensions()
handler.set()
handler.setPrototypeOf()
```
