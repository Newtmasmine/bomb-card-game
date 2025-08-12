const database = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // 创建新用户
    static async create(userData) {
        const { username, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const result = await database.run(
                `INSERT INTO users (username, password) VALUES (?, ?)`,
                [username, hashedPassword]
            );

            // 同时创建用户统计记录
            await database.run(
                `INSERT INTO user_stats (user_id) VALUES (?)`,
                [result.id]
            );

            return result.id;
        } catch (error) {
            throw error;
        }
    }

    // 用户登录验证
    static async authenticate(username, password) {
        try {
            const user = await database.get(
                `SELECT id, username, password FROM users WHERE username = ?`,
                [username]
            );

            if (user && await bcrypt.compare(password, user.password)) {
                // 更新最后登录时间
                await database.run(
                    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
                    [user.id]
                );
                return { id: user.id, username: user.username };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    // 获取用户信息
    static async getById(userId) {
        try {
            return await database.get(
                `SELECT * FROM users WHERE id = ?`,
                [userId]
            );
        } catch (error) {
            throw error;
        }
    }

    // 获取用户统计数据
    static async getStats(userId) {
        try {
            return await database.get(`
                WITH round_agg AS (
                    SELECT 
                        user_id,
                        COUNT(*) AS rounds_played,
                        SUM(flipped_cards) AS total_flips,
                        SUM(CASE WHEN end_reason = 'stop' THEN 1 ELSE 0 END) AS early_exits,
                        SUM(CASE WHEN end_reason = 'bomb' THEN 1 ELSE 0 END) AS bomb_triggers
                    FROM game_rounds
                    GROUP BY user_id
                ), session_agg AS (
                    SELECT user_id, COUNT(*) AS games_played
                    FROM game_sessions
                    GROUP BY user_id
                )
                SELECT 
                    u.id,
                    u.username,
                    u.balance AS current_balance,
                    (u.balance - 2000) AS total_rewards,
                    u.created_at,
                    u.last_login,
                    COALESCE(sa.games_played, 0) AS games_played,
                    COALESCE(ra.total_flips, 0) AS total_flips,
                    COALESCE(ra.rounds_played, 0) AS rounds_played,
                    COALESCE(ra.early_exits, 0) AS early_exits,
                    COALESCE(ra.bomb_triggers, 0) AS bomb_triggers
                FROM users u
                LEFT JOIN round_agg ra ON u.id = ra.user_id
                LEFT JOIN session_agg sa ON u.id = sa.user_id
                WHERE u.id = ?
            `, [userId]);
        } catch (error) {
            console.error('getStats error:', error);
            throw error;
        }
    }

    // 更新用户余额
    static async updateBalance(userId, newBalance) {
        try {
            await database.run(
                `UPDATE users SET balance = ? WHERE id = ?`,
                [newBalance, userId]
            );
        } catch (error) {
            console.error('updateBalance error:', error);
            throw error;
        }
    }

    // 更新用户统计
    static async updateStats(userId, stats) {
        try {
            const {
                total_flips = 0,
                games_played = 0,
                rounds_played = 0,
                early_exits = 0,
                bomb_triggers = 0,
                total_game_time = 0
            } = stats;

            await database.run(`
                UPDATE user_stats SET
                    total_flips = total_flips + ?,
                    games_played = games_played + ?,
                    rounds_played = rounds_played + ?,
                    early_exits = early_exits + ?,
                    bomb_triggers = bomb_triggers + ?,
                    total_game_time = total_game_time + ?
                WHERE user_id = ?
            `, [total_flips, games_played, rounds_played, early_exits, bomb_triggers, total_game_time, userId]);
        } catch (error) {
            throw error;
        }
    }

    // 获取单个用户详细统计信息（包含聚合数据）
    static async getStats(userId) {
        try {
            const result = await database.get(`
                WITH round_agg AS (
                    SELECT 
                        user_id,
                        COUNT(*) AS rounds_played,
                        SUM(flipped_cards) AS total_flips,
                        SUM(CASE WHEN end_reason = 'stop' THEN 1 ELSE 0 END) AS early_exits,
                        SUM(CASE WHEN end_reason = 'bomb' THEN 1 ELSE 0 END) AS bomb_triggers
                    FROM game_rounds
                    WHERE user_id = ?
                ), session_agg AS (
                    SELECT user_id, COUNT(*) AS games_played
                    FROM game_sessions
                    WHERE user_id = ?
                )
                SELECT 
                    u.id,
                    u.username,
                    u.balance AS current_balance,
                    (u.balance - 2000) AS total_rewards,
                    u.created_at,
                    u.last_login,
                    COALESCE(ra.total_flips, 0) AS total_flips,
                    COALESCE(sa.games_played, 0) AS games_played,
                    COALESCE(ra.rounds_played, 0) AS rounds_played,
                    COALESCE(ra.early_exits, 0) AS early_exits,
                    COALESCE(ra.bomb_triggers, 0) AS bomb_triggers
                FROM users u
                LEFT JOIN round_agg ra ON u.id = ra.user_id
                LEFT JOIN session_agg sa ON u.id = sa.user_id
                WHERE u.id = ?
            `, [userId, userId, userId]);

            return result;
        } catch (error) {
            console.error('getStats error:', error);
            throw error;
        }
    }

    // 获取所有用户列表（含统计）（管理员用）
    static async getAllUsers() {
        try {
            return await database.query(`
                WITH round_agg AS (
                    SELECT 
                        user_id,
                        COUNT(*) AS rounds_played,
                        SUM(flipped_cards) AS total_flips,
                        SUM(CASE WHEN end_reason = 'stop' THEN 1 ELSE 0 END) AS early_exits,
                        SUM(CASE WHEN end_reason = 'bomb' THEN 1 ELSE 0 END) AS bomb_triggers
                    FROM game_rounds
                    GROUP BY user_id
                ), session_agg AS (
                    SELECT user_id, COUNT(*) AS games_played
                    FROM game_sessions
                    GROUP BY user_id
                )
                SELECT 
                    u.id,
                    u.username,
                    u.balance AS current_balance,
                    (u.balance - 2000) AS total_rewards,
                    u.created_at,
                    u.last_login,
                    COALESCE(ra.total_flips, 0) AS total_flips,
                    COALESCE(sa.games_played, 0) AS games_played,
                    COALESCE(ra.rounds_played, 0) AS rounds_played,
                    COALESCE(ra.early_exits, 0) AS early_exits,
                    COALESCE(ra.bomb_triggers, 0) AS bomb_triggers
                FROM users u
                LEFT JOIN round_agg ra ON u.id = ra.user_id
                LEFT JOIN session_agg sa ON u.id = sa.user_id
                WHERE u.id > 0
                ORDER BY u.created_at DESC
            `);
        } catch (error) {
            console.error('getAllUsers error:', error);
            throw error;
        }
    }

    // 删除用户
    static async delete(userId) {
        try {
            await database.run(`DELETE FROM users WHERE id = ?`, [userId]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
