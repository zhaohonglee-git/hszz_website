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
# 国外服务器
curl -fsSL https://get.docker.com | sudo bash

# 国内服务器（阿里云镜像）
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

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

### 3. （国内服务器）预拉取基础镜像

```bash
bash docker-pull.sh
```

该脚本依次尝试 4 个国内镜像代理拉取 `node:22-alpine`，有一个成功即可。

### 4. 启动

```bash
docker compose up -d --build
```

第一次需要下载和构建（3-5 分钟）。出现 `Started` 即可访问：

- 官网：http://localhost:3002
- 管理后台：http://localhost:3002/admin

> 端口说明：容器内部运行在 3001，宿主机映射到 **3002**（避免端口冲突）。如需修改，编辑 `docker-compose.yml` 中的 `ports: "3002:3001"`。

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
用户 → 域名(DNS) → 服务器 Nginx:80/443 → Docker容器:3001（宿主机映射 3002）
```

### 1. 登录服务器，安装 Docker

```bash
ssh root@你的服务器IP

# 国内服务器用阿里云镜像
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl enable docker --now
```

### 2. 上传项目

在**本地电脑**上：

```bash
# 打包项目（排除不需要的文件）
tar czf hszz.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=server/node_modules \
  --exclude=server/data.db* \
  --exclude=hszz.tar.gz \
  .

# 上传到服务器
scp hszz.tar.gz root@你的服务器IP:/opt/
```

回到**服务器**上：

```bash
cd /opt
mkdir -p hszz_website
tar xzf hszz.tar.gz -C hszz_website
cd hszz_website
```

### 3. 配置并启动

```bash
# 国内服务器：先拉取基础镜像
bash docker-pull.sh

cp .env.example .env
nano .env        # 修改密码
docker compose up -d --build
```

### 4. 安装 Nginx 并配置域名反代

```bash
sudo apt update && sudo apt install nginx -y
```

创建 Nginx 配置（**把 your-company.com 换成你的真实域名**）：

```bash
sudo nano /etc/nginx/sites-available/hszz
```

```nginx
server {
    listen 80;
    server_name www.your-company.com your-company.com;
    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 注意：这里 `proxy_pass` 填 **3002**（宿主机映射端口），而非容器的 3001。

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

### 6. 防火墙放行

```bash
# 仅开放对外端口
firewall-cmd --add-service=http --permanent
firewall-cmd --add-service=https --permanent
firewall-cmd --reload

# 如果使用 ufw
ufw allow 80/tcp && ufw allow 443/tcp
```

> 容器端口 3002 不需要对外开放 — Nginx 通过 localhost 访问即可。

---

## 日常维护

### 查看客户提交

浏览器打开 `http://你的域名/admin` → 登录 → 查看/筛选/处理。

支持按类型、品牌、故障、状态筛选，支持将结果导出为 CSV。

### 管理案例

管理后台 → 案例管理 Tab → 新增/编辑/删除案例。支持图片上传（≤10MB），上传的图片自动保存到 `public/images/cases/`。

### 数据备份

```bash
# 备份数据库（含所有客户提交和案例）
cp server/data.db ~/backup/data_$(date +%Y%m%d).db

# 备份客户上传文件
cp -r server/uploads ~/backup/uploads_$(date +%Y%m%d)

# 备份案例图片（如有新增）
tar czf ~/backup/case_images_$(date +%Y%m%d).tar.gz public/images/cases/
```

### 更新案例种子数据

在管理后台新增/修改案例后，建议同步更新种子文件，确保下次全新部署时数据完整：

```bash
cd server && node -e "
const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('data.db', { readonly: true });
const cases = db.prepare('SELECT title, industry, image, description, sort_order FROM cases ORDER BY id').all();
db.close();
fs.writeFileSync('cases-seed.json', JSON.stringify(cases, null, 2));
console.log('已更新种子数据：' + cases.length + ' 条案例');
"
# 然后 git commit + git push
```

### 更换图片

1. 把新图片放入 `public/images/` 对应目录
2. 编辑 `src/data/images.js`，改对应路径
3. `docker compose down && docker compose up -d --build`

### 更新代码

```bash
git pull
docker compose down && docker compose up -d --build
```

---

## 常见问题

**Q: 端口被占用？** 修改 `docker-compose.yml` 中 `ports` 左侧端口号（如 `"3003:3001"`），然后 `docker compose up -d`。注意同步更新 Nginx 配置中的 `proxy_pass` 端口。

**Q: 国内构建失败？** 先运行 `bash docker-pull.sh` 拉取基础镜像，再执行 `docker compose up -d --build`。Dockerfile 已配置阿里云 Alpine 源和 npmmirror npm 源。

**Q: 忘记密码？** `grep ADMIN_PASSWORD .env` 查看明文密码。

**Q: 重置数据？** `docker compose down && rm server/data.db* && docker compose up -d`。重启后数据库重建，种子数据自动导入。

**Q: 种子数据未加载？** 检查 `server/cases-seed.json` 文件是否存在。种子仅在 cases 表为空时导入（即首次部署或重置后）。

**Q: 服务器重启后网站会恢复吗？** 会。`restart: unless-stopped` 确保容器自动重启。
