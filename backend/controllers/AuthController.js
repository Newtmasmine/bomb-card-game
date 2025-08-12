const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

class AuthController {
    // 用户注册
    static async register(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: '用户名和密码不能为空'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: '密码长度至少6位'
                });
            }

            const userId = await User.create({ username, password });

            res.status(201).json({
                success: true,
                message: '注册成功',
                data: { userId, username }
            });
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                res.status(400).json({
                    success: false,
                    message: '用户名已存在'
                });
            } else {
                console.error('Registration error:', error);
                res.status(500).json({
                    success: false,
                    message: '服务器内部错误'
                });
            }
        }
    }

    // 用户登录
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: '用户名和密码不能为空'
                });
            }

            const user = await User.authenticate(username, password);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '用户名或密码错误'
                });
            }

            // 生成JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: '登录成功',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    // 管理员登录
    static async adminLogin(req, res) {
        try {
            const { username, password } = req.body;

            if (username === 'admin' && password === 'admin001') {
                const token = jwt.sign(
                    { userId: 0, username: 'admin', isAdmin: true },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    success: true,
                    message: '管理员登录成功',
                    data: {
                        token,
                        user: {
                            id: 0,
                            username: 'admin',
                            isAdmin: true
                        }
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: '管理员账号或密码错误'
                });
            }
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }

    // 验证token
    static async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token不存在'
                });
            }

            const decoded = jwt.verify(token, JWT_SECRET);

            res.json({
                success: true,
                data: {
                    user: {
                        id: decoded.userId,
                        username: decoded.username,
                        isAdmin: decoded.isAdmin || false
                    }
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token无效'
            });
        }
    }
}

module.exports = AuthController;
