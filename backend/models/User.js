const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // 创建新用户
    static async create(userData) {
        const { username, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const result = await db.run(
                `INSERT INTO users (username, password) VALUES (?, ?)`,
                [username, hashedPassword]
            );

            // 同时创建用户统计记录
            await db.run(
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
            const user = await db.get(
                `SELECT id, username, password FROM users WHERE username = ?`,
                [username]
            );

            if (user && await bcrypt.compare(password, user.password)) {
                // 更新最后登录时间
                await db.run(
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
            return await db.get(
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
            return await db.get(`
                SELECT 
                    u.username,
                    u.balance as current_balance,
                    0 as total_rewards,
                    u.created_at,
                    u.last_login,
                    COALESCE(s.games_played, 0) as games_played,
                    COALESCE(s.games_won, 0) as games_won,
                    COALESCE(s.total_score, 0) as total_score,
                    COALESCE(s.best_score, 0) as best_score,
                    0 as total_flips,
                    0 as rounds_played,
                    0 as early_exits,
                    0 as bomb_triggers,
                    0 as total_game_time
                FROM users u
                LEFT JOIN user_stats s ON u.id = s.user_id
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
            await db.run(
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

            await db.run(`
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

    // 获取所有用户列表（管理员用）
    static async getAllUsers() {
        try {
            return await db.query(`
                SELECT 
                    u.id,
                    u.username,
                    u.current_balance,
                    u.total_rewards,
                    u.created_at,
                    u.last_login,
                    s.total_flips,
                    s.games_played,
                    s.rounds_played,
                    s.early_exits,
                    s.bomb_triggers,
                    s.total_game_time
                FROM users u
                LEFT JOIN user_stats s ON u.id = s.user_id
                ORDER BY u.created_at DESC
            `);
        } catch (error) {
            throw error;
        }
    }

    // 删除用户
    static async delete(userId) {
        try {
            await db.run(`DELETE FROM users WHERE id = ?`, [userId]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
