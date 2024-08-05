require('dotenv').config();
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'pemsoxpeN2',
  database: 'productDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;