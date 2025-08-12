const express = require('express');
const GameController = require('../controllers/GameController');
const { authenticate, requireUser } = require('../middleware/auth');

const router = express.Router();

// 应用身份验证中间件到所有游戏路由
router.use(authenticate);
router.use(requireUser);

// 获取用户信息
router.get('/user/info', GameController.getUserInfo);

// 更新用户余额
router.put('/user/balance', GameController.updateUserBalance);

// 记录游戏会话
router.post('/session', GameController.recordGameSession);

// 记录游戏轮次
router.post('/session/:sessionId/round', GameController.recordGameRound);

// 记录风险估计数据
router.post('/risk-estimation', GameController.recordRiskEstimation);

// 获取用户游戏历史
router.get('/user/history', GameController.getUserGameHistory);

module.exports = router;
