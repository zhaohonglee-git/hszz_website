# ============================================================
# 华晟智造 — Docker 多阶段构建（全国内源）
# ============================================================

# ---------- 阶段 1：构建前端 ----------
FROM node:22-alpine AS frontend-builder

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && npm config set registry https://registry.npmmirror.com

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 阶段 2：生产运行 ----------
FROM node:22-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && npm config set registry https://registry.npmmirror.com \
    && apk add --no-cache python3 make g++

WORKDIR /app

# 安装后端依赖（better-sqlite3 可能需要本地编译）
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist

RUN mkdir -p /app/server/uploads

EXPOSE 3001
ENV PORT=3001 NODE_ENV=production
CMD ["node", "server/index.js"]
