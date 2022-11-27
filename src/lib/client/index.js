const io = require("socket.io-client/dist/socket.io"); // websocket客户端
let hotEmitter = require("./emitter"); // 和hot/dev-server.js共用一个EventEmitter实例，这里用于发射事件

let currentHash; // 最新的编译hash

// 连接服务器
const URL = "/";
const socket = io(URL);

const onSocketMessage = {
    // 注册hash事件回调，这个回调主要干了一件事，获取最新的编译hash值
    hash(hash) {
        console.log("hash",hash);
        currentHash = hash;// 获取最新hash
    },
    // 注册ok事件回调，调用reloadApp进行热更新
    ok() {
        console.log("ok");  
        reloadApp();// 开始热更新
    },
    connect() {
        console.log("client connect successful");
    }
};
// 将onSocketMessage进行循环，给websocket注册事件
Object.keys(onSocketMessage).forEach(eventName => {
    let handler = onSocketMessage[eventName];
    socket.on(eventName, handler);
});


// reloadApp中 发射webpackHotUpdate事件
let reloadApp = () => {
    let hot = true;
    if (hot) {// 是否支持热更新
        // 如果支持的话发射webpackHotUpdate事件
        hotEmitter.emit("webpackHotUpdate", currentHash);
    } else {
        // 如果不支持则直接刷新浏览器	
        window.location.reload();
    }
}
