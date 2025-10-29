const { sql, pool, poolConnect } = require('../config/db');

exports.placeOrder = async (req, res) => {
  const { userId, address, items, paymentMethod, totalAmount } = req.body;

 if (!userId || !address || !items || !items.length) {
  console.log("Validation failed:", { userId, address, items });
  return res.status(400).json({ error: "Missing required fields" });
}

  try {
    await poolConnect;
    const orderInsert = await pool.request()
  .input("UserID", sql.Int, userId)
  .input("DeliveryAddress", sql.VarChar, address)
  .input("PaymentMethod", sql.VarChar, paymentMethod || "COD")
  .input("TotalAmount", sql.Decimal(10, 2), totalAmount)
  .query(`
    INSERT INTO Orders (UserID, DeliveryAddress, PaymentMethod, TotalAmount, OrderDate)
    OUTPUT INSERTED.ID
    VALUES (@UserID, @DeliveryAddress, @PaymentMethod, @TotalAmount, GETDATE())
  `);

    const orderId = orderInsert.recordset[0].ID;

    for (const item of items) {
      await pool.request()
        .input("OrderID", sql.Int, orderId)
        .input("ProductID", sql.Int, item.productId)
        .input("VariantID", sql.Int, item.variantId)
        .input("Quantity", sql.Int, item.quantity)
        .input("Price", sql.Decimal(10, 2), item.price)
        .input("Size", sql.VarChar, item.size)
        .input("Color", sql.VarChar, item.color)
        .query(`
          INSERT INTO OrderItems (OrderID, ProductID, VariantID, Quantity, Price, Size, Color)
          VALUES (@OrderID, @ProductID, @VariantID, @Quantity, @Price, @Size, @Color)
        `);
    }

    // Clear cart
    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Cart WHERE UserID = @UserID");

    res.status(200).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    console.error("Order Placement Error:", error);
   res.status(500).json({ error: error.message });

  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input("OrderID", sql.Int, orderId)
      .query(`SELECT * FROM Orders WHERE ID = @OrderID`);
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ error: "Error fetching order details" });
  }
};
