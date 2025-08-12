# 🚀 炸弹翻牌游戏 - 部署指南

## 部署概览

本项目采用前后端分离架构：
- **前端**: GitHub Pages (免费)
- **后端**: Railway/Render (免费额度)

## 📦 部署步骤

### 1. 前端部署（GitHub Pages）

1. **创建GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/bomb-card-game.git
   git push -u origin main
   ```

2. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main" 和 "/ (root)"
   - 保存后前端将部署到 `https://yourusername.github.io/bomb-card-game`

### 2. 后端部署（Railway - 推荐）

#### 方法一：从GitHub部署（推荐）

1. **访问 [Railway.app](https://railway.app)**
2. **使用GitHub账号注册/登录**
3. **创建新项目**:
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择您的仓库
   - 选择 `backend` 文件夹作为根目录

4. **配置环境变量**:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   ADMIN_PASSWORD=$2b$10$abcdefghijklmnopqrstuvwxyz
   ```

5. **部署完成**:
   - Railway会自动检测到package.json
   - 自动运行 `npm install` 和 `npm start`
   - 获得类似 `https://your-app-name.up.railway.app` 的URL

#### 方法二：使用Railway CLI

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 在backend文件夹中初始化
cd backend
railway init

# 部署
railway up
```

### 3. 后端部署（Render - 备选方案）

1. **访问 [Render.com](https://render.com)**
2. **连接GitHub账号**
3. **创建Web Service**:
   - Repository: 选择您的仓库
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

### 4. 更新前端API配置

部署后端后，修改前端的API地址：

```javascript
// 在 index.html 中修改
const API_BASE_URL = 'https://your-backend-url.up.railway.app/api';
```

重新提交到GitHub，Pages会自动更新。

## 🔧 环境变量配置

在Railway/Render中设置以下环境变量：

```
NODE_ENV=production
PORT=3000  # Railway会自动设置
JWT_SECRET=your-super-secure-jwt-secret-key-here
ADMIN_PASSWORD=$2b$10$abcdefghijklmnopqrstuvwxyz
```

## 📊 免费额度说明

### Railway (推荐)
- ✅ 每月500小时运行时间
- ✅ 自动休眠机制
- ✅ 支持自定义域名
- ✅ 简单的GitHub集成

### Render
- ✅ 每月750小时运行时间  
- ✅ 自动SSL证书
- ❌ 免费版有冷启动延迟

## 🔄 自动化部署

设置完成后：
1. **前端**: 推送到GitHub main分支 → 自动部署到GitHub Pages
2. **后端**: 推送到GitHub → Railway/Render自动重新部署

## 🛠️ 故障排除

### 常见问题

1. **CORS错误**:
   - 确保后端CORS配置包含前端域名
   - 检查API_BASE_URL是否正确

2. **数据库初始化失败**:
   - 检查Railway日志
   - 确保postinstall脚本正常运行

3. **认证失败**:
   - 检查JWT_SECRET环境变量
   - 确认管理员密码正确

### 查看日志
```bash
# Railway
railway logs

# 或在Railway仪表板查看
```

## 🌐 生产环境配置

### 安全设置
- 使用强JWT密钥
- 启用HTTPS（Railway/Render自动提供）
- 配置适当的CORS策略

### 性能优化
- 数据库查询优化
- 添加缓存层
- 监控响应时间

## 📝 部署清单

- [ ] 创建GitHub仓库并推送代码
- [ ] 启用GitHub Pages
- [ ] 在Railway创建项目
- [ ] 配置环境变量
- [ ] 更新前端API地址
- [ ] 测试完整功能
- [ ] 配置自定义域名（可选）

部署完成后，您的游戏将可以通过互联网访问！
