const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const userData = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };

  User.create(userData, (result) => {
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  });
};

exports.login = (req, res) => {
  User.findByUsername(req.body.username, (user) => {
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });
};
