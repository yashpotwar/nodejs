const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');

// ✅ Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Image will go to /public/uploads/
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/**
 * ✅ Admin Route: Upload banner
 * POST /api/banners/upload
 */
router.post('/upload', upload.single('banner'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    await poolConnect;
    await pool.request()
      .input('ImagePath', sql.VarChar, file.filename)
      .query(`INSERT INTO Banners (ImagePath) VALUES (@ImagePath)`);

    res.json({
      message: 'Banner uploaded successfully',
      fileUrl: `/uploads/${file.filename}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload banner' });
  }
});

/**
 * ✅ Client Route: Get all banners
 * GET /api/banners
 */
router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`SELECT * FROM Banners ORDER BY ID DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

module.exports = router;
