# 北京华晟智造科技有限公司 · 官方网站

> 工业机器人后服务专家 — 维修保养 · 编程调试 · 系统集成 · 备品备件 · 二手机翻新及销售

## ✨ 特性

- 🎠 **三页 Hero 轮播** — 核心业务 / 埃斯顿官方授权 / 团队实力
- 🛠️ **六大业务展示** — 带图片头图卡片，6:4 自适应比例
- 📋 **在线智能诊断** — 三步骤表单（品牌→故障→上传+留资）
- 📚 **行业知识库** — 10 篇专业问答 Accordion
- 🎞️ **案例双轨滚动** — 无限循环画廊，行业筛选
- 📱 **Mobile-First** — 触控按钮 ≥48px
- 🔧 **管理后台** — 客户提交管理 + 案例 CRUD（/admin）
- 🐳 **Docker 部署** — 一键容器化

## 🚀 快速开始

```bash
npm install && cd server && npm install && cd ..
bash start.sh
# 官网: http://localhost:3001
# 后台: http://localhost:3001/admin (密码: hszz2024admin)
```

## 🐳 服务器部署（CentOS Stream 9）

### 1. 登录服务器 & 安装 Docker

```bash
ssh root@你的服务器IP

# 安装 Docker
curl -fsSL https://get.docker.com | bash
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
  .

scp hszz.tar.gz root@你的服务器IP:/opt/
```

### 3. 解压 & 配置

回到**服务器**：

```bash
cd /opt
mkdir hszz_website
tar xzf hszz.tar.gz -C hszz_website
cd hszz_website

# 设置管理密码
cp .env.example .env
vi .env   # 修改 ADMIN_PASSWORD
```

### 4. 启动

```bash
docker compose up -d --build

# 检查状态
docker compose ps
docker compose logs --tail=20
```

### 5. 防火墙放行

```bash
firewall-cmd --add-port=3001/tcp --permanent
firewall-cmd --reload
```

### 6. 访问

```
http://服务器IP:3001        # 官网
http://服务器IP:3001/admin  # 管理后台
```

### 运维速查

| 操作 | 命令 |
|------|------|
| 停止 | `docker compose down` |
| 重启 | `docker compose restart` |
| 更新 | `docker compose down && docker compose up -d --build` |
| 日志 | `docker compose logs -f` |
| 备份 | `cp server/data.db ~/backup/` |

## 🛠️ 技术栈

Vite · Tailwind CSS 3 · 原生 JS · Lucide Icons · Node.js · Express · SQLite · Docker

## 📄 许可证

Copyright &copy; 2024–2026 北京华晟智造科技有限公司
