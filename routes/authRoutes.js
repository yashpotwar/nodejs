const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here'; // ✅ Set this in .env

// ✅ COMBINED LOGIN FOR USER AND ADMIN
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    await poolConnect;

    // 1️⃣ Check normal user (email login)
    const userResult = await pool.request()
      .input('email', sql.NVarChar, identifier)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM Users 
        WHERE Email COLLATE SQL_Latin1_General_CP1_CI_AS = @email 
        AND Password COLLATE SQL_Latin1_General_CP1_CI_AS = @password
      `);

    if (userResult.recordset.length > 0) {
      const user = userResult.recordset[0];
      
      // ✅ Generate token
      const token = jwt.sign(
        { id: user.ID, role: 'user' },
        JWT_SECRET,
        { expiresIn: '2h' } // ⏳ Optional
      );

      return res.json({
        success: true,
        type: 'user',
        token,
        user
      });
    }

    // 2️⃣ Check admin login (username login)
    const adminResult = await pool.request()
      .input('username', sql.NVarChar, identifier)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM AdminUsers 
        WHERE Username COLLATE SQL_Latin1_General_CP1_CI_AS = @username 
        AND Password COLLATE SQL_Latin1_General_CP1_CI_AS = @password
      `);

    if (adminResult.recordset.length > 0) {
      const admin = adminResult.recordset[0];
      
      // ✅ Generate token
      const token = jwt.sign(
        { id: admin.ID, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        success: true,
        type: 'admin',
        token,
        user: admin
      });
    }

    // ❌ No match found
    res.status(401).json({ success: false, message: '❌ Invalid email/username or password' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: '❌ Server error' });
  }
});

module.exports = router;