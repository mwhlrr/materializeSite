const express = require('express');
const multer = require('multer');
const router = express.Router();
const pool = require('../config/db'); // Use the promise-based pool

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
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM productItems');
    res.json(results);
  } catch (err) {
    console.error('Error fetching product items:', err);
    res.status(500).json({ error: 'Failed to fetch product items' });
  }
});

// Add a new product item
router.post('/', upload.fields([{ name: 'photo', maxCount: 5 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { name, price, rating, likes } = req.body;
  const photos = req.files['photo'] ? req.files['photo'].map(file => file.filename) : [];
  const video = req.files['video'] ? req.files['video'][0].filename : null;
  
  if (photos.length < 1) {
    return res.status(400).json({ error: 'At least one photo is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO productItems (name, price, rating, likes, photo, video) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, rating, likes, JSON.stringify(photos), video]
    );
    res.status(201).json({ message: 'Product item added successfully', itemId: result.insertId });
  } catch (err) {
    console.error('Error adding product item:', err);
    res.status(500).json({ error: 'Failed to add product item' });
  }
});

module.exports = router;
