const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: (userData, callback) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', 
             [userData.username, hashedPassword, userData.email], 
             (err, result) => {
      if (err) throw err;
      callback(result);
    });
  },
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
      if (err) throw err;
      callback(result[0]);
    });
  }
};

module.exports = User;
