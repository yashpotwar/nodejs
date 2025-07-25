const { sql, pool, poolConnect } = require('../config/db');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    await poolConnect;

    // 🔍 1. Check in AdminUsers (Username = username)
    const adminResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM AdminUsers 
        WHERE Username COLLATE SQL_Latin1_General_CP1_CI_AS = @username 
        AND Password COLLATE SQL_Latin1_General_CP1_CI_AS = @password
      `);

    if (adminResult.recordset.length > 0) {
      return res.json({ success: true, user: adminResult.recordset[0], role: 'admin' });
    }

    // 🔍 2. Check in Users (Email = username)
    const userResult = await pool.request()
      .input('email', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query(`
        SELECT * FROM Users 
        WHERE Email COLLATE SQL_Latin1_General_CP1_CI_AS = @email 
        AND Password COLLATE SQL_Latin1_General_CP1_CI_AS = @password
      `);

    if (userResult.recordset.length > 0) {
      return res.json({ success: true, user: userResult.recordset[0], role: 'user' });
    }

    return res.status(401).json({ success: false, message: '❌ Invalid username/email or password' });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: '❌ Server error' });
  }
};

module.exports = {
  login
};
