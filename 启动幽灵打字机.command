#!/bin/bash
# 启动幽灵打字机 (Ghost Typewriter)
# 此文件为 macOS 启动脚本

cd "$(dirname "$0")"

echo "===================================================="
echo "   幽灵打字机 Ghost Typewriter v9.0 (Adversarial)   "
echo "===================================================="
echo "正在检查环境并启动开发服务器..."

# 检查 node_modules 是否存在，不存在则安装
if [ ! -d "node_modules" ]; then
    echo "未发现依赖库，正在运行 npm install..."
    npm install
fi

# 启动并自动打开浏览器
npm run dev -- --open
