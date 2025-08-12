const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 应用身份验证中间件到所有管理员路由
router.use(authenticate);
router.use(requireAdmin);

// 获取全局统计数据
router.get('/stats', AdminController.getGlobalStats);

// 获取所有用户数据
router.get('/users', AdminController.getAllUsersData);

// 获取用户详细信息
router.get('/users/:userId', AdminController.getUserDetail);

// 删除用户
router.delete('/users/:userId', AdminController.deleteUser);

// 清空所有数据
router.delete('/data/clear', AdminController.clearAllData);

module.exports = router;
