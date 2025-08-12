const User = require('../models/User');
const database = require('../config/database');

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
            const { startTime } = req.body;

            // 简化的会话记录，生成一个唯一ID
            const sessionId = `session_${userId}_${Date.now()}`;

            res.json({
                success: true,
                message: '游戏会话记录成功',
                data: { sessionId }
            });
        } catch (error) {
            console.error('Record session error:', error);
            res.status(500).json({
                success: false,
                message: '记录游戏会话失败'
            });
        }
    }

    // 记录游戏轮次
    static async recordGameRound(req, res) {
        try {
            const userId = req.user.userId;
            const { sessionId } = req.params;
            const { roundData } = req.body;

            // 记录游戏轮次数据到游戏记录表
            await db.run(
                `INSERT INTO game_records (user_id, score, level, cards_flipped, bombs_hit, time_played) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userId, 
                    roundData.score || 0, 
                    roundData.level || 1, 
                    roundData.cardsFlipped || 0, 
                    roundData.bombsHit || 0, 
                    roundData.timePlayed || 0
                ]
            );

            res.json({
                success: true,
                message: '游戏轮次记录成功'
            });
        } catch (error) {
            console.error('Record round error:', error);
            res.status(500).json({
                success: false,
                message: '记录游戏轮次失败'
            });
        }
    }

    // 记录风险估计数据
    static async recordRiskEstimation(req, res) {
        try {
            res.json({
                success: true,
                message: '风险估计记录成功'
            });
        } catch (error) {
            console.error('Record risk estimation error:', error);
            res.status(500).json({
                success: false,
                message: '记录风险估计失败'
            });
        }
    }

    // 获取用户游戏历史
    static async getUserGameHistory(req, res) {
        try {
            const userId = req.user.userId;

            const history = await db.query(
                `SELECT * FROM game_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
                [userId]
            );

            res.json({
                success: true,
                data: { history }
            });
        } catch (error) {
            console.error('Get user history error:', error);
            res.status(500).json({
                success: false,
                message: '获取游戏历史失败'
            });
        }
    }

    // 记录游戏会话
    static async recordGameSession(req, res) {
        try {
            const userId = req.user.userId;
            const { sessionId, startTime } = req.body;

            if (!sessionId || !startTime) {
                return res.status(400).json({
                    success: false,
                    message: '缺少必要参数'
                });
            }

            await database.run(
                `INSERT INTO game_sessions (session_id, user_id, start_time) VALUES (?, ?, ?)`,
                [sessionId, userId, startTime]
            );

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
            const userId = req.user.userId;
            const { flippedCards, roundBonus, endReason, penaltyAmount, bombCount, totalBonusAfter } = req.body;

            await database.run(
                `INSERT INTO game_rounds (session_id, user_id, flipped_cards, round_bonus, end_reason, penalty_amount, bomb_count, total_bonus_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sessionId, userId, flippedCards, roundBonus, endReason, penaltyAmount, bombCount, totalBonusAfter]
            );

            res.json({
                success: true,
                message: '游戏轮次记录成功'
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
            const { sessionId, actualBombProb, flippedCount } = req.body;

            await database.run(
                `INSERT INTO risk_estimations (session_id, user_id, actual_bomb_prob, flipped_count) VALUES (?, ?, ?, ?)`,
                [sessionId, userId, actualBombProb, flippedCount]
            );

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
            
            const sessions = await database.query(
                `SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
                [userId]
            );

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

    // 更新用户余额
    static async updateUserBalance(req, res) {
        try {
            const userId = req.user.userId;
            const { balance } = req.body;

            await database.run(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [balance, userId]
            );

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

    // 获取用户信息
    static async getUserInfo(req, res) {
        try {
            const userId = req.user.userId;
            
            const user = await database.get(
                `SELECT id, username, balance FROM users WHERE id = ?`,
                [userId]
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get user info error:', error);
            res.status(500).json({
                success: false,
                message: '获取用户信息失败'
            });
        }
    }
}

module.exports = GameController;
