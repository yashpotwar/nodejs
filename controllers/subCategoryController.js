const { sql, pool, poolConnect } = require('../config/db');

// GET all subcategories
const getSubCategories = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT ID, Name, CategoryID FROM SubCategories');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error loading subcategories:', err);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
};

module.exports = { getSubCategories };
