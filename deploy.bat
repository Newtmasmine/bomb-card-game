@echo off
echo 正在部署到GitHub Pages...

REM 设置Git路径
set "GIT_PATH=D:\x64\Git\bin\git.exe"

REM 检查git是否存在
if not exist "%GIT_PATH%" (
    echo Git未找到，请检查路径: %GIT_PATH%
    pause
    exit /b 1
)

REM 初始化git仓库（如果还没有初始化）
if not exist ".git" (
    echo 初始化Git仓库...
    "%GIT_PATH%" init
    "%GIT_PATH%" remote add origin https://github.com/newtmasmine/bomb-card-game.git
)

REM 添加所有文件
echo 添加文件到Git...
"%GIT_PATH%" add .

REM 提交更改
echo 提交更改...
"%GIT_PATH%" commit -m "Deploy bomb card game with backend integration"

REM 推送到GitHub Pages分支
echo 推送到GitHub...
"%GIT_PATH%" branch -M gh-pages
"%GIT_PATH%" push -u origin gh-pages --force

echo 部署完成！
echo 访问: https://newtmasmine.github.io/bomb-card-game/
pause
