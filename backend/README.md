# 炸弹翻牌游戏 - 后端API文档

## 项目概述

这是炸弹翻牌游戏的后端API系统，提供用户认证、游戏数据管理和管理员统计功能。

## 快速开始

### 安装依赖
```bash
cd backend
npm install
```

### 初始化数据库
```bash
npm run init-db
```

### 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API 接口文档

### 基础信息
- 基础URL: `http://localhost:3000/api`
- 所有请求头需包含: `Content-Type: application/json`
- 需要身份验证的接口需包含: `Authorization: Bearer <token>`

---

## 身份认证接口

### 1. 用户注册
**POST** `/auth/register`

**请求体:**
```json
{
    "username": "testuser",
    "password": "123456"
}
```

**响应:**
```json
{
    "success": true,
    "message": "注册成功",
    "data": {
        "userId": 1,
        "username": "testuser"
    }
}
```

### 2. 用户登录
**POST** `/auth/login`

**请求体:**
```json
{
    "username": "testuser",
    "password": "123456"
}
```

**响应:**
```json
{
    "success": true,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": "testuser"
        }
    }
}
```

### 3. 管理员登录
**POST** `/auth/admin/login`

**请求体:**
```json
{
    "username": "admin",
    "password": "admin001"
}
```

**响应:**
```json
{
    "success": true,
    "message": "管理员登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 0,
            "username": "admin",
            "isAdmin": true
        }
    }
}
```

### 4. 验证Token
**POST** `/auth/verify`

**请求头:**
```
Authorization: Bearer <token>
```

**响应:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "username": "testuser",
            "isAdmin": false
        }
    }
}
```

---

## 游戏接口 (需要用户身份验证)

### 1. 获取用户信息
**GET** `/game/user/info`

**响应:**
```json
{
    "success": true,
    "data": {
        "username": "testuser",
        "current_balance": 2000,
        "total_rewards": 2000,
        "created_at": "2023-01-01 00:00:00",
        "last_login": "2023-01-01 12:00:00",
        "total_flips": 0,
        "games_played": 0,
        "rounds_played": 0,
        "early_exits": 0,
        "bomb_triggers": 0,
        "total_game_time": 0
    }
}
```

### 2. 更新用户余额
**PUT** `/game/user/balance`

**请求体:**
```json
{
    "balance": 1800
}
```

### 3. 记录游戏会话
**POST** `/game/session`

**请求体:**
```json
{
    "start_time": "2023-01-01 12:00:00",
    "total_flips": 25,
    "total_bomb_hits": 2,
    "total_rewards": 1800,
    "session_duration": 300000
}
```

### 4. 记录游戏轮次
**POST** `/game/session/:sessionId/round`

**请求体:**
```json
{
    "round_number": 1,
    "flipped_cards": 8,
    "round_bonus": 500,
    "end_reason": "bomb",
    "penalty_amount": 200,
    "bomb_count": 5,
    "total_cards": 16,
    "duration": 45000
}
```

### 5. 记录风险估计数据
**POST** `/game/risk-estimation`

**请求体:**
```json
{
    "sessionId": 1,
    "roundId": 1,
    "actual_bomb_prob": 0.3125,
    "flipped_count": 8
}
```

### 6. 获取用户游戏历史
**GET** `/game/user/history`

**响应:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "start_time": "2023-01-01 12:00:00",
            "end_time": "2023-01-01 12:05:00",
            "total_flips": 25,
            "total_bomb_hits": 2,
            "total_rewards": 1800,
            "session_duration": 300000
        }
    ]
}
```

---

## 管理员接口 (需要管理员权限)

### 1. 获取全局统计数据
**GET** `/admin/stats`

**响应:**
```json
{
    "success": true,
    "data": {
        "totalFlips": 1250,
        "totalGames": 89,
        "totalRounds": 156,
        "earlyExitRate": 25.6,
        "bombRate": 18.2,
        "profitDeviation": 0.15,
        "riskError": 0.08,
        "totalUsers": 15
    }
}
```

### 2. 获取所有用户数据
**GET** `/admin/users`

**响应:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "username": "testuser",
            "current_balance": 1800,
            "total_rewards": 1800,
            "created_at": "2023-01-01 00:00:00",
            "last_login": "2023-01-01 12:00:00",
            "total_flips": 25,
            "games_played": 3,
            "rounds_played": 8,
            "early_exits": 2,
            "bomb_triggers": 1,
            "total_game_time": 900000,
            "earlyExitRate": 25.0,
            "bombRate": 12.5,
            "profitDeviation": 0.12,
            "riskError": 0.15
        }
    ]
}
```

### 3. 获取用户详细信息
**GET** `/admin/users/:userId`

**响应:**
```json
{
    "success": true,
    "data": {
        "user": { /* 用户信息 */ },
        "sessions": [ /* 游戏会话列表 */ ]
    }
}
```

### 4. 删除用户
**DELETE** `/admin/users/:userId`

**响应:**
```json
{
    "success": true,
    "message": "用户删除成功"
}
```

### 5. 清空所有数据
**DELETE** `/admin/data/clear`

**响应:**
```json
{
    "success": true,
    "message": "所有数据已清空"
}
```

---

## 错误响应格式

所有错误响应都遵循以下格式：

```json
{
    "success": false,
    "message": "错误描述"
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权（token无效或缺失）
- `403`: 权限不足
- `404`: 资源不存在
- `429`: 请求过于频繁
- `500`: 服务器内部错误

---

## 数据库表结构

### users（用户表）
- `id`: 主键
- `username`: 用户名（唯一）
- `password`: 密码（加密）
- `created_at`: 创建时间
- `current_balance`: 当前余额
- `total_rewards`: 总奖励
- `last_login`: 最后登录时间

### user_stats（用户统计表）
- `user_id`: 用户ID（外键）
- `total_flips`: 总翻牌数
- `games_played`: 游戏场次
- `rounds_played`: 轮次数
- `early_exits`: 提前退出次数
- `bomb_triggers`: 炸弹触发次数
- `total_game_time`: 总游戏时间

### game_sessions（游戏会话表）
- `id`: 主键
- `user_id`: 用户ID（外键）
- `start_time`: 开始时间
- `end_time`: 结束时间
- `total_flips`: 总翻牌数
- `total_bomb_hits`: 炸弹击中次数
- `total_rewards`: 总奖励
- `session_duration`: 会话持续时间

### game_rounds（游戏轮次表）
- `id`: 主键
- `session_id`: 会话ID（外键）
- `round_number`: 轮次编号
- `flipped_cards`: 翻牌数
- `round_bonus`: 轮次奖金
- `end_reason`: 结束原因
- `penalty_amount`: 惩罚金额
- `bomb_count`: 炸弹数量
- `duration`: 轮次持续时间

### risk_estimations（风险估计表）
- `id`: 主键
- `user_id`: 用户ID（外键）
- `session_id`: 会话ID（外键）
- `round_id`: 轮次ID（外键）
- `actual_bomb_prob`: 实际炸弹概率
- `flipped_count`: 翻牌数
- `timestamp`: 时间戳

---

## 部署说明

### 环境变量
创建 `.env` 文件：
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### PM2 部署
```bash
npm install -g pm2
pm2 start server.js --name "bomb-game-api"
pm2 save
pm2 startup
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 安全注意事项

1. **JWT密钥**: 生产环境必须使用强密钥
2. **CORS设置**: 仅允许信任的域名
3. **限流**: 已配置基本限流，可根据需要调整
4. **密码加密**: 使用bcrypt加密存储
5. **SQL注入**: 使用参数化查询防护
6. **XSS防护**: 使用helmet中间件

---

## 开发工具

推荐使用以下工具进行API测试：
- **Postman**: 接口测试
- **curl**: 命令行测试
- **VS Code REST Client**: 编辑器内测试
