const { sql, pool, poolConnect } = require('../config/db');

const getDashboardMetrics = async (req, res) => {
  try {
    //const pool = await poolPromise.connect();
     await poolConnect;
    console.log('✅ Connected to database');

    // Fetch total sales
    const totalSalesResult = await pool.request().query(`
      SELECT ISNULL(SUM(TotalPrice), 0) AS totalSales FROM reports
    `);

    // Fetch order count
    const ordersResult = await pool.request().query(`
      SELECT COUNT(*) AS orders FROM reports
    `);

    // Fetch total product count
    const productCountResult = await pool.request().query(`
      SELECT COUNT(*) AS totalProducts FROM products
    `);

    // Fetch total stock
    const totalStockResult = await pool.request().query(`
      SELECT ISNULL(SUM(Stock), 0) AS totalStock FROM products
    `);

    // Fetch recent reports
    const recentReportsResult = await pool.request().query(`
      SELECT TOP 5 ID, UserID, ProductID, TotalPrice, PurchaseDate 
      FROM reports 
      ORDER BY PurchaseDate DESC
    `);

    console.log('📋 Recent reports fetched:', recentReportsResult.recordset);

    // Safely map reports even if values are missing/null
    const recentReports = recentReportsResult.recordset.map(report => {
      const user = report.UserID ?? 'N/A';
      const product = report.ProductID ?? 'N/A';
      const price = report.TotalPrice ?? 0;
      return `🧾 User ${user} bought Product ${product} (₹${price})`;
    });

    res.json({
      totalSales: totalSalesResult.recordset[0]?.totalSales ?? 0,
      orders: ordersResult.recordset[0]?.orders ?? 0,
      totalProducts: productCountResult.recordset[0]?.totalProducts ?? 0,
      stockLeft: totalStockResult.recordset[0]?.totalStock ?? 0,
      recentReports
    });

  } catch (error) {
    console.error('❌ Dashboard data fetch error:', error);
    res.status(500).json({ error: 'Something went wrong while fetching dashboard metrics' });
  }
};

module.exports = { getDashboardMetrics };
