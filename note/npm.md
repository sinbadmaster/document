# npm

## npm依赖

1. 全局依赖，在命令行中使用
2. 本地依赖，可以在项目中使用

- 项目依赖: dependencies
- 开发依赖: devDependencies
- 同等依赖: peerDependencies, 此包依赖于的其他包
- 可选依赖: optionalDependencies
- 打包依赖: bundledDependencies

## npm版本

版本号与package.json中的version保持一致如：1.0.0（major.minor.patch）
升级版本可以通过 ```npm version [major / minor / patch]```实现与git同步标记tag
版本标识符 ~ 第二个版本号不变  ^ 第一个版本号不变 @ 指定版本 > < >= <= 与指定版本的逻辑关系

## npm发包

记录一下自己的第一个npm包发布流程。

1. 初始化一个npm项目，使用命令```npm init```即可，随后填入对应的数据
2. 创建自己的npm账户

  > ```npm adduser```
  随后一次填入自己的用户名，密码，邮箱，注意：**第一次创建账号需要邮箱验证后方可发布npm包**

3. 登录npm账户

  > ```npm login```
  登录后注意查看登录源地址是否为**<https://registry.npmjs.org/>**，如果不是需要切换到npm源地址
  
  ```bash
  nrm ls #列出源地址list
  nrm use
  nrm add
  nrm --help
  ```

4. 发布npm包

 > ```npm publish```

5. 撤销npm发布

 > ```npm unpublish packageName@version```

6. 不再维护提示

 > ```npm deprecate <pkg>[@<version>] <message>```
