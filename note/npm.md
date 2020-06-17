# npm包发布过程

记录一下自己的第一个npm包发布流程。

1. 初始化一个npm项目，使用命令```npm init```即可，随后填入对应的数据
2. 创建自己的npm账户
 > ```npm adduser```
随后一次填入自己的用户名，密码，邮箱，注意：**第一次创建账号需要邮箱验证后方可发布npm包**
3. 登录npm账户
 > ```npm login```
登录后注意查看登录源地址是否为**https://registry.npmjs.org/**，如果不是需要切换到npm源地址
4. 发布npm包
 > ```npm publish```
5. 撤销npm发布
 > ```npm unpublish packageName@version```
6. 不再维护提示
 > ```npm deprecate <pkg>[@<version>] <message>```