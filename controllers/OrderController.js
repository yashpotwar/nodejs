const { sql, pool, poolConnect } = require('../config/db');

const placeOrder = async (req, res) => {
  const { userId, address, items, totalAmount } = req.body;
   let transaction; 

  try {
    await poolConnect;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const orderRequest = new sql.Request(transaction);
    const orderResult = await orderRequest
      .input('userId', sql.Int, userId)
      .input('address', sql.NVarChar(sql.MAX), address)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount)
      .input('status', sql.NVarChar(50), 'Placed')
      .query(`
        INSERT INTO Orders (UserID, OrderDate, TotalAmount, DeliveryAddress, Status)
        OUTPUT INSERTED.ID
        VALUES (@userId, GETDATE(), @totalAmount, @address, @status)
      `);

    const orderId = orderResult.recordset[0].ID;

    for (const item of items) {
      await new sql.Request(transaction)
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.productId)
        .input('variantId', sql.Int, item.variantId)
        .input('quantity', sql.Int, item.quantity)
        .input('size', sql.NVarChar(50), item.size)
        .input('color', sql.NVarChar(50), item.color)
        .input('price', sql.Decimal(10, 2), item.price)
        .query(`
          INSERT INTO OrderItems (OrderID, ProductID, VariantID, Quantity, Size, Color, Price)
          VALUES (@orderId, @productId, @variantId, @quantity, @size, @color, @price)
        `);
    }

    // Clear cart for this user
    await new sql.Request(transaction)
      .input('userId', sql.Int, userId)
      .query(`DELETE FROM Cart WHERE UserID = @userId`);

    await transaction.commit();
    res.status(200).json({ success: true, message: 'Order placed successfully', orderId });

  } catch (err) {
    console.error('❌ Order placement failed:', err);

    try {
      if (transaction) await transaction.rollback(); // rollback on failure
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }

    res.status(500).json({ error: 'Order placement failed' });
  }
};

// In OrderController.js
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;
    const orderRequest = new sql.Request(pool);
    const order = await orderRequest
      .input('id', sql.Int, id)
      .query(`
        SELECT * FROM Orders WHERE ID = @id
      `);

    const itemsRequest = new sql.Request(pool);
    const items = await itemsRequest
      .input('id', sql.Int, id)
      .query(`
        SELECT OI.*, P.Name as ProductName, PV.ImagePath
        FROM OrderItems OI
        JOIN Products P ON OI.ProductID = P.ID
        JOIN ProductVariants PV ON OI.VariantID = PV.ID
        WHERE OI.OrderID = @id
      `);

    res.json({ ...order.recordset[0], Items: items.recordset });
  } catch (err) {
    console.error('Fetch order error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};


module.exports = {
  placeOrder,
  getOrderById,
};

