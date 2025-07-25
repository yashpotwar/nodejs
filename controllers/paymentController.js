// server/controllers/paymentController.js
const { sql, pool, poolConnect } = require('../config/db');

exports.checkoutPayment = async (req, res) => {
  const { userId, cartTotal } = req.body;

  try {
    //const pool = await poolPromise.connect();
     await poolConnect;
    await pool.request()
      .input("userId", sql.Int, userId)
      .input("cartTotal", sql.Decimal(10, 2), cartTotal)
      .input("paymentStatus", sql.VarChar, 'Success')
      .query(`
        INSERT INTO Payments (userId, cartTotal, paymentStatus)
        VALUES (@userId, @cartTotal, @paymentStatus)
      `);

    res.json({ status: 'Success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  }
};
