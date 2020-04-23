# 外观数列

即此数列中第n项是对第n-1项的描述，数列的第一项为1.
形如，并以此类推：

|序号|当前项|描述
|:--|:--|:--
|1|1|N/A
|2|11|第二项为第一项的描述'1个1'
|3|21|第三项为第二项的描述'2个1'
|4|1211|第四项为第三项的描述'1个2 1个1'
|5|111221|第五项为第四项的描述'1个1 1个2 2个1'

## 1.解题思路

当给出项数n以后，我们需要知道这一项最后会输出什么。就可以直接使用迭代，从第一项推到第n项即可。

## 2.代码实现

```javascript
/**
 * @description 外观数列
 * 第一项为 1，后一项是对前一项的描述，详细可见百度对外观数列的定义
 * 主要解题思路利用递归描写n-1项，利用正则\1反向引用第一个捕获组内容
 * @param {number} n
 * @return {string}
 */
var countAndSay = function (n) {
    var returnStr = '1';
    for (var count = 2; count <= n; count++) {
        // 利用正则表达式的反向引用，将 '111221' 字符串识别为['111', '22', '1']
        // 从而进入下一次的迭代
        returnStr = returnStr.match(/(\d)\1*/g).reduce(function (init, item) {
            return init + item.length + item[0];
        }, '');
    }
    return returnStr;
};
```
