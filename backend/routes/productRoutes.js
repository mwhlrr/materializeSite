const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/db');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|mp4/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File upload only supports the following filetypes - ' + filetypes));
  }
});

// Fetch all product items
router.get('/', (req, res) => {
  db.query('SELECT * FROM productItems', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add a new product item
router.post('/', upload.fields([{ name: 'photos', maxCount: 5 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  const { name, price, rating, likes } = req.body;
  const photos = req.files['photos'] ? req.files['photos'].map(file => file.filename) : [];
  const video = req.files['video'] ? req.files['video'][0].filename : null;

  db.query('INSERT INTO productItems (name, price, rating, likes, photos, video) VALUES (?, ?, ?, ?, ?, ?)', [name, price, rating, likes, JSON.stringify(photos), video], (err, result) => {
    if (err) throw err;
    res.status(201).json({ message: 'Product item added successfully', itemId: result.insertId });
  });
});

module.exports = router;
