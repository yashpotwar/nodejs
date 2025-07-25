const { sql, pool, poolConnect } = require('../config/db');

// Fetch purchase reports
const getReports = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT 
        r.ID, 
        a.Username AS UserName, 
        p.Name AS ProductName, 
        r.PurchaseDate, 
        r.Quantity, 
        r.TotalPrice
      FROM Reports r
      INNER JOIN AdminUsers a ON r.UserID = a.UserId
      INNER JOIN Products p ON r.ProductID = p.Id
      ORDER BY r.PurchaseDate DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error while fetching reports');
  }
};

// Fetch deleted product logs
const getDeletedProductLogs = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT ID, ProductName, DeletedBy, DeletedAt
      FROM DeletedProductLogs
      ORDER BY DeletedAt DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error loading deleted product logs:', err);
    res.status(500).send('Server error while fetching deleted logs');
  }
};

module.exports = {
  getReports,
  getDeletedProductLogs
};
