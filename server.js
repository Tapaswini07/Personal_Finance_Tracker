const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change to your MySQL user
  password: '', // Change to your MySQL password
  database: 'finance_tracker'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conected to MySQL');
});

// Routes
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

app.listen(3000, () => {
  console.log('Servr running on port 3000');
});