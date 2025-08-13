# 炸弹翻牌游戏

一个基于Web的翻牌游戏，具备前后端分离架构。

## 游戏特色

- 🎯 经典翻牌玩法
- 💰 奖金系统
- 📊 数据统计
- 👤 用户系统
- 🔒 管理员后台

## 架构说明

- **前端**: GitHub Pages (https://newtmasmine.github.io/bomb-card-game/)
- **后端**: Vercel (https://bomb-card-game-backend.vercel.app/)

## 技术特点

- 前后端分离，支持数据同步
- 本地存储作为后备，确保离线可用
- 自动故障转移机制
- RESTful API设计

## 部署方式

运行 `deploy.bat` 即可一键部署到GitHub Pages。

## API集成

游戏已集成后端API，支持：
- 用户注册/登录
- 数据同步
- 游戏会话记录
- 管理员统计

如果后端服务不可用，游戏会自动切换到本地存储模式。
