const db = require('../config/database');

class GameSession {
    // 创建游戏会话
    static async create(userId, sessionData) {
        try {
            const result = await db.run(`
                INSERT INTO game_sessions (
                    user_id, start_time, total_flips, total_bomb_hits, 
                    total_rewards, session_duration
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                userId,
                sessionData.start_time,
                sessionData.total_flips || 0,
                sessionData.total_bomb_hits || 0,
                sessionData.total_rewards || 0,
                sessionData.session_duration || 0
            ]);

            return result.id;
        } catch (error) {
            throw error;
        }
    }

    // 更新游戏会话
    static async update(sessionId, sessionData) {
        try {
            await db.run(`
                UPDATE game_sessions SET
                    end_time = ?,
                    total_flips = ?,
                    total_bomb_hits = ?,
                    total_rewards = ?,
                    session_duration = ?
                WHERE id = ?
            `, [
                sessionData.end_time,
                sessionData.total_flips,
                sessionData.total_bomb_hits,
                sessionData.total_rewards,
                sessionData.session_duration,
                sessionId
            ]);
        } catch (error) {
            throw error;
        }
    }

    // 获取用户的所有游戏会话
    static async getUserSessions(userId) {
        try {
            return await db.query(`
                SELECT * FROM game_sessions 
                WHERE user_id = ? 
                ORDER BY start_time DESC
            `, [userId]);
        } catch (error) {
            throw error;
        }
    }

    // 获取所有游戏会话（管理员用）
    static async getAllSessions() {
        try {
            return await db.query(`
                SELECT 
                    gs.*,
                    u.username
                FROM game_sessions gs
                JOIN users u ON gs.user_id = u.id
                ORDER BY gs.start_time DESC
            `);
        } catch (error) {
            throw error;
        }
    }
}

class GameRound {
    // 创建游戏轮次
    static async create(sessionId, roundData) {
        try {
            const result = await db.run(`
                INSERT INTO game_rounds (
                    session_id, round_number, flipped_cards, round_bonus,
                    end_reason, penalty_amount, bomb_count, total_cards, duration
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sessionId,
                roundData.round_number,
                roundData.flipped_cards || 0,
                roundData.round_bonus || 0,
                roundData.end_reason || '',
                roundData.penalty_amount || 0,
                roundData.bomb_count || 0,
                roundData.total_cards || 16,
                roundData.duration || 0
            ]);

            return result.id;
        } catch (error) {
            throw error;
        }
    }

    // 获取会话的所有轮次
    static async getSessionRounds(sessionId) {
        try {
            return await db.query(`
                SELECT * FROM game_rounds 
                WHERE session_id = ? 
                ORDER BY round_number ASC
            `, [sessionId]);
        } catch (error) {
            throw error;
        }
    }
}

class RiskEstimation {
    // 记录风险估计数据
    static async create(userId, sessionId, roundId, estimationData) {
        try {
            await db.run(`
                INSERT INTO risk_estimations (
                    user_id, session_id, round_id, 
                    actual_bomb_prob, flipped_count
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                userId,
                sessionId,
                roundId,
                estimationData.actual_bomb_prob,
                estimationData.flipped_count
            ]);
        } catch (error) {
            throw error;
        }
    }

    // 获取用户的风险估计数据
    static async getUserEstimations(userId) {
        try {
            return await db.query(`
                SELECT * FROM risk_estimations 
                WHERE user_id = ? 
                ORDER BY timestamp DESC
            `, [userId]);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = {
    GameSession,
    GameRound,
    RiskEstimation
};
