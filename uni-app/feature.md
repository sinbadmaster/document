# renderjs中视图层与逻辑层数据传输坑点

最近在学习使用uni-app的过程中发现了一个比较违反认知的情况。**即renderjs通过逻辑层传递到视图层的数据在只是引用改变的时候不会触发视图层的接受方法。**

## 示例如下

```javascript
<template>
  <view>
    这是一个测试组件
        <button type="default" @click="changeTest"> 改变测试数据 </button>
        <view :renderChange="testData" :change:renderChange="testModule.testChange"></view>
  </view>
</template>

<script>
export default {
      data() {
    return {
      testData: [],
              count: 1
    };
  },
      methods: {
          changeTest() {
              this.count += 1
              this.testData = [1]
              console.log('change test');
          }
      }
};
</script>

<script lang="renderjs" module="testModule">
    export default {
        methods: {
            testChange(val) {
                console.log(JSON.stringify(val))
                alert(JSON.stringify(val));
            }
        }
    }
    
</script>
```

按照官方的示例逻辑层向视图层可以通过以上方式来传递参数, 当逻辑层中的```testData```发生改变时就会将新的值传递到视图层中。问题就出在发生改变后会传递数据到视图层。

在js中数据分为了基础数据类型和引用数据类型，对于引用类型的数据来说，改变其引用才能叫做改变了这个数据的值。而在uni-app中向renderjs传值的过程中，如果改变引用前后这个值转为字符串的值并没有发生改变，这个新的值是不会传递到视图层的。正如上方的测试程序，在第一次执行的时候testData改变为一个新的数组，并且包含一个数字1，视图层可以得到这次数据更新。而后再次点击，虽然每次testData都会获得一个新的数组引用，但是却不会将引用的变化反馈到视图层。

![dataChange](/image/render.jpg)

如上图所示日志显示只有第一次的数据传递到了视图层此问题在app端必定会出现，那么在h5端呢？

![dataChange2](/image/render2.jpg)

从日志中可以发现在h5端的时候是没有这个现象的，每一次数据引用的改变都会传递到renderjs中。当然在h5端事实上是不存在视图层，逻辑层的关系的。h5端中的renderjs只是使用mixins将renderjs模块合并进入了主模块。

## 思考

那么现在想想如果是直接通过数据下标来改变数组中的值是否可以传递到renderjs中呢？
答案是不能的，无论是在app端亦或是在h5端都不会因为直接通过下标改变了数组中的值而传递这次改变到主模块儿中。感兴趣可以自己尝试，验证一下。
