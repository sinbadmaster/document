# java基础学习

## 数据类型
1. 基础数据类型
字符类型 char
逻辑类型 boolean
整数类型 byte short int long
小数类型 float double

## 类型转换

char，byte，short -> int -> long -> float -> double

## 面向对象编程

1. 考虑应该具有的对象
2. 考虑对象与对象之间的关系
3. 对象具有自身合适的属性及方法


# Spring学习

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