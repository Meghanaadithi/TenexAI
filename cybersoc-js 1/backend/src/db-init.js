const { pool } = require('./db');
(async () => {
  const statements = [
`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  stored_path VARCHAR(512) NOT NULL,
  log_type VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`,
`CREATE TABLE IF NOT EXISTS log_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  upload_id INT NOT NULL,
  ts DATETIME NOT NULL,
  src_ip VARCHAR(64) NULL,
  user VARCHAR(255) NULL,
  method VARCHAR(16) NULL,
  url TEXT NULL,
  domain VARCHAR(255) NULL,
  status_code INT NULL,
  action VARCHAR(64) NULL,
  bytes_sent BIGINT NULL,
  bytes_received BIGINT NULL,
  user_agent TEXT NULL,
  raw_line TEXT NOT NULL,
  INDEX (upload_id, ts),
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
)`,
`CREATE TABLE IF NOT EXISTS anomalies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  upload_id INT NOT NULL,
  event_id INT NULL,
  type VARCHAR(64) NOT NULL,
  reason TEXT NOT NULL,
  confidence DOUBLE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (upload_id),
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES log_events(id) ON DELETE SET NULL
)`
  ];

  try {
    const conn = await pool.getConnection();
    for (const sql of statements) {
      await conn.query(sql);
    }
    conn.release();
    console.log('DB initialized.');
    process.exit(0);
  } catch (e) {
    console.error('DB init error', e);
    process.exit(1);
  }
})();
