const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库文件路径
const dbPath = path.join(__dirname, '..', 'database', 'game.db');

// 确保数据库目录存在
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

// 创建表结构
db.serialize(() => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance INTEGER DEFAULT 2000,
        is_first_login BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 用户统计表
    db.run(`CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        total_flips INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        rounds_played INTEGER DEFAULT 0,
        early_exits INTEGER DEFAULT 0,
        bomb_triggers INTEGER DEFAULT 0,
        total_game_time INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);

    // 游戏会话表
    db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        total_flips INTEGER DEFAULT 0,
        total_bomb_hits INTEGER DEFAULT 0,
        total_rewards INTEGER DEFAULT 0,
        session_duration INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )`);

    // 游戏轮次表
    db.run(`CREATE TABLE IF NOT EXISTS game_rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        flipped_cards INTEGER DEFAULT 0,
        round_bonus INTEGER DEFAULT 0,
        end_reason TEXT, -- 'bomb', 'win', 'stop'
        penalty_amount INTEGER DEFAULT 0,
        bomb_count INTEGER DEFAULT 0,
        total_cards INTEGER DEFAULT 16,
        duration INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions (id) ON DELETE CASCADE
    )`);

    // 风险估计数据表
    db.run(`CREATE TABLE IF NOT EXISTS risk_estimations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        round_id INTEGER NOT NULL,
        actual_bomb_prob REAL NOT NULL,
        flipped_count INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES game_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (round_id) REFERENCES game_rounds (id) ON DELETE CASCADE
    )`);

    // 管理员表
    db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // 插入默认管理员账户（密码：admin001）
    const bcrypt = require('bcrypt');
    const defaultAdminPassword = bcrypt.hashSync('admin001', 10);
    
    db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`, 
        ['admin', defaultAdminPassword], (err) => {
            if (err) {
                console.error('Error creating admin user:', err);
            } else {
                console.log('Default admin user created successfully');
            }
        });

    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('- users');
    console.log('- user_stats');
    console.log('- game_sessions');
    console.log('- game_rounds');
    console.log('- risk_estimations');
    console.log('- admins');
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed.');
    }
});
