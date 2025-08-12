# 🔗 Vercel固定域名配置指南

## 问题说明
每次推送代码到GitHub，Vercel都会生成新的预览URL，导致前端API地址失效。

## 解决方案：设置Vercel固定域名

### 步骤1: 访问Vercel项目设置
1. 打开 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 找到您的项目 `bomb-card-game-backend`
3. 点击项目名称进入项目详情页面

### 步骤2: 配置生产域名
1. 在项目页面中，点击 **Settings** 标签
2. 在左侧菜单中点击 **Domains**
3. 您会看到当前的域名列表

### 步骤3: 添加自定义域名（推荐）
**选项A: 使用Vercel免费域名**
1. 在 **Domains** 页面，点击 **Add**
2. 输入: `bomb-card-game-backend.vercel.app`
3. 点击 **Add** 确认

**选项B: 使用自己的域名**
1. 如果您有自己的域名（如 `example.com`）
2. 输入: `api.example.com` 或 `backend.example.com`
3. 按照Vercel的DNS配置指引设置

### 步骤4: 设置为生产域名
1. 找到您想要的域名
2. 点击域名右侧的 **...** 菜单
3. 选择 **Set as Production Domain**

### 步骤5: 验证固定域名
设置完成后，您的固定API地址将是：
- **使用Vercel域名**: `https://bomb-card-game-backend.vercel.app/api`
- **使用自定义域名**: `https://api.yourdomain.com/api`

## 🔧 方案2: 环境变量方式（高级）

如果您想要更灵活的配置，可以在前端代码中使用环境变量：

```javascript
const getAPIBaseURL = () => {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // 从环境变量或配置中读取
    const API_URL = process.env.REACT_APP_API_URL || 'https://bomb-card-game-backend.vercel.app/api';
    return API_URL;
};
```

## 🚨 临时解决方案

在设置固定域名之前，您可以：

1. **手动更新**: 每次部署后手动更新前端的API地址
2. **使用当前URL**: 我已经将前端代码更新为 `https://bomb-card-game-backend.vercel.app/api`

## ✅ 推荐步骤

1. **立即**: 使用我更新的通用域名 `bomb-card-game-backend.vercel.app`
2. **然后**: 在Vercel中验证这个域名是否可用
3. **如果不可用**: 在Vercel中添加自定义域名
4. **最后**: 根据实际的固定域名更新前端代码

## 💡 提示

- Vercel的免费计划支持自定义域名
- 设置固定域名后，URL就不会再变化
- 生产域名始终指向最新的部署版本
