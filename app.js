const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 根路由返回我们的HTML文件
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`设备维修管理系统运行在端口 ${port}`);
}); 