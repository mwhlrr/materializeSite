const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const pool = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use('/api/users', userRoutes);
app.use('/api/product', productRoutes); // Use the new route

// Route to create a new user
app.post('/api/users', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, password]);
    res.status(201).json({ id: result.insertId, email, username, password });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, username FROM users');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
