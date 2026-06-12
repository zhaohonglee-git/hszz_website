# ============================================================
# 华晟智造 — Docker 多阶段构建（代理拉取 + 国内源）
# ============================================================
# 基础镜像通过代理拉取，不依赖 Docker daemon 配置

# ---------- 阶段 1：构建前端 ----------
FROM docker.1ms.run/library/node:22-alpine AS frontend-builder

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && npm config set registry https://registry.npmmirror.com

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 阶段 2：生产运行 ----------
FROM docker.1ms.run/library/node:22-alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && npm config set registry https://registry.npmmirror.com \
    && apk add --no-cache python3 make g++

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist

RUN mkdir -p /app/server/uploads

EXPOSE 3001
ENV PORT=3001 NODE_ENV=production
CMD ["node", "server/index.js"]
