#!/bin/bash
set -e
echo "========================================"
echo "  华晟智造官网 · 快速启动"
echo "========================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装：https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 .env 已创建，默认密码 hszz2024admin，建议编辑修改"
fi

[ ! -d node_modules ] && echo "📦 安装前端依赖..." && npm install
[ ! -d server/node_modules ] && echo "📦 安装后端依赖..." && (cd server && npm install)

echo "🔨 构建前端..."
npm run build

echo ""
echo "🚀 启动服务器..."
echo "   官网: http://localhost:3001"
echo "   后台: http://localhost:3001/admin"
echo "   密码: $(grep ADMIN_PASSWORD .env 2>/dev/null | cut -d= -f2)"
echo "   Ctrl+C 停止"
echo ""

cd server && node index.js
