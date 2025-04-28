# ResumeShow - 自托管的在线简历展示系统

一个现代化的自托管简历展示系统，基于Vue3和Node.js开发，支持隐私保护和自定义主题。

## 功能特点

- 🚀 基于Vue3和Node.js的现代技术栈
- 🔒 内置隐私保护机制，敏感信息需要密码验证
- 📱 响应式设计，完美适配移动端和桌面端
- 🎨 支持自定义主题和样式
- 📝 结构化的简历数据管理
- 🖼️ 支持项目截图展示
- 📋 支持在线预览和打印

## 技术栈

- 前端：Vue3 + TypeScript + Element Plus + Vite
- 后端：Node.js + Express

## 快速开始

### 安装依赖

```bash
npm run install-all
```

### 启动开发服务器

```bash
npm run dev
```

## 简历数据配置

编辑 `backend/data/resumeData.js` 文件来配置您的简历信息，包括：

- 个人基本信息
- 工作经历
- 项目经验
- 教育背景
- 个人项目展示

## 隐私保护

系统内置隐私保护机制，可以保护敏感信息（如联系方式）。访客需要输入正确的密码才能查看完整信息。

配置密码：
```javascript
// backend/data/resumeData.js
const PRIVACY_PASSWORD = 'your_password';
```

## 项目结构

```
├── frontend/          # 前端项目
│   ├── src/
│   └── vite.config.js
├── backend/           # 后端项目
│   ├── data/         # 简历数据
│   └── server.js
└── package.json
```