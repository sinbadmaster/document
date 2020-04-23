# 字符串无重复最长子串长度-javascript实现

求取字符串中无重复最长子字符串得长度，之前在面试中也有碰到。然后在leetcode得题目中也看到了这个题目。现在记录一下当时得解题方法和思路。

## 1.解题思路
首先想到的将未重复的子字符串维护起来，最后来比对字串长度，得出最大长度。然后在实现的过程中发现这样的维护并不好做，于是想到了另一个思路，记录未重复子字符的长度，当有重复的字符出现的时候记录下此时的子串长度，最后输出最长的子串长度即可。

## 2.实现代码
```javascript
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
  // 空字符串直接返回0
  if (!s) { return 0 };
  const map = new Map();
  // 结果值
  let result = 0;
  // 出现重复字符时，此前的长度值
  let dupLength = 0;
  const { max } = Math;
  for (let i = 0;i < s.length;i++) {
      const word = s[i];
      if (map.has(word)) {
        // 获取重复字符出现时已存的长度
        // 此处为何取其中的较大值：
        // 因为如果再次出现的重复字符get的长度比dupLength更小
        // 即在这两个重复字符之间还存在其他重复字符
        dupLength = max(map.get(word), dupLength);
      }
      // 更新结果值
      result = max(result, i - dupLength + 1);
      // 更新此字符所代表的长度值
      map.set(word, i + 1);
  }
  return result;
};
```