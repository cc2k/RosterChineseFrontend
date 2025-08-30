
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./roster.db');

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    position TEXT,
    user_id INTEGER,
    free INTEGER DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// --- TEST DATA GENERATION ---
function generateTestUsersAndShifts() {
  const userNames = [
    'john_doe', 'jane_smith', 'test', 'alice', 'bob',
    'charlie', 'david', 'eve', 'frank', 'grace'
  ];
  const positions = ['restaurant', 'driver', 'kitchen', 'take-out'];
  // Add users if not present
  userNames.forEach((username, idx) => {
    db.run('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)', [username, 'pass'+(idx+1)]);
  });

  // Generate shifts for each day from July 2025 to Dec 2026
  const start = new Date('2025-07-01');
  const end = new Date('2026-12-31');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Random number of shifts per day (3-6, avg 4)
    const numShifts = [3,4,4,4,5,6][Math.floor(Math.random()*6)];
    // Shuffle users for assignment
    const shuffledUsers = userNames.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < numShifts; i++) {
      const position = positions[i % positions.length];
  const userIdx = Math.random() < 0.5 ? null : i % userNames.length;
      // 50% chance shift is free, 50% taken
      if (userIdx !== null && Math.random() < 0.5) {
        // Assign to user
        db.run('INSERT INTO shifts (date, position, user_id, free) VALUES (?, ?, (SELECT id FROM users WHERE username = ?), 0)', [d.toISOString().slice(0,10), position, shuffledUsers[i % shuffledUsers.length]]);
      } else {
        // Free shift
        db.run('INSERT INTO shifts (date, position, free) VALUES (?, ?, 1)', [d.toISOString().slice(0,10), position]);
      }
    }
  }
}

// Uncomment to run test data generation once
// generateTestUsersAndShifts();

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a user
app.post('/api/users', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, username, password });
  });
});

// Get all shifts
app.get('/api/shifts', (req, res) => {
  db.all('SELECT * FROM shifts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add a free shift
app.post('/api/shifts', (req, res) => {
  const { date, position } = req.body;
  db.run('INSERT INTO shifts (date, position, free) VALUES (?, ?, 1)', [date, position], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, date, position, free: 1 });
  });
});

// Take a shift (assign user)
app.put('/api/shifts/:id/take', (req, res) => {
  const shiftId = req.params.id;
  const { user_id } = req.body;
  db.run('UPDATE shifts SET user_id = ?, free = 0 WHERE id = ?', [user_id, shiftId], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

// Free a shift (make it open again)
app.put('/api/shifts/:id/free', (req, res) => {
  const shiftId = req.params.id;
  db.run('UPDATE shifts SET user_id = NULL, free = 1 WHERE id = ?', [shiftId], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/', (req, res) => {
  res.send('Roster API is running. Try /api/users or /api/shifts');
});

app.listen(PORT, HOST, () => {
  console.log(`Roster backend running on http://${HOST}:${PORT}`);
});