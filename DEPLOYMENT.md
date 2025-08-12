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

### 2. 后端部署（⚠️ Railway已限制免费计划）

**Railway更新**: 免费账户现在只能部署数据库，请使用以下替代方案：

#### 方法一：Render（推荐 - 完全免费）

1. **访问 [Render.com](https://render.com)**
2. **使用GitHub账号注册/登录**
3. **创建Web Service**:
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Repository: 选择 `bomb-card-game`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - 选择 **Free** 计划

4. **配置环境变量**:
   - 在Render仪表板中添加Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   ADMIN_PASSWORD=$2b$10$abcdefghijklmnopqrstuvwxyz
   ```

5. **部署完成**:
   - Render会自动部署
   - 获得类似 `https://your-app-name.onrender.com` 的URL

#### 方法二：Vercel（免费 - 适合Node.js）

1. **访问 [Vercel.com](https://vercel.com)**
2. **Import GitHub Repository**
3. **配置项目**:
   - Framework: Other
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Output Directory: `.`
   - Install Command: `npm install`

#### 方法三：Cyclic（免费 - 专为Node.js设计）

1. **访问 [Cyclic.sh](https://www.cyclic.sh)**
2. **Connect GitHub Repository**
3. **自动部署** - 检测到package.json后自动配置

#### 方法四：Glitch（免费 - 在线IDE）

1. **访问 [Glitch.com](https://glitch.com)**
2. **Import from GitHub**
3. **自动运行** - 支持实时编辑

### 3. 后端部署（备选方案 - 其他免费服务）

**如果Render也有问题，可以尝试：**

#### Heroku（需要信用卡验证，但免费）
1. 访问 [Heroku.com](https://heroku.com)
2. 创建新应用
3. 连接GitHub仓库
4. 设置Buildpack为Node.js

#### Back4App（免费额度）
1. 访问 [Back4App.com](https://www.back4app.com)
2. 专为后端API设计
3. 支持Node.js应用

#### PlanetScale + Vercel组合
- PlanetScale：免费MySQL数据库
- Vercel：部署Node.js API

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

### Render (推荐)
- ✅ 完全免费的Web Service
- ✅ 每月750小时运行时间
- ✅ 自动SSL证书
- ✅ 支持自定义域名
- ❌ 免费版有冷启动延迟（15分钟无活动后休眠）

### Vercel
- ✅ 无服务器函数免费
- ✅ 快速部署和CDN
- ✅ 零配置部署
- ❌ 对长时间运行的进程支持有限

### Cyclic
- ✅ 专为Node.js优化
- ✅ 简单一键部署
- ✅ 包含免费数据库
- ❌ 新平台，稳定性待验证

### Railway (已限制)
- ❌ 免费用户只能部署数据库
- ❌ 需要付费才能部署应用

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
