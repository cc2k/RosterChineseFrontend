

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2');

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());




// Test MySQL connection
app.get('/api/test-mysql', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    connection.ping((pingErr) => {
      connection.release();
      if (pingErr) {
        return res.status(500).json({ success: false, error: pingErr.message });
      }
      res.json({ success: true, message: 'MySQL connection successful!' });
    });
  });
});

// Get all roles
app.get('/api/roles', (req, res) => {
  pool.query('SELECT role_id, role_name FROM roles ORDER BY role_id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get('/', (req, res) => {
  res.send('Roster API is running. Try /api/users or /api/shifts');
});
app.listen(PORT, HOST, () => {
  console.log(`Roster backend running on http://${HOST}:${PORT}`);
});

// Get all users
app.get('/api/users', (req, res) => {
  pool.query('SELECT user_id, username FROM users ORDER BY user_id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a user
app.post('/api/users', (req, res) => {
  const { username, password_hash } = req.body;
  if (!username || !password_hash) {
    return res.status(400).json({ error: 'username and password_hash are required' });
  }
  pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password_hash], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ user_id: result.insertId, username });
  });
});

// Get all user unavailability records
app.get('/api/user_unavailability', (req, res) => {
  pool.query('SELECT unavail_id, user_id, unavailable_date, reason FROM user_unavailability ORDER BY unavail_id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a user unavailability record
app.post('/api/user_unavailability', (req, res) => {
  const { user_id, unavailable_date, reason } = req.body;
  if (!user_id || !unavailable_date) {
    return res.status(400).json({ error: 'user_id and unavailable_date are required' });
  }
  pool.query('INSERT INTO user_unavailability (user_id, unavailable_date, reason) VALUES (?, ?, ?)', [user_id, unavailable_date, reason || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ unavail_id: result.insertId, user_id, unavailable_date, reason });
  });
});
// Get all user roles
app.get('/api/user_roles', (req, res) => {
  pool.query('SELECT user_id, role_id FROM user_roles ORDER BY user_id, role_id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a user role
app.post('/api/user_roles', (req, res) => {
  const { user_id, role_id } = req.body;
  if (!user_id || !role_id) {
    return res.status(400).json({ error: 'user_id and role_id are required' });
  }
  pool.query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user_id, role_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ user_id, role_id });
  });
});
// Get all shifts
app.get('/api/shifts', (req, res) => {
  pool.query('SELECT shift_id, shift_date, start_time, end_time, role_id FROM shifts ORDER BY shift_id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a shift
app.post('/api/shifts', (req, res) => {
  const { shift_date, start_time, end_time, role_id } = req.body;
  if (!shift_date || !start_time || !end_time || !role_id) {
    return res.status(400).json({ error: 'shift_date, start_time, end_time, and role_id are required' });
  }
  pool.query('INSERT INTO shifts (shift_date, start_time, end_time, role_id) VALUES (?, ?, ?, ?)', [shift_date, start_time, end_time, role_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ shift_id: result.insertId, shift_date, start_time, end_time, role_id });
  });
});
// Get all shift assignments
app.get('/api/shift_assignments', (req, res) => {
  const sql = `
    SELECT sa.assignment_id, sa.shift_id, sa.user_id, s.shift_date, s.role_id
    FROM shift_assignments sa
    JOIN shifts s ON sa.shift_id = s.shift_id
    ORDER BY sa.assignment_id
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a shift assignment
app.post('/api/shift_assignments', (req, res) => {
  const { shift_id, user_id } = req.body;
  if (!shift_id || !user_id) {
    return res.status(400).json({ error: 'shift_id and user_id are required' });
  }
  pool.query('INSERT INTO shift_assignments (shift_id, user_id) VALUES (?, ?)', [shift_id, user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ assignment_id: result.insertId, shift_id, user_id });
  });
});



// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required.' });
  }
  pool.query('SELECT user_id, username, password_hash FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error.' });
    }
    if (results.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }
    const user = results[0];
    if (user.password_hash === password) {
      return res.json({ success: true, user: { user_id: user.user_id, username: user.username } });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }
  });
});

// Get all free (unassigned) shifts
app.get('/api/free_shifts', (req, res) => {
  const sql = `
    SELECT s.shift_id, s.shift_date, s.start_time, s.end_time, s.role_id
    FROM shifts s
    LEFT JOIN shift_assignments sa ON s.shift_id = sa.shift_id
    WHERE sa.shift_id IS NULL
    ORDER BY s.shift_id
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});