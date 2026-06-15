# 北京华晟智造科技有限公司 · 官方网站

> 工业机器人后服务专家 — 维修保养 · 编程调试 · 系统集成 · 备品备件 · 二手机翻新及销售

## ✨ 特性

- 🎠 **三页 Hero 轮播** — 核心业务 / 埃斯顿官方授权 / 团队实力
- 🛠️ **六大业务展示** — 带图片头图卡片，6:4 自适应比例
- 📋 **在线智能诊断** — 三步骤表单（品牌→故障→上传+留资）
- 📁 **典型案例展示** — 18 条真实案例，8 个行业分类，无限循环画廊
- 📱 **Mobile-First** — 触控按钮 ≥48px，响应式适配
- 🔧 **管理后台** — 客户提交管理 + 案例 CRUD + CSV 导出（`/admin`）
- 🌱 **种子数据** — 案例数据随仓库持久化，首次部署自动初始化
- 🐳 **Docker 部署** — 多阶段构建，国内镜像源，一键容器化

## 📁 项目结构

```
hszz_website/
├── index.html                  # 页面入口（SPA 全部区块）
├── vite.config.js              # Vite 配置（dev 代理 /api → 3001）
├── tailwind.config.js          # 品牌色 / 字体 / 动画
├── Dockerfile                  # 多阶段构建（国内镜像源）
├── docker-compose.yml          # 生产编排（3002:3001）
├── docker-pull.sh              # 国内镜像拉取兜底脚本
├── start.sh                    # 一键构建启动
├── .env.example                # 环境变量模板
├── DEPLOY.md                   # 零基础部署指南
├── public/
│   └── images/
│       ├── logo/               # 企业 Logo
│       ├── hero/               # Hero 轮播图 (1920×1080)
│       ├── services/           # 业务卡片图 (6:4)
│       ├── cases/              # 案例封面图（18 张，纳入版本管理）
│       └── qr/                 # 微信二维码 (1:1)
├── src/
│   ├── style.css               # Tailwind 指令 + 全局组件样式
│   ├── main.js                 # 主逻辑：导航/轮播/图片加载/案例/表单
│   ├── diagnostic.js           # 智能诊断多步骤表单
│   └── data/
│       ├── cases.js            # 案例静态数据（API 不可用时降级）
│       └── images.js           # 中心化图片配置
└── server/
    ├── index.js                # Express 服务器（API + 静态托管）
    ├── db.js                   # SQLite 数据库（含种子数据加载）
    ├── auth.js                 # Bearer Token 鉴权
    ├── cases-seed.json         # 18 条典型案例种子数据
    ├── admin.html              # 管理后台（客户管理 + 案例管理 + CSV 导出）
    └── uploads/                # 客户上传的诊断文件
```

## 🚀 快速开始

```bash
# 安装依赖
npm install && cd server && npm install && cd ..

# 一键构建+启动
bash start.sh

# 官网：http://localhost:3001
# 后台：http://localhost:3001/admin （默认密码：hszz2024admin）
```

## 🐳 服务器部署（CentOS Stream 9 / Ubuntu 22.04）

### 1. 登录服务器 & 安装 Docker

```bash
ssh root@你的服务器IP

# 国内服务器用阿里云镜像安装
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable docker --now

# 验证
docker -v && docker compose version
```

### 2. 上传项目

在**本地电脑**执行：

```bash
cd hszz_website
tar czf hszz.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=server/node_modules \
  --exclude=server/data.db* \
  --exclude=hszz.tar.gz \
  .

scp hszz.tar.gz root@你的服务器IP:/opt/
```

### 3. 解压 & 配置

回到**服务器**：

```bash
cd /opt
mkdir -p hszz_website
tar xzf hszz.tar.gz -C hszz_website
cd hszz_website

# 设置管理密码
cp .env.example .env
vi .env   # 修改 ADMIN_PASSWORD 为你自己的强密码
```

### 4. 启动

```bash
# 国内服务器：先运行兜底脚本拉取基础镜像
bash docker-pull.sh

# 构建并启动
docker compose up -d --build

# 检查状态
docker compose ps
docker compose logs --tail=30
```

### 5. 防火墙放行

```bash
firewall-cmd --add-port=3002/tcp --permanent
firewall-cmd --reload
```

### 6. 访问

```
http://服务器IP:3002              # 官网
http://服务器IP:3002/admin        # 管理后台
```

### 部署架构

```
浏览器 → http://服务器:3002 → Docker 容器(端口映射 3002:3001) → Node.js:3001
```

## 🌱 种子数据说明

项目内置 18 条典型案例数据（`server/cases-seed.json`），覆盖维护保养、零部件更换、程序调试、故障排查、机器人翻新、机器人培训、库存二手机、原厂备件 8 个行业。

- **首次部署**：数据库为空时自动导入 18 条案例
- **后续更新**：已有数据时跳过导入，不影响后台已增改的内容
- **固化方法**：在管理后台调整案例后，如需更新种子数据，参考 CLAUDE.md 中的导出步骤
- **案例图片**：所有封面图存储在 `public/images/cases/`，纳入 Git 版本管理

## 🔧 运维速查

| 操作 | 命令 |
|------|------|
| 启动 | `docker compose up -d` |
| 停止 | `docker compose down` |
| 重启 | `docker compose restart` |
| 更新 | `git pull && docker compose down && docker compose up -d --build` |
| 日志 | `docker compose logs -f` |
| 备份数据库 | `cp server/data.db ~/backup/data_$(date +%Y%m%d).db` |
| 重置数据 | `docker compose down && rm server/data.db* && docker compose up -d` |

## 🛠️ 技术栈

Vite · Tailwind CSS 3 · 原生 JavaScript (ES Modules) · Lucide Icons · Google Fonts (Noto Sans SC) · Node.js · Express · SQLite (better-sqlite3) · Docker · Nginx

## 📄 许可证

Copyright &copy; 2024–2026 北京华晟智造科技有限公司
