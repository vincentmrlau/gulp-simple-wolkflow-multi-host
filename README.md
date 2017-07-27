# gulp-simple-workflow-multi-host

> 简单的工作流 基于Gulp 利用 gulp-preprocess 进行多环境（api域名）开发、打包
> 
> sass转css css&js&html压缩

## gulp-preprocess
[传送门](https://www.npmjs.com/package/gulp-preprocess)

* 在html中使用

```HTML
<!-- @if HOST_ENV='test' -->
<script charset="UTF-8">
    window._hostname = 'http://testhost'
</script>
<!-- @endif-->
<!-- @if HOST_ENV='qa' -->
<script charset="UTF-8">
    window._hostname = 'https://qahost'
</script>
<!-- @endif-->
```
test环境下转换效果

```HTML
<script charset="UTF-8">
    window._hostname = 'http://testhost'
</script>
```
* 在中使用

```javaScript
var host
// @if HOST_ENV='test'
host = 'testhost'
// @endif
// @if HOST_ENV='qa'
host = 'qahost'
// @endif
```
test环境下转换效果

```javaScript
var host
host = 'testhost'
```


## 调试 dev
* 自动刷新
* 不压缩

```bash
## 开发启动 默认test环境，（gulpfile.js里面配置）
npm run dev

## 调试指定的域名,可选host test qa pe （gulpfile.js里面配置）
npm run dev --host test

```

### 命令做了什么
1. 清空dist
2. 把dev文件处理完传到dist中
3. 观察dev中的文件，有变化的进行步骤2
4. 开启一个服务器
5. 观察dist中的文件，有变化即刷新浏览器

## 打包 build
* 压缩

```bash
## 打包全部
npm run build-all

## 打单个环境的包, 可选host test qa pe （gulpfile.js里面配置）
npm run build test

```
### 命令做了啥
1. 清空对应路径
2. 把文件处理传送到指定的路径中

## 调试\打包效果
> dev 源代码路径，dist 开发调试的路径 ， output 打包路径

```bash
├── README.md
├── dev
│   ├── example.js
│   └── index.html
├── dist
│   ├── example.js
│   └── index.html
├── gulpfile.js
├── output
│   ├── pe
│   │   ├── example.js
│   │   └── index.html
│   ├── qa
│   │   ├── example.js
│   │   └── index.html
│   └── test
│       ├── example.js
│       └── index.html
├── package.json
└── tree.txt
```