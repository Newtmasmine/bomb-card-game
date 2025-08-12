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
            const { sessionId, startTime } = req.body;
            const sid = sessionId || `session_${userId}_${Date.now()}`;

            await database.run(
                `INSERT OR IGNORE INTO game_sessions (session_id, user_id, start_time) VALUES (?, ?, ?)`,
                [sid, userId, startTime || new Date().toISOString()]
            );

            res.json({
                success: true,
                message: '游戏会话记录成功',
                data: { sessionId: sid }
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
            const { flippedCards, roundBonus, endReason, penaltyAmount, bombCount, totalBonusAfter } = req.body;

            // 插入轮次
            await database.run(
                `INSERT INTO game_rounds (session_id, user_id, flipped_cards, round_bonus, end_reason, penalty_amount, bomb_count, total_bonus_after) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sessionId, userId, flippedCards || 0, roundBonus || 0, endReason || null, penaltyAmount || 0, bombCount || 0, totalBonusAfter || 0]
            );

            // 更新会话聚合字段
            await database.run(
                `UPDATE game_sessions SET 
                    total_rounds = COALESCE(total_rounds,0) + 1,
                    total_cards_flipped = COALESCE(total_cards_flipped,0) + ?,
                    total_bombs_hit = COALESCE(total_bombs_hit,0) + CASE WHEN ? > 0 AND end_reason = 'bomb' THEN 1 ELSE 0 END,
                    total_bonus = ?
                 WHERE session_id = ? AND user_id = ?`,
                [flippedCards || 0, bombCount || 0, totalBonusAfter || 0, sessionId, userId]
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
                `SELECT session_id, start_time, end_time, total_rounds, total_cards_flipped, total_bombs_hit, total_bonus
                 FROM game_sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT 20`,
                [userId]
            );

            res.json({ success: true, data: { sessions } });
        } catch (error) {
            console.error('Get user history error:', error);
            res.status(500).json({ success: false, message: '获取游戏历史失败' });
        }
    }

    // 更新用户余额
    static async updateUserBalance(req, res) {
        try {
            const userId = req.user.userId;
            const { balance } = req.body;

            console.log(`更新用户 ${userId} 余额为: ${balance}`);

            await database.run(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [balance, userId]
            );

            // 验证更新结果
            const updatedUser = await database.get(
                `SELECT balance FROM users WHERE id = ?`,
                [userId]
            );

            console.log(`用户 ${userId} 余额更新后: ${updatedUser?.balance}`);

            res.json({
                success: true,
                message: '余额更新成功',
                data: { balance: updatedUser?.balance }
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

            console.log(`获取用户 ${userId} 信息:`, user);

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
