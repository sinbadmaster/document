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
handler.apply()                    // 拦截函数对象调用操作的钩子
handler.construct()                // 拦截 new 操作符
handler.defineProperty()           // 拦截对对象的 Object.defineProperty() 操作
handler.deleteProperty()           // 拦截 delete 操作
handler.get()                      // 拦截对象的读取属性操作
handler.getOwnPropertyDescriptor() // 拦截 Object.getOwnPropertyDescriptor() 操作
handler.getPrototypeOf()           // 拦截读取对象原型的操作
handler.has()                      // 拦截 in 操作
handler.isExtensible()             // 拦截对对象的Object.isExtensible()
handler.ownKeys()                  // 拦截获取自身属性列表的操作
handler.preventExtensions()        // 拦截 Object.preventExtensions()
handler.set()                      // 拦截设置属性值的操作
handler.setPrototypeOf()           // 拦截 Object.setPrototypeOf()
```

在reactive模块中并没有完全使用全部钩子，不过也使用了对象属性读取和设置的全部钩子。根据对响应式数据的了解，知道对数据读取的操作会进行订阅，而对数据设置的操作会进行发布。那么就知道get，has，ownKeys的钩子会进行数据订阅操作，即track。set，deleteProperty会进行发布操作，即trigger。现在还是从这个可变数据拦截器作为起点进行学习。

首先看一看get拦截器内具体都做了哪些操作：

```javascript
// baseHandlers.ts
const get = /*#__PURE__*/ createGetter()

// 以默认参数调用，       非只读             非浅观测
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    // 获取Vue自身定义的一些特殊属性
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (
      key === ReactiveFlags.RAW &&
      receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)
    ) {
      return target
    }

    const targetIsArray = isArray(target)
    // 对同时会get方法名及length的数组方法做特别处理
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    // 利用反射获取get的返回值
    const res = Reflect.get(target, key, receiver)
    // 对特殊的key值直接返回结果不会进行依赖收集
    if (
      isSymbol(key)
        ? builtInSymbols.has(key as symbol)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }
    // 对非只读的数据进行依赖收集
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
    // 对浅追踪的数据只追踪本层级
    if (shallow) {
      return res
    }
    // 对ref数据自动解包
    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }
    // 对返回数据是广义对象的数据进行loop追踪，深层次响应式
    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
```

在get拦截器中的逻辑总结一下：

1. 对特定数据进行直接的数据返回，如：vue自定义数据，数组中会改变数组长度的方法，key属于symbol或__proto__
2. 对嵌套数据默认深层次响应式
3. 对ref数据具有自动解包能力

下面就可以查看数据依赖是如何收集的了，进入到effect.ts中查看对应的方法

```javascript
// effect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}
```
