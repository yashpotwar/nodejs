const sql = require("mssql");
const dbConfig = require("../config/db");

exports.placeOrder = async (req, res) => {
  const { userId, address, items, paymentMethod, totalAmount } = req.body;

  if (!userId || !address || !items || !items.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const pool = await sql.connect(dbConfig);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const orderInsert = await transaction.request()
      .input("UserID", sql.Int, userId)
      .input("DeliveryAddress", sql.VarChar, address)  // ✅ correct
      .input("PaymentMethod", sql.VarChar, paymentMethod || "COD")
      .input("TotalAmount", sql.Decimal(10, 2), totalAmount)
      .query(`
        INSERT INTO Orders (UserID, Address, PaymentMethod, TotalAmount, OrderDate)
        OUTPUT INSERTED.ID
        VALUES (@UserID, @Address, @PaymentMethod, @TotalAmount, GETDATE())
      `);

    const orderId = orderInsert.recordset[0].ID;

    for (const item of items) {
      await transaction.request()
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
    await transaction.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Cart WHERE UserID = @UserID");

    await transaction.commit();
    res.status(200).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    await transaction.rollback();
    console.error("Order Placement Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get Order by ID
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("OrderID", sql.Int, orderId)
      .query(`SELECT * FROM Orders WHERE ID = @OrderID`);
    
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ error: "Error fetching order details" });
  }
};
