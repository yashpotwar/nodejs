const { pool, sql, poolConnect } = require('../config/db');

exports.getBanners = async (req, res) => {
  try {
    await poolConnect;

    const result = await pool.request()
      .query(`SELECT * FROM Banners WHERE IsActive = 1 ORDER BY CreatedAt DESC`);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching banners:', err);
    res.status(500).json({ error: 'Error fetching banners' });
  }
};
