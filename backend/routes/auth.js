const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// 用户注册
router.post('/register', AuthController.register);

// 用户登录
router.post('/login', AuthController.login);

// 管理员登录
router.post('/admin/login', AuthController.adminLogin);

// 验证token
router.post('/verify', AuthController.verifyToken);

module.exports = router;
