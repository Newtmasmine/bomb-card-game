# 📚 Git & GitHub 操作指南

## 🚀 快速开始 - 推送代码到GitHub

### 前提条件
1. 安装Git: [下载地址](https://git-scm.com/download/win)
2. 拥有GitHub账号: [注册地址](https://github.com)

### 步骤1: 配置Git（首次使用）

打开命令提示符（CMD）或PowerShell，运行：

```bash
# 配置用户名和邮箱（替换为您的信息）
git config --global user.name "Newtmasmine"
git config --global user.email "t330016087@mail.uic.edu.cn"

# 验证配置
git config --global --list
```

### 步骤2: 创建GitHub仓库

1. **访问GitHub**: https://github.com
2. **点击右上角的 "+" 号 → "New repository"**
3. **填写仓库信息**:
   - Repository name: `bomb-card-game` (或其他名字)
   - Description: `炸弹翻牌游戏 - 带管理员统计功能`
   - 设置为 Public（免费用户）
   - ✅ 勾选 "Add a README file"
   - ❌ 不要选择 .gitignore 和 license（我们已经有了）
4. **点击 "Create repository"**

### 步骤3: 在本地初始化Git仓库

在您的项目文件夹 `d:\UIC\FYP\翻卡游戏` 中：

```bash
# 切换到项目目录
cd "d:\UIC\FYP\翻卡游戏"

# 初始化Git仓库
git init

# 添加远程仓库（替换为您的GitHub用户名和仓库名）
git remote add origin https://github.com/您的用户名/bomb-card-game.git
```

### 步骤4: 添加和提交文件

```bash
# 查看文件状态
git status

# 添加所有文件到暂存区
git add .

# 提交文件
git commit -m "Initial commit: 炸弹翻牌游戏完整版本"

# 设置主分支名称
git branch -M main
```

### 步骤5: 推送到GitHub

```bash
# 首次推送（需要认证）
git push -u origin main
```

### 🔐 GitHub认证方式

#### 方法一: Personal Access Token (推荐)

1. **生成Token**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - 选择权限: `repo`, `workflow`
   - 复制token（只显示一次！）

2. **使用Token**:
   ```bash
   # 推送时输入用户名和token
   git push -u origin main
   Username: 您的GitHub用户名
   Password: 粘贴您的token
   ```

#### 方法二: GitHub CLI (最简单)

```bash
# 安装GitHub CLI
winget install GitHub.cli

# 登录
gh auth login

# 推送
git push -u origin main
```

### 步骤6: 启用GitHub Pages

推送成功后：

1. **进入仓库页面**
2. **Settings → Pages**
3. **Source 选择**: Deploy from a branch
4. **Branch 选择**: main / (root)
5. **Save**

几分钟后，您的网站将在 `https://您的用户名.github.io/bomb-card-game` 可访问！

## 📝 完整操作示例

```bash
# 1. 打开PowerShell或CMD，切换到项目目录
cd "d:\UIC\FYP\翻卡游戏"

# 2. 初始化Git
git init

# 3. 添加远程仓库（请替换URL）
git remote add origin https://github.com/yourusername/bomb-card-game.git

# 4. 添加所有文件
git add .

# 5. 提交
git commit -m "Initial commit: 炸弹翻牌游戏完整版本

- 完整的前端游戏界面
- 用户注册/登录系统  
- 管理员统计面板
- 后端API集成
- 数据库支持
- 部署配置文件"

# 6. 设置主分支
git branch -M main

# 7. 推送到GitHub
git push -u origin main
```

## 🔄 后续更新流程

当您修改代码后，使用以下命令更新：

```bash
# 查看修改状态
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述您的修改"

# 推送更新
git push
```

## ⚠️ 常见问题解决

### 问题1: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/您的用户名/仓库名.git
```

### 问题2: 认证失败
- 确保使用Personal Access Token而不是密码
- 检查token权限是否包含repo

### 问题3: 推送被拒绝
```bash
# 强制推送（谨慎使用）
git push --force-with-lease origin main
```

### 问题4: 文件太大
- 检查是否有不必要的文件（node_modules等）
- 添加到.gitignore

## 📂 项目结构检查

确保您的项目结构如下：
```
翻卡游戏/
├── index.html              # 前端主文件
├── DEPLOYMENT.md           # 部署指南
├── README.md              # 项目说明
├── .gitignore             # Git忽略文件
└── backend/               # 后端文件夹
    ├── server.js
    ├── package.json
    ├── railway.toml
    ├── render.yaml
    └── ...其他后端文件
```

## ✅ 推送成功检查清单

- [ ] GitHub仓库已创建
- [ ] 本地Git已初始化
- [ ] 远程仓库已添加
- [ ] 所有文件已提交
- [ ] 成功推送到main分支
- [ ] GitHub Pages已启用
- [ ] 网站可以访问

推送成功后，您就可以按照DEPLOYMENT.md的指南部署后端了！
