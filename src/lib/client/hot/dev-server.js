let hotEmitter = require("../emitter"); // 和 /src/lib/client/index.js 公用一个EventEmitter实例
let currentHash;// 最新编译hash
let lastHash;// 上一次编译hash

// 监听webpackHotUpdate事件,然后执行hotCheck()方法进行检查
hotEmitter.on("webpackHotUpdate", (hash) => {
    currentHash = hash;
    if (!lastHash) {// 说明是第一次请求
        return lastHash = currentHash
    }
    hotCheck();
})

// 调用hotCheck拉取两个补丁文件
let hotCheck = () => {
    hotDownloadManifest().then(hotUpdate => { // {"h":"58ddd9a7794ab6f4e750","c":{"main":true}}
        let chunkIdList = Object.keys(hotUpdate.c);
        // 循环更新的chunk，拉取新代码
        chunkIdList.forEach(chunkID => {
            hotDownloadUpdateChunk(chunkID);
        });
        lastHash = currentHash;
    }).catch(err => {
        window.location.reload();
    });
}

// 拉取lashhash.hot-update.json，向 server 端发送 Ajax 请求，服务端返回一个 Manifest文件(lasthash.hot-update.json)，该 Manifest 包含了本次编译hash值 和 更新模块的chunk名
let hotDownloadManifest = () => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let hotUpdatePath = `${lastHash}.hot-update.json`// xxxlasthash.hot-update.json
        xhr.open("get", hotUpdatePath);
        xhr.onload = () => {
            let hotUpdate = JSON.parse(xhr.responseText);
            resolve(hotUpdate); // {"h":"58ddd9a7794ab6f4e750","c":{"main":true}}
        };
        xhr.onerror = (error) => {
            reject(error);
        }
        xhr.send();
    })
}
// 拉取更新的模块chunkName.lashhash.hot-update.js，通过JSONP请求获取到更新的模块代码
let hotDownloadUpdateChunk = (chunkID) => {
    let script = document.createElement("script")
    script.charset = "utf-8";
    script.src = `${chunkID}.${lastHash}.hot-update.js`//chunkID.xxxlasthash.hot-update.js
    document.head.appendChild(script);
}

// 这个hotCreateModule很重要，module.hot的值 就是这个函数执行的结果
let hotCreateModule = (moduleID) => {
    let hot = { // module.hot属性值
        accept(deps = [], callback) {
            deps.forEach(dep => {
                // 调用accept将回调函数 保存在module.hot._acceptedDependencies中
                hot._acceptedDependencies[dep] = callback || function () { };
            })
        },
        check: hotCheck
    }
    return hot;
}

// 补丁JS取回来后会调用webpackHotUpdate方法(请看update chunk的格式)，里面会实现模块的热更新
window.webpackHotUpdate = (chunkID, moreModules) => {
    //循环新拉来的模块
    Object.keys(moreModules).forEach(moduleID => {
        // 通过__webpack_require__.c 模块缓存找到旧模块
        let oldModule = __webpack_require__.c[moduleID];

        // 更新__webpack_require__.c，利用moduleID将新的拉来的模块覆盖原来的模块
        let newModule = __webpack_require__.c[moduleID] = {
            i: moduleID,
            l: false,
            exports: {},
            hot: hotCreateModule(moduleID),
            parents: oldModule.parents,
            children: oldModule.children
        };

        // 执行最新编译生成的模块代码
        moreModules[moduleID].call(newModule.exports, newModule, newModule.exports, __webpack_require__);
        newModule.l = true;

        // 让父模块中存储的_acceptedDependencies执行
        newModule.parents && newModule.parents.forEach(parentID => {
            let parentModule = __webpack_require__.c[parentID];
            parentModule.hot._acceptedDependencies[moduleID] && parentModule.hot._acceptedDependencies[moduleID]()
        });
    })
}
