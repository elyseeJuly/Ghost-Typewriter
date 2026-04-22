@echo off
TITLE 幽灵打字机 Ghost Typewriter v9.0
echo ====================================================
echo    幽灵打字机 Ghost Typewriter v9.0 (Adversarial)   
echo ====================================================
echo 正在检查环境并启动开发服务器...

cd /d %~dp0

IF NOT EXIST node_modules (
    echo 未发现依赖库，正在运行 npm install...
    call npm install
)

call npm run dev -- --open
pause
