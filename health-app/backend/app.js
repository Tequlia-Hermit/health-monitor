// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量 - 使用上级目录的 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.resolve(__dirname, '../frontend/public')));

// 路由
const toiletRoutes = require('./routes/toilet');
const sleepRoutes = require('./routes/sleep');
const reportRoutes = require('./routes/report');
const healthRoutes = require('./routes/health');

app.use('/api/toilet', toiletRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/health', healthRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 确保导出 app 实例
module.exports = app;