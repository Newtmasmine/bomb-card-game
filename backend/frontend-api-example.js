// 前端API调用示例
// 将此代码集成到您的 index.html 中

class GameAPI {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('gameToken');
    }

    // 设置token
    setToken(token) {
        this.token = token;
        localStorage.setItem('gameToken', token);
    }

    // 清除token
    clearToken() {
        this.token = null;
        localStorage.removeItem('gameToken');
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // 身份认证相关API
    async register(username, password) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.success) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async adminLogin(username, password) {
        const response = await this.request('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.success) {
            this.setToken(response.data.token);
        }
        
        return response;
    }

    async verifyToken() {
        return await this.request('/auth/verify', {
            method: 'POST'
        });
    }

    // 游戏相关API
    async getUserInfo() {
        return await this.request('/game/user/info');
    }

    async updateUserBalance(balance) {
        return await this.request('/game/user/balance', {
            method: 'PUT',
            body: JSON.stringify({ balance })
        });
    }

    async recordGameSession(sessionData) {
        return await this.request('/game/session', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    async recordGameRound(sessionId, roundData) {
        return await this.request(`/game/session/${sessionId}/round`, {
            method: 'POST',
            body: JSON.stringify(roundData)
        });
    }

    async recordRiskEstimation(data) {
        return await this.request('/game/risk-estimation', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getUserGameHistory() {
        return await this.request('/game/user/history');
    }

    // 管理员相关API
    async getGlobalStats() {
        return await this.request('/admin/stats');
    }

    async getAllUsersData() {
        return await this.request('/admin/users');
    }

    async getUserDetail(userId) {
        return await this.request(`/admin/users/${userId}`);
    }

    async deleteUser(userId) {
        return await this.request(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async clearAllData() {
        return await this.request('/admin/data/clear', {
            method: 'DELETE'
        });
    }
}

// 使用示例：
// const api = new GameAPI();

// 注册用户
// api.register('testuser', '123456').then(response => {
//     console.log('注册结果:', response);
// });

// 用户登录
// api.login('testuser', '123456').then(response => {
//     if (response.success) {
//         console.log('登录成功:', response.data.user);
//     }
// });

// 管理员登录
// api.adminLogin('admin', 'admin001').then(response => {
//     if (response.success) {
//         console.log('管理员登录成功');
//     }
// });

// 获取用户信息
// api.getUserInfo().then(response => {
//     if (response.success) {
//         console.log('用户信息:', response.data);
//     }
// });

// 更新用户余额
// api.updateUserBalance(1800).then(response => {
//     if (response.success) {
//         console.log('余额更新成功');
//     }
// });

// 获取管理员统计数据
// api.getGlobalStats().then(response => {
//     if (response.success) {
//         console.log('全局统计:', response.data);
//     }
// });

// 获取所有用户数据
// api.getAllUsersData().then(response => {
//     if (response.success) {
//         console.log('所有用户数据:', response.data);
//     }
// });
