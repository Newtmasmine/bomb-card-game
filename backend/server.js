const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const db = require('./config/database');

// 引入路由
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const gameRoutes = require('./routes/game');

const app = express();
const PORT = process.env.PORT || 3000;

// 创建限流器
const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'middleware',
    points: 100, // 100 请求
    duration: 60, // 每60秒
});

// 限流中间件
const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({
                success: false,
                message: '请求过于频繁，请稍后再试'
            });
        });
};

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors({
    origin: [
        'https://newtmasmine.github.io',
        'https://newtmasmine.github.io/',
        'http://localhost:3000', 
        'http://127.0.0.1:5500',
        'http://127.0.0.1:3000',
        /\.vercel\.app$/,  // 允许所有Vercel域名
        /\.onrender\.com$/, // 允许所有Render域名
        /\.github\.io$/    // 允许所有GitHub Pages域名
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // 跨域
app.use(express.json({ limit: '10mb' })); // JSON解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL编码解析
app.use(rateLimiterMiddleware); // 限流

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 根路由 - Vercel需要
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bomb Card Game API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            admin: '/api/admin',
            game: '/api/game'
        }
    });
});

// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
const startServer = async () => {
    try {
        // 连接数据库
        await db.connect();
        console.log('数据库连接成功');

        // 只在非Vercel环境下启动服务器
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            app.listen(PORT, () => {
                console.log(`服务器运行在端口 ${PORT}`);
                console.log(`健康检查: http://localhost:${PORT}/api/health`);
                console.log(`API文档: 请查看 README.md`);
            });
        }
    } catch (error) {
        console.error('服务器启动失败:', error);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    try {
        await db.close();
        console.log('数据库连接已关闭');
        process.exit(0);
    } catch (error) {
        console.error('关闭服务器时出错:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    try {
        await db.close();
        console.log('数据库连接已关闭');
        process.exit(0);
    } catch (error) {
        console.error('关闭服务器时出错:', error);
        process.exit(1);
    }
});

// 启动服务器
startServer();

// 导出app实例供Vercel使用
module.exports = app;
