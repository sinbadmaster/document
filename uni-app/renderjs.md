# renderjs使用

**renderjs**是一个运行在视图层的js。它只支持app-vue和h5。
**renderjs**的主要作用有2个：

- 大幅降低逻辑层和视图层的通讯损耗，提供高性能视图交互能力
- 在视图层操作dom，运行for web的js库

详细参考[官方文档](https://uniapp.dcloud.net.cn/frame?id=renderjs)

## 使用时的注意事项

- 目前仅支持内联使用。
- 不要直接引用大型类库，推荐通过动态创建 script 方式引用。
- 可以使用 vue 组件的生命周期不可以使用 App、Page 的生命周期
- 视图层和逻辑层通讯方式与 WXS 一致，另外可以通过 this.$ownerInstance 获取当前组件的 ComponentDescriptor 实例。
- 观测更新的数据在视图层可以直接访问到。
- APP 端视图层的页面引用资源的路径相对于根目录计算，例如：./static/test.js。
- APP 端可以使用 dom、bom API，不可直接访问逻辑层数据，不可以使用 uni 相关接口（如：uni.request）
- H5 端逻辑层和视图层实际运行在同一个环境中，相当于使用 mixin 方式，可以直接访问逻辑层数据。

## renderjs与逻辑层通信示例

```javascript
<template>
  <view>
    <text>renderjs区域</text>
        <view @click="renderScript.emitData" :msg="msg" :change:msg="renderScript.receiveMsg" class="renderjs" id="renderjs-view">
        </view>
        <button @click="changeMsg" class="app-view">app-view</button>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        msg: ''
      };
    },
    methods: {
      // 触发逻辑层出入renderjs数据改变
      changeMsg() {
        this.msg = 'hello renderjs' + Math.random() * 10;
      },
      // 接收renderjs发回的数据
      receiveRenderData(val) {
        console.log('receiveRenderData-->', val);
      }
    }
  };
</script>

<script module="renderScript" lang="renderjs">
    export default {
      data() {
        return {
          name: 'render-vm'
        }
      },
      mounted() {
        const view = document.getElementById('renderjs-view')
        const button = document.createElement('button')
        button.innerText = '一个按钮'
        view.appendChild(button)
      },
      methods: {
        // 接收逻辑层发送的数据
        receiveMsg(newValue, oldValue, ownerVm, vm) {
          console.log('newValue', newValue)
          console.log('oldValue', oldValue)
          console.log('ownerVm', ownerVm)
          console.log('vm', vm)
        },
        // 发送数据到逻辑层
        emitData(e, ownerVm) {
          ownerVm.callMethod('receiveRenderData', this.name)
        }
      }
    };
</script>

```
