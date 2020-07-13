# java基础学习

## 数据类型

1. 基础数据类型
字符类型 char(一个单一的16位 Unicode字符)
逻辑类型 boolean(一位)
整数类型 byte(8) short(16) int(32) long(64) 带符号的二进制整数，如byte可以表示 -2^7 至 2^7 - 1之间的整数
小数类型 float(32) double(64)

## 类型转换

char，byte，short -> int -> long -> float -> double

## 面向对象编程

### 思维模式

1. 考虑应该具有的对象
2. 考虑对象与对象之间的关系
3. 对象具有自身合适的属性及方法

### 继承

1. super指向父类
2. this指向自身，并能通过this()调用自身的重载构造方法

## 权限修饰符

修饰符  |类内部|同一个包|子类|任何地方
:----  |:--   |:--    |:-- |:--
private|y     |n      |n   |n
default|y     |y      |n   |n
protected|y   |y      |y   |n
public |y     |y      |y   |y

## Spring学习

## 1. Spring环境配置获取

```java
Environment env = (Environment) SpringContextUtil.getBean(Environment.class);
env.getProperty("配置项的名称");
```

参考 [java使用指定编码读取properties文件](https://blog.csdn.net/a912542507/article/details/78269936?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-2.nonecase)
spring框架读取配置文件时，会将配置文件内的数据按照 ```ISO-8859-1```编码读取，如有中文配置项需要手动重写编码格式
注意: **ide中设置配置文件编码时，不要选 Transparent native-to-ascii conversion 避免将中文配置项转换为Unicode**

```java
String info = env.getProperty("配置项的名称");
accountName = new String(info.getBytes(Charset.forName("ISO-8859-1")), Charset.forName("UTF-8"));
```

![ide-setting](/image/ide-setting.jpg)

## 解压缩工具类学习

[参考文档](https://blog.csdn.net/justry_deng/article/details/82846356)

## response

java可以使用```response.getOutputStream()```便捷的获取返回输出流，从而使用流输出文件。
输出文件的时候```response.setHeader("Content-disposition","inline;filename=" + fileName);```为在浏览器中预览对应文件
```response.setHeader("Content-disposition","attachment;filename=" + fileName);```为当做附件下载此文件

## 注解

一个使用注解注入的类，使用new 实例化对象会导致其注入的内容失效。[参考文章](https://www.cnblogs.com/cat-/p/10014477.html)

## interface abstract

interface 接口可以实现多继承，多个不同的类可以实现同一个接口，也可以实现多个接口，接口是特殊的抽象类
abstract 抽象类，只定义而不去实现的类

## java异常

## Error

系统本身的错误，不应该由程序进行处理

## Exception

程序中的异常情况，RunTimeException，Exception。

1. RunTimeException 可以不用捕获的运行时异常情况。
2. Exception 需要进行捕获处理的程序异常，通过捕获相关的异常并处理使程序即使在异常情况发生时也可以正常运行。