# 🚀 华晟智造官网 · 部署指南（零基础版）

---

## 方式一：本地直接运行（最快测试，5 分钟）

> 不需要 Docker，适合快速预览。

### 1. 检查 Node.js

打开终端，输入：

```bash
node -v    # 应显示 v18+
npm -v
```

如果提示"命令未找到"，去 https://nodejs.org 下载 LTS 版安装。

### 2. 安装依赖

```bash
cd hszz_website
npm install
cd server && npm install && cd ..
```

### 3. 构建 + 启动

```bash
npm run build          # 构建前端
cd server && node index.js
```

看到 `🚀 华晟智造后端已启动` 就成功了。

### 4. 打开浏览器

- 官网：http://localhost:3001
- 管理后台：http://localhost:3001/admin （密码：`hszz2024admin`）

> 按 `Ctrl+C` 停止。适合开发测试，关掉终端网站就停了。

---

## 方式二：Docker 部署（推荐生产环境，15 分钟）

### 1. 安装 Docker

**Windows/Mac：** 去 https://docker.com 下载 Docker Desktop，双击安装。

**Linux：**
```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
# 注销重新登录
```

验证：
```bash
docker -v && docker compose version
```

### 2. 设置管理密码

```bash
cp .env.example .env
nano .env    # 把 ADMIN_PASSWORD 改成你自己的强密码
```

### 3. 启动

```bash
docker compose up -d
```

第一次需要下载和构建（2-5 分钟）。出现 `Started` 即可访问 http://localhost:3001。

### 常用命令速查

| 命令 | 作用 |
|------|------|
| `docker compose up -d` | 启动 |
| `docker compose down` | 停止 |
| `docker compose restart` | 重启 |
| `docker compose logs -f` | 查看日志（Ctrl+C 退出）|
| `docker compose ps` | 查看状态 |

---

## 方式三：部署到服务器 + 绑定域名

### 前提

- 一台云服务器（阿里云/腾讯云等）
- 公司域名已解析到服务器 IP
- 服务器系统推荐 Ubuntu 22.04

### 步骤总览

```
用户 → 域名(DNS) → 服务器 Nginx:80 → Docker容器:3001
```

### 1. 登录服务器，安装 Docker

```bash
ssh root@你的服务器IP
curl -fsSL https://get.docker.com | sudo bash
```

### 2. 上传项目

在**本地电脑**上：

```bash
# 打包项目
tar czf hszz.tar.gz --exclude=node_modules --exclude=dist --exclude=.git .

# 上传到服务器
scp hszz.tar.gz root@你的服务器IP:/opt/
```

回到**服务器**上：

```bash
cd /opt
tar xzf hszz.tar.gz -C hszz_website
cd hszz_website
```

### 3. 配置并启动

```bash
cp .env.example .env
nano .env        # 修改密码
docker compose up -d
```

### 4. 安装 Nginx 并配置域名反代

```bash
sudo apt update && sudo apt install nginx -y
```

创建 Nginx 配置（**把 your-company.com 换成你的真实域名**）：

```bash
sudo nano /etc/nginx/sites-available/hszz
```

```
server {
    listen 80;
    server_name www.your-company.com your-company.com;
    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用：

```bash
sudo ln -s /etc/nginx/sites-available/hszz /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. 配置 HTTPS（免费 SSL 证书）

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-company.com -d www.your-company.com
```

---

## 日常维护

### 查看客户提交

浏览器打开 `http://你的域名/admin` → 登录 → 查看/筛选/处理。

### 数据备份

```bash
cp server/data.db ~/backup/data_$(date +%Y%m%d).db
cp -r server/uploads ~/backup/uploads_$(date +%Y%m%d)
```

### 更换图片

1. 把新图片放入 `public/images/`
2. 编辑 `src/data/images.js`，改对应路径
3. `docker compose down && docker compose up -d --build`

### 更新代码

```bash
git pull
docker compose down && docker compose up -d --build
```

---

## 常见问题

**Q: 端口被占用？** 改 `.env` 中 `PORT=3002`，重启。

**Q: 忘记密码？** `grep ADMIN_PASSWORD .env` 查看。

**Q: 重置数据？** `docker compose down && rm server/data.db* && docker compose up -d`

**Q: 服务器重启后网站会恢复吗？** 会。`restart: unless-stopped` 自动重启。
