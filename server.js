const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname))); 

const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Niki@2005',
  database: 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ...existing code...
// Replace the old `db.connect(...)` (not available on a pool) with:
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1); // optional: stop app if DB is not available
  } else {
    console.log('Connected to MySQL (pool)');
    connection.release();
  }
});

// Routes
// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/register', async (req, res) => {
  const { name, email, age, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (name, email, age, password) VALUES (?, ?, ?, ?)', [name, email, age, hashedPassword], (err) => {
    if (err) return res.status(500).send(err);
    res.send('User registered');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).send('User not found');
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid password');
    res.send({ id: user.id, name: user.name, age: user.age });
  });
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', async (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results.map(user => ({ id: user.id, name: user.name, email: user.email, age: user.age })));
  });
});

app.get('/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM transactions WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.post('/transactions', (req, res) => {
  const { user_id, type, amount, category, source, frequency, date, description } = req.body;
  db.query('INSERT INTO transactions (user_id, type, amount, category, source, frequency, date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [user_id, type, amount, category, source, frequency, date, description], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Transaction added');
  });
});

app.get('/budgets/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.post('/budgets', (req, res) => {
  const { user_id, category, amount, deadline } = req.body;
  db.query('INSERT INTO budgets (user_id, category, amount, deadline) VALUES (?, ?, ?, ?)', [user_id, category, amount, deadline], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Budget set');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});