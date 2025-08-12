const User = require('../models/User');
const { GameSession, GameRound, RiskEstimation } = require('../models/Game');

class GameController {
    // 获取用户信息
    static async getUserInfo(req, res) {
        try {
            const userId = req.user.userId;
            const userStats = await User.getStats(userId);

            if (!userStats) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            res.json({
                success: true,
                data: userStats
            });
        } catch (error) {
            console.error('Get user info error:', error);
            res.status(500).json({
                success: false,
                message: '获取用户信息失败'
            });
        }
    }

    // 更新用户余额
    static async updateUserBalance(req, res) {
        try {
            const userId = req.user.userId;
            const { balance } = req.body;

            await User.updateBalance(userId, balance);

            res.json({
                success: true,
                message: '余额更新成功'
            });
        } catch (error) {
            console.error('Update balance error:', error);
            res.status(500).json({
                success: false,
                message: '更新余额失败'
            });
        }
    }

    // 记录游戏会话
    static async recordGameSession(req, res) {
        try {
            const userId = req.user.userId;
            const sessionData = req.body;

            const sessionId = await GameSession.create(userId, sessionData);

            // 更新用户统计
            await User.updateStats(userId, {
                games_played: 1,
                total_flips: sessionData.total_flips || 0,
                total_game_time: sessionData.session_duration || 0
            });

            res.json({
                success: true,
                message: '游戏会话记录成功',
                data: { sessionId }
            });
        } catch (error) {
            console.error('Record game session error:', error);
            res.status(500).json({
                success: false,
                message: '记录游戏会话失败'
            });
        }
    }

    // 记录游戏轮次
    static async recordGameRound(req, res) {
        try {
            const { sessionId } = req.params;
            const roundData = req.body;
            const userId = req.user.userId;

            const roundId = await GameRound.create(sessionId, roundData);

            // 更新用户统计
            const statsUpdate = {
                rounds_played: 1
            };

            if (roundData.end_reason === 'bomb') {
                statsUpdate.bomb_triggers = 1;
            } else if (roundData.end_reason === 'stop') {
                statsUpdate.early_exits = 1;
            }

            await User.updateStats(userId, statsUpdate);

            res.json({
                success: true,
                message: '游戏轮次记录成功',
                data: { roundId }
            });
        } catch (error) {
            console.error('Record game round error:', error);
            res.status(500).json({
                success: false,
                message: '记录游戏轮次失败'
            });
        }
    }

    // 记录风险估计数据
    static async recordRiskEstimation(req, res) {
        try {
            const userId = req.user.userId;
            const { sessionId, roundId, actual_bomb_prob, flipped_count } = req.body;

            await RiskEstimation.create(userId, sessionId, roundId, {
                actual_bomb_prob,
                flipped_count
            });

            res.json({
                success: true,
                message: '风险估计数据记录成功'
            });
        } catch (error) {
            console.error('Record risk estimation error:', error);
            res.status(500).json({
                success: false,
                message: '记录风险估计数据失败'
            });
        }
    }

    // 获取用户游戏历史
    static async getUserGameHistory(req, res) {
        try {
            const userId = req.user.userId;
            const sessions = await GameSession.getUserSessions(userId);

            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            console.error('Get user game history error:', error);
            res.status(500).json({
                success: false,
                message: '获取游戏历史失败'
            });
        }
    }
}

module.exports = GameController;
