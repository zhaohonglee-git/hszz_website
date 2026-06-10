# ============================================================
# 华晟智造 — Docker 多阶段构建
# ============================================================
# 阶段 1：构建前端
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：生产运行
FROM node:22-alpine
WORKDIR /app

# 安装后端依赖
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# 复制后端源码
COPY server/ ./server/

# 复制前端构建产物
COPY --from=frontend-builder /app/dist ./dist

# 创建上传目录
RUN mkdir -p /app/server/uploads

EXPOSE 3001
ENV PORT=3001 NODE_ENV=production
CMD ["node", "server/index.js"]
