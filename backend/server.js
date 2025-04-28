const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入模块化的数据和工具函数
const {
  resumeData,
  PRIVACY_PASSWORD,
  privacyConfig,
} = require('./data/resumeData');
const { maskPrivateData } = require('./utils/privacyUtils');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 定义需要掩码的字段配置
const fieldsToMask = {
  personalInfo: ['age', 'name', 'phone'],
  education: ['school', 'major', 'verificationCode', 'period'],
  workExperience: ['company', 'period'],
};

// API路由
app.post('/api/resume', (req, res) => {
  const { password } = req.body;
  const isAuthenticated = password === PRIVACY_PASSWORD;

  // 使用通用的隐私数据处理函数
  const responseData = maskPrivateData(
    resumeData,
    isAuthenticated,
    fieldsToMask,
    privacyConfig.maskText
  );

  res.json({
    success: true,
    isAuthenticated,
    data: responseData,
  });
});

// 静态文件服务（如果需要）
app.use(express.static('public'));

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
