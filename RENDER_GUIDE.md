# 🚀 Render部署快速指南

## ⚡ 5分钟快速部署到Render

### 前提条件
- ✅ 代码已推送到GitHub
- ✅ 确保backend文件夹中有所有必要文件

### 步骤1: 访问Render
1. 打开 [Render.com](https://render.com)
2. 点击 **Sign Up** 或 **Log In**
3. 选择 **GitHub** 登录

### 步骤2: 创建Web Service
1. 点击 **New +** 按钮
2. 选择 **Web Service**
3. 选择 **Build and deploy from a Git repository**
4. 点击 **Next**

### 步骤3: 连接GitHub仓库
1. 找到您的仓库 `bomb-card-game`
2. 点击 **Connect**

### 步骤4: 配置部署设置
填写以下信息：
- **Name**: `bomb-card-game-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: 选择 **Free** (0$/月)

### 步骤5: 添加环境变量
在 **Environment Variables** 部分添加：

```
NODE_ENV=production
JWT_SECRET=bomb-card-game-super-secure-secret-key-2025-uic-fyp-project-newtmasmine
PORT=10000
ADMIN_PASSWORD=$2b$10$YourHashedPasswordHere
```

**重要说明**: 

#### JWT_SECRET 详解：
- **作用**: 用于加密用户登录令牌，确保安全性
- **要求**: 至少32个字符，包含字母、数字、特殊字符
- **建议值**: `bomb-card-game-super-secure-secret-key-2025-uic-fyp-project-newtmasmine`
- **安全性**: 这个密钥决定了用户认证的安全性，请妥善保管

#### 其他变量说明：
- **PORT=10000**: Render平台要求的端口号
- **NODE_ENV=production**: 告诉应用运行在生产环境
- **ADMIN_PASSWORD**: 管理员密码的bcrypt哈希值

#### 生成管理员密码哈希：
如果需要修改管理员密码，可以使用在线bcrypt工具：
1. 访问 https://bcrypt-generator.com/
2. 输入密码：`admin001`
3. 选择rounds: `10`
4. 复制生成的哈希值

### 步骤6: 部署
1. 点击 **Create Web Service**
2. 等待部署完成（约3-5分钟）
3. 部署成功后会显示您的URL，类似：
   `https://bomb-card-game-backend.onrender.com`

### 步骤7: 测试API
访问以下URL测试：
```
https://your-app-name.onrender.com/api/auth/login
```

如果看到类似 `{"message":"Missing credentials"}` 说明API正常运行。

### 步骤8: 更新前端API地址
在您的 `index.html` 中修改：
```javascript
// 替换这行
return 'https://your-backend-url.up.railway.app/api';
// 改为您的Render URL
return 'https://your-app-name.onrender.com/api';
```

重新推送到GitHub，前端会自动更新。

## ✅ 完成！
现在您的游戏应该完全在线运行了！

## 🔧 常见问题

### 问题1: 部署失败
- 检查backend文件夹中是否有package.json
- 确保所有依赖都在dependencies中

### 问题2: API无法访问
- 检查环境变量是否正确设置
- 确保PORT设置为10000

### 问题3: 冷启动延迟
- Render免费版在15分钟无活动后会休眠
- 首次访问可能需要30秒启动时间
- 这是正常现象

### 问题4: CORS错误
- 确保后端CORS配置包含前端域名
- 检查API URL是否正确

## 💡 优化建议
1. 使用Render的预设环境变量
2. 配置健康检查端点
3. 监控应用性能

部署完成后，记得测试所有功能！
