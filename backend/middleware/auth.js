const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// 身份验证中间件
const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '未提供身份验证token'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token无效'
        });
    }
};

// 管理员权限验证中间件
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: '需要管理员权限'
        });
    }
    next();
};

// 用户权限验证中间件（确保用户只能访问自己的数据）
const requireUser = (req, res, next) => {
    if (!req.user || req.user.userId === 0) {
        return res.status(403).json({
            success: false,
            message: '需要用户权限'
        });
    }
    next();
};

module.exports = {
    authenticate,
    requireAdmin,
    requireUser
};
