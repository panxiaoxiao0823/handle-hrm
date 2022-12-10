# 实现webpack热更新HMR
通过手写一个webpack热更新HMR，深入了解webpack-dev-server、webpack-dev-middleware、webpack-hot-middleware实现原理
这是我根据文章[实现webpack热更新HMR](https://juejin.im/post/5df36ffd518825124d6c1765#heading-58) 和 [github项目](https://github.com/gracehui88/HMR)克隆实现的

现有的webpack热更新实现
1. webpack-dev-server
    a. Webpack-Dev-Server 就是内置了 Webpack-dev-middleware 和 Express 服务器，以及利用websocket替代eventSource实现webpack-hot-middleware的逻辑
2. webpack-hot-middleware + webpack-dev-middlerware 
    a. 原理与 webpack-dev-server 类似，他们的最大区别就是浏览器和服务器之间的通信方式，webpack-dev-server使用的是websocket，webpack-hot-middleware使用的是eventSource

本项目实现的事上面方式一，方式二没有实现，方式二可以查看原作者[github项目](https://github.com/gracehui88/HMR)

### 安装依赖
```
npm install
```

### 启动项目
```
npm run dev
```
