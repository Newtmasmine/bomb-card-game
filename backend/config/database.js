const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 在Vercel环境中使用内存数据库
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const dbPath = isVercel ? ':memory:' : path.join(__dirname, '..', 'database', 'game.db');

class Database {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, async (err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database:', dbPath);
                    
                    // 在Vercel环境中，每次都需要初始化表结构
                    if (isVercel || !this.initialized) {
                        try {
                            await this.initializeTables();
                            this.initialized = true;
                            console.log('Database tables initialized');
                        } catch (initError) {
                            console.error('Error initializing tables:', initError);
                            reject(initError);
                            return;
                        }
                    }
                    
                    resolve(this.db);
                }
            });
        });
    }

    async initializeTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                balance INTEGER DEFAULT 2000
            )`,
            `CREATE TABLE IF NOT EXISTS user_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                games_played INTEGER DEFAULT 0,
                games_won INTEGER DEFAULT 0,
                total_score INTEGER DEFAULT 0,
                best_score INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,
            `CREATE TABLE IF NOT EXISTS game_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                score INTEGER NOT NULL,
                level INTEGER DEFAULT 1,
                cards_flipped INTEGER DEFAULT 0,
                bombs_hit INTEGER DEFAULT 0,
                time_played INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,
            `CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                user_id INTEGER,
                start_time DATETIME NOT NULL,
                end_time DATETIME,
                total_rounds INTEGER DEFAULT 0,
                total_cards_flipped INTEGER DEFAULT 0,
                total_bombs_hit INTEGER DEFAULT 0,
                total_bonus INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,
            `CREATE TABLE IF NOT EXISTS game_rounds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id INTEGER,
                round_number INTEGER DEFAULT 1,
                flipped_cards INTEGER DEFAULT 0,
                round_bonus INTEGER DEFAULT 0,
                end_reason TEXT,
                penalty_amount INTEGER DEFAULT 0,
                bomb_count INTEGER DEFAULT 0,
                total_bonus_after INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`,
            `CREATE TABLE IF NOT EXISTS risk_estimations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id INTEGER,
                actual_bomb_prob REAL NOT NULL,
                flipped_count INTEGER NOT NULL,
                estimation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )`
        ];

        for (const sql of tables) {
            await this.run(sql);
        }
        
        // 添加默认管理员账号（如果不存在）
        try {
            const bcrypt = require('bcrypt');
            const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            await this.run(
                `INSERT OR IGNORE INTO users (id, username, password, balance) VALUES (1, 'admin', ?, 999999)`,
                [adminPassword]
            );
            await this.run(
                `INSERT OR IGNORE INTO user_stats (user_id) VALUES (1)`
            );
        } catch (error) {
            console.log('Admin user already exists or error creating:', error.message);
        }
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // 执行查询
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 执行单个查询
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 执行插入/更新/删除
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }
}

module.exports = new Database();
