@echo off
echo 正在提交修复...
cd /d "d:\UIC\FYP\翻卡游戏"
git add .
git commit -m "修复包依赖版本问题 - 修复rate-limiter-flexible和bcrypt版本"
git push
echo.
echo 修复已提交到GitHub！
echo 现在可以在Vercel中重新部署了。
pause
