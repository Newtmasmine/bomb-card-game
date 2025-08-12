# 🚀 Vercel部署快速指南

## ⚡ 3分钟快速部署到Vercel

### 前提条件
- ✅ 代码已推送到GitHub
- ✅ 确保backend文件夹中有所有必要文件

### 步骤1: 访问Vercel
1. 打开 [Vercel.com](https://vercel.com)
2. 点击 **Start Deploying**
3. 选择 **Continue with GitHub** 登录

### 步骤2: 导入GitHub仓库
1. 点击 **Import Git Repository**
2. 找到您的仓库 `bomb-card-game`
3. 点击 **Import**

### 步骤3: 配置项目设置
填写以下信息：
- **Project Name**: `bomb-card-game-backend`
- **Framework Preset**: `Other`
- **Root Directory**: `backend` ⚠️ 重要！
- **Build Command**: `npm install`
- **Output Directory**: 留空
- **Install Command**: `npm install`

### 步骤4: 添加环境变量
点击 **Environment Variables**，添加以下变量：

```
NODE_ENV=production
JWT_SECRET=bomb-card-game-super-secure-secret-key-2025-uic-fyp-project-newtmasmine
ADMIN_PASSWORD=$2b$10$example.hash.here
```

**注意**: Vercel会自动处理PORT，不需要手动设置

### 步骤5: 创建vercel.json配置
我已经为您创建了 `backend/vercel.json` 文件，包含必要的配置。

### 步骤6: 提交配置文件到GitHub
在PowerShell中运行：
```bash
cd "d:\UIC\FYP\翻卡游戏"
git add .
git commit -m "添加Vercel配置文件"
git push
```

### 步骤7: 部署
1. 回到Vercel网站
2. 点击 **Deploy**
3. 等待部署完成（约1-2分钟）
4. 部署成功后会显示您的URL，类似：
   `https://bomb-card-game-backend.vercel.app`

### 步骤8: 测试API
访问以下URL测试：
```
https://bomb-card-game-abytm56i2-newtmasmines-projects.vercel.app/api/auth/login
```

如果看到 `{"message":"Missing credentials"}` 说明API正常运行。

### 步骤9: 更新前端API地址
在您的 `index.html` 中修改getAPIBaseURL函数：
```javascript
const getAPIBaseURL = () => {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // 替换为您的Vercel URL
    return 'https://bomb-card-game-abytm56i2-newtmasmines-projects.vercel.app/api';
};
```

重新推送到GitHub：
```bash
git add .
git commit -m "更新API地址为Vercel"
git push
```

## ✅ Vercel的优势

### 🚀 **速度快**
- 全球CDN加速
- 零冷启动时间
- 毫秒级响应

### 💰 **完全免费**
- 每月100GB带宽
- 无限制的部署次数
- 自动HTTPS证书

### 🔄 **自动部署**
- GitHub推送自动部署
- 分支预览功能
- 回滚支持

## 🔧 常见问题

### 问题1: 部署失败
**解决方案**:
- 确保vercel.json文件在backend文件夹中
- 检查package.json是否包含所有依赖

### 问题2: API路由不工作
**解决方案**:
```bash
# 确保server.js中有根路由
app.get('/', (req, res) => {
    res.json({ message: 'Bomb Card Game API is running!' });
});
```

### 问题3: 数据库连接问题
**解决方案**:
- Vercel是无服务器环境
- 每次请求都会重新连接数据库
- SQLite文件会在部署时重置

### 问题4: 环境变量未生效
**解决方案**:
- 在Vercel仪表板中重新设置环境变量
- 确保变量名称完全正确
- 重新部署项目

## 🔄 更新部署

当您修改代码后：
1. 推送到GitHub: `git push`
2. Vercel会自动重新部署
3. 约1分钟后更新生效

## 💡 Vercel特殊配置

### 数据库处理
由于Vercel是无服务器环境，建议：
1. 使用在线数据库（如PlanetScale、Supabase）
2. 或者接受SQLite会在每次部署时重置的限制

### 性能优化
- API响应速度极快
- 全球多地区部署
- 自动缓存静态资源

## 🎯 完成检查清单
- [ ] vercel.json文件已创建
- [ ] 代码已推送到GitHub  
- [ ] 在Vercel中导入项目
- [ ] 设置Root Directory为backend
- [ ] 添加环境变量
- [ ] 部署成功
- [ ] API测试通过
- [ ] 前端API地址已更新

部署完成后，您的游戏就完全在线了！🎉
