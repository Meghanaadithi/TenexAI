const express = require('express');
const { pool } = require('../db');
const { uploader } = require('../multer');
const { parseLogFile } = require('../services/parser');
const { detectAnomalies } = require('../services/anomaly');
const { buildSummary } = require('../services/summary');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', requireAuth, uploader.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    const logType = req.body && req.body.logType ? req.body.logType : 'auto';
    const [ins] = await pool.query(
      'INSERT INTO uploads (user_id, filename, stored_path, log_type) VALUES (?, ?, ?, ?)',
      [userId, file.originalname, file.path, logType]
    );
    const uploadId = ins.insertId;

    const events = await parseLogFile(file.path);
    for (const ev of events) {
      const [result] = await pool.query(
        'INSERT INTO log_events (upload_id, ts, src_ip, user, method, url, domain, status_code, action, bytes_sent, bytes_received, user_agent, raw_line) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [uploadId, ev.ts, ev.src_ip, ev.user, ev.method, ev.url, ev.domain, ev.status_code, ev.action, ev.bytes_sent, ev.bytes_received, ev.user_agent, ev.raw_line]
      );
      ev.id = result.insertId;
    }

    const anomalies = detectAnomalies(uploadId, events);
    for (const an of anomalies) {
      await pool.query(
        'INSERT INTO anomalies (upload_id, event_id, type, reason, confidence) VALUES (?, ?, ?, ?, ?)',
        [an.upload_id, an.event_id || null, an.type, an.reason, an.confidence]
      );
    }

    const summary = buildSummary(events);
    return res.json({ uploadId, counts: { events: events.length, anomalies: anomalies.length }, summary });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'processing failed' });
  }
});

router.get('/:uploadId/events', requireAuth, async (req, res) => {
  const uploadId = Number(req.params.uploadId);
  const limit = Math.min(500, Number(req.query.limit || 100));
  const offset = Number(req.query.offset || 0);
  const [rows] = await pool.query('SELECT * FROM log_events WHERE upload_id=? ORDER BY ts ASC LIMIT ? OFFSET ?', [uploadId, limit, offset]);
  res.json({ events: rows });
});

router.get('/:uploadId/anomalies', requireAuth, async (req, res) => {
  const uploadId = Number(req.params.uploadId);
  const [rows] = await pool.query('SELECT * FROM anomalies WHERE upload_id=? ORDER BY confidence DESC, created_at DESC', [uploadId]);
  res.json({ anomalies: rows });
});

router.get('/:uploadId/summary', requireAuth, async (req, res) => {
  const uploadId = Number(req.params.uploadId);
  const [rows] = await pool.query('SELECT * FROM log_events WHERE upload_id=?', [uploadId]);
  const events = rows.map(r => ({ ...r, ts: new Date(r.ts) }));
  const summary = buildSummary(events);
  res.json({ summary });
});

router.get('/', requireAuth, async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM uploads ORDER BY created_at DESC');
  res.json({ uploads: rows });
});

module.exports = router;
