const express = require('express');
const { pool } = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await hashPassword(password);
    const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    const id = result.insertId;
    return res.json({ id, email });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email already exists' });
    return res.status(500).json({ error: 'db error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
  const user = Array.isArray(rows) && rows[0];
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = signToken({ id: user.id, email: user.email });
  res.json({ token });
});

module.exports = router;
