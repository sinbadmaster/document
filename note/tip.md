# 小知识合集
冲突了2
一些开发中使用到的小知识

## 导入文件
1. 通过input accept可以控制选择文件框的文件后缀名, 如：

```html
<input type="file" accept=".doc,.xls">
```
![accept](/image/accept2.png)

2. accept接收的后缀可以让导入框识别对应mimeType从而显示对应得文件中文描述，如：
```html
<input type="file" accept=".doc">
```
![accept](/image/accept.png)