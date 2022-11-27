const webpack = require("webpack");
const Server = require("./lib/server/Server");
const config = require("../webpack.config")

// 创建webpack-dev-server服务器
// 创建webpack实例 
const compiler = webpack(config);
// 创建Server实例，这个类里面包含了webpack-dev-server服务端的主要逻辑
const server = new Server(compiler);

server.listen(8000, "localhost", () => {
    console.log(`Project is running at http://localhost:8000/`);
})
