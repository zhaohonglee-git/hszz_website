# CLAUDE.md — 华晟智造官网项目指引

## 项目概述

北京华晟智造科技有限公司官网，单页应用（SPA），展示工业机器人后服务业务。

## 技术栈

- **前端**: Vite + Tailwind CSS 3 + 原生 JavaScript (ES Modules)
- **后端**: Node.js + Express + SQLite (better-sqlite3)
- **部署**: Docker + Nginx 反向代理
- **图标**: Lucide Icons
- **字体**: Google Fonts (Noto Sans SC)

## 项目结构

```
hszz_website/
├── index.html              # 页面入口（单页全部区块）
├── vite.config.js          # Vite 配置（含 dev 代理 /api → 3001）
├── tailwind.config.js      # 品牌色 / 字体 / 动画
├── Dockerfile              # 多阶段构建
├── docker-compose.yml      # 生产部署编排
├── DEPLOY.md               # 零基础部署指南
├── start.sh                # 一键启动脚本
├── .env.example            # 环境变量模板
├── public/images/          # 静态图片资源
│   ├── logo/               #   企业 Logo
│   ├── hero/               #   Hero 轮播图 (1920×1080)
│   ├── services/           #   业务卡片图 (6:4)
│   ├── cases/              #   案例封面图 (8:5)
│   └── qr/                 #   微信二维码 (1:1)
├── src/
│   ├── style.css           # Tailwind 指令 + 全局组件样式
│   ├── main.js             # 主逻辑：导航/轮播/图片加载/案例/表单
│   ├── diagnostic.js       # 智能诊断多步骤表单
│   └── data/
│       ├── cases.js        # 案例静态数据（API 不可用时降级）
│       └── images.js       # 中心化图片配置
└── server/
    ├── index.js            # Express 服务器（API + 静态托管）
    ├── db.js               # SQLite 数据库（submissions + cases 表）
    ├── auth.js             # 简易 Bearer Token 鉴权
    ├── admin.html          # 管理后台（客户管理 + 案例管理）
    └── uploads/            # 客户上传的诊断文件
```

## 开发命令

```bash
npm run dev          # Vite 开发服务器 (3000)，需另开终端启动 server
bash start.sh        # 一键构建+启动后端 (3001)
npm run build        # 仅构建前端

# 后端
cd server && node index.js   # 启动 API 服务器 (3001)
```

## 配色方案

| Token | 色值 | 用途 |
|-------|------|------|
| `brand-black` | `#0D1117` | 主背景 |
| `brand-dark` | `#161B22` | 卡片/次级背景 |
| `brand-blue` | `#0066FF` | 主色调/链接 |
| `brand-orange` | `#F97316` | CTA 按钮/强调 |
| `brand-gray` | `#F3F4F6` | 辅助背景 |
| `brand-muted` | `#9CA3AF` | 弱化文字 |

## 关键架构决策

### 图片管理

所有图片通过 `src/data/images.js` 集中管理。HTML 中使用 `data-img="key"` 属性，JS 运行时调用 `applyImages()` 加载。替换图片只需修改配置文件。

### 案例数据

案例优先从 API `/api/cases` 加载，API 不可用时自动降级为 `src/data/cases.js` 静态数据。

### 管理后台

`/admin` 提供两个 Tab：
- 📋 **客户管理** — 查看/筛选/处理诊断和联系表单提交
- 📁 **案例管理** — 新增/编辑/删除案例（含图片上传）

### 表单提交流

诊断表单和联系表单通过 `/api/diagnostic` 和 `/api/contact` 提交。文件上传使用 multer `.any()` 接收。

## 常见修改指南

| 需求 | 操作 |
|------|------|
| 替换图片 | 编辑 `src/data/images.js` |
| 新增案例 | 管理后台 → 案例管理 → 新增 |
| 修改文案 | 编辑 `index.html` 对应区块 |
| 改管理密码 | 修改 `.env` 中 `ADMIN_PASSWORD`，重启 |
