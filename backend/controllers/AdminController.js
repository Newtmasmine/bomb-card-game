const User = require('../models/User');
const database = require('../config/database');

class AdminController {
    // 获取全局统计数据
    static async getGlobalStats(req, res) {
        try {
            // 获取全局统计数据
            const globalStats = await database.get(`
                SELECT 
                    COALESCE(COUNT(*), 0) as totalUsers,
                    COALESCE(COUNT(*), 0) as totalGames
                FROM users
                WHERE id > 0
            `);

            // 获取游戏轮次和翻卡统计
            const roundStats = await database.get(`
                SELECT 
                    COALESCE(COUNT(*), 0) as totalRounds,
                    COALESCE(SUM(flipped_cards), 0) as totalFlips,
                    COALESCE(SUM(CASE WHEN end_reason = 'stop' THEN 1 ELSE 0 END), 0) as totalEarlyExits,
                    COALESCE(SUM(CASE WHEN end_reason = 'bomb' THEN 1 ELSE 0 END), 0) as totalBombTriggers
                FROM game_rounds
            `);

            // 计算统计指标
            const {
                totalUsers = 0,
                totalGames = 0
            } = globalStats || {};

            const {
                totalRounds = 0,
                totalFlips = 0,
                totalEarlyExits = 0,
                totalBombTriggers = 0
            } = roundStats || {};

            // 提前退出率
            const earlyExitRate = totalRounds > 0 ? 
                (totalEarlyExits / totalRounds) * 100 : 0;

            // 炸弹触发率 - 触发炸弹的轮次数占总轮次的比例
            const bombRate = totalRounds > 0 ? 
                (totalBombTriggers / totalRounds) * 100 : 0;

            // 收益偏离度 - 计算实际收益与期望收益的偏离
            const totalRewards = await database.get(`
                SELECT COALESCE(SUM(balance - 2000), 0) as netRewards 
                FROM users
                WHERE id > 0
            `);
            
            const expectedTotalReward = totalGames * 200 * 0.3; // 期望每场游戏净收益30%
            const profitDeviation = expectedTotalReward > 0 ? 
                Math.abs((totalRewards.netRewards || 0) - expectedTotalReward) / expectedTotalReward : 0;

            // 风险估计误差 - 基于所有用户的平均翻牌行为
            const avgFlipsPerRound = totalRounds > 0 ? totalFlips / totalRounds : 0;
            const optimalFlipsPerRound = 8; // 理论最优翻牌数
            const riskError = avgFlipsPerRound > 0 ? 
                Math.abs(avgFlipsPerRound - optimalFlipsPerRound) / optimalFlipsPerRound : 0;

            res.json({
                success: true,
                data: {
                    totalFlips,
                    totalGames,
                    totalRounds,
                    earlyExitRate: parseFloat(earlyExitRate.toFixed(1)),
                    bombRate: parseFloat(bombRate.toFixed(1)),
                    profitDeviation: parseFloat(profitDeviation.toFixed(2)),
                    riskError: parseFloat(riskError.toFixed(2)),
                    totalUsers
                }
            });
        } catch (error) {
            console.error('Get global stats error:', error);
            res.status(500).json({
                success: false,
                message: '获取统计数据失败'
            });
        }
    }

    // 获取所有用户详细数据
    static async getAllUsersData(req, res) {
        try {
            const users = await User.getAllUsers();
            
            const usersWithCalculations = users.map(user => {
                const {
                    id,
                    username,
                    current_balance = 0,
                    total_rewards = 0,
                    created_at,
                    last_login,
                    total_flips = 0,
                    games_played = 0,
                    rounds_played = 0,
                    early_exits = 0,
                    bomb_triggers = 0
                } = user;

                const earlyExitRate = rounds_played > 0 ? (early_exits / rounds_played * 100) : 0;
                const bombRate = rounds_played > 0 ? (bomb_triggers / rounds_played * 100) : 0;
                const expectedReward = games_played > 0 ? games_played * 200 * 0.6 : 0; // 期望收益假设
                const actualReward = total_rewards; // 已经是净收益
                const profitDeviation = expectedReward > 0 ? Math.abs(actualReward - expectedReward) / Math.max(expectedReward, 100) : 0;
                const avgFlipsPerRound = rounds_played > 0 ? (total_flips / rounds_played) : 0;
                const optimalFlipsPerRound = 8;
                const riskError = avgFlipsPerRound > 0 ? Math.abs(avgFlipsPerRound - optimalFlipsPerRound) / optimalFlipsPerRound : 0;

                return {
                    id,
                    username,
                    current_balance,
                    total_rewards,
                    created_at,
                    last_login,
                    total_flips,
                    games_played,
                    rounds_played,
                    early_exits,
                    bomb_triggers,
                    earlyExitRate: parseFloat(earlyExitRate.toFixed(1)),
                    bombRate: parseFloat(bombRate.toFixed(1)),
                    profitDeviation: parseFloat(profitDeviation.toFixed(2)),
                    riskError: parseFloat(riskError.toFixed(2))
                };
            });

            res.json({
                success: true,
                data: usersWithCalculations
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: '获取用户数据失败'
            });
        }
    }

    // 获取用户详细信息
    static async getUserDetail(req, res) {
        try {
            const { userId } = req.params;
            console.log('获取用户详情，用户ID:', userId);
            
            const user = await User.getStats(userId);
            if (!user) {
                console.log('用户不存在，ID:', userId);
                return res.status(404).json({
                    success: false,
                    message: '用户不存在'
                });
            }
            
            console.log('获取到用户信息:', user);

            // 获取用户的游戏会话数据
            const sessions = await database.query(`
                SELECT 
                    gs.session_id,
                    gs.start_time,
                    gs.end_time,
                    gs.total_flips,
                    gs.total_rounds,
                    gs.total_rewards,
                    gr.id as round_id,
                    gr.flipped_cards,
                    gr.round_bonus,
                    gr.end_reason,
                    gr.penalty_amount,
                    gr.bomb_count,
                    gr.created_at as round_time
                FROM game_sessions gs
                LEFT JOIN game_rounds gr ON gs.session_id = gr.session_id
                WHERE gs.user_id = ?
                ORDER BY gs.start_time DESC, gr.created_at ASC
            `, [userId]);

            console.log('获取到会话数据:', sessions.length, '条记录');

            // 组织会话和轮次数据
            const sessionMap = new Map();
            sessions.forEach(row => {
                if (!sessionMap.has(row.session_id)) {
                    sessionMap.set(row.session_id, {
                        sessionId: row.session_id,
                        startTime: row.start_time,
                        endTime: row.end_time,
                        totalFlips: row.total_flips,
                        totalRounds: row.total_rounds,
                        totalRewards: row.total_rewards,
                        rounds: []
                    });
                }
                
                if (row.round_id) {
                    sessionMap.get(row.session_id).rounds.push({
                        id: row.round_id,
                        flippedCards: row.flipped_cards,
                        roundBonus: row.round_bonus,
                        endReason: row.end_reason,
                        penaltyAmount: row.penalty_amount,
                        bombCount: row.bomb_count,
                        roundTime: row.round_time
                    });
                }
            });

            const organizedSessions = Array.from(sessionMap.values());
            console.log('组织后的会话数据:', organizedSessions.length, '个会话');

            res.json({
                success: true,
                data: {
                    user,
                    sessions: organizedSessions
                }
            });
        } catch (error) {
            console.error('Get user detail error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({
                success: false,
                message: '获取用户详情失败: ' + error.message
            });
        }
    }

    // 删除用户
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            
            // 删除用户相关的所有数据
            await database.run('DELETE FROM risk_estimations WHERE session_id IN (SELECT session_id FROM game_sessions WHERE user_id = ?)', [userId]);
            await database.run('DELETE FROM game_rounds WHERE session_id IN (SELECT session_id FROM game_sessions WHERE user_id = ?)', [userId]);
            await database.run('DELETE FROM game_sessions WHERE user_id = ?', [userId]);
            await database.run('DELETE FROM user_stats WHERE user_id = ?', [userId]);
            await database.run('DELETE FROM users WHERE id = ?', [userId]);

            res.json({
                success: true,
                message: '用户删除成功'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: '删除用户失败'
            });
        }
    }

    // 清空所有数据
    static async clearAllData(req, res) {
        try {
            // 删除所有非管理员数据
            await database.run('DELETE FROM risk_estimations');
            await database.run('DELETE FROM game_rounds');
            await database.run('DELETE FROM game_sessions');
            await database.run('DELETE FROM user_stats');
            await database.run('DELETE FROM users');

            res.json({
                success: true,
                message: '所有数据已清空'
            });
        } catch (error) {
            console.error('Clear all data error:', error);
            res.status(500).json({
                success: false,
                message: '清空数据失败'
            });
        }
    }
}

module.exports = AdminController;
