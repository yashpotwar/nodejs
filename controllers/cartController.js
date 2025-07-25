const { sql, pool, poolConnect } = require('../config/db');

// ✅ Add to Cart (with category, subcategory, image)
const addToCart = async (req, res) => {
  const { userId, productId, quantity, selectedSize, selectedColor } = req.body;

  try {
    await poolConnect;

    const productResult = await pool.request()
      .input("productId", sql.Int, productId)
      .query(`
        SELECT 
          p.Name, p.Price, p.ImagePath,
          c.Name AS CategoryName,
          s.Name AS SubCategoryName
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.ID
        LEFT JOIN SubCategories s ON p.SubCategoryID = s.ID
        WHERE p.ID = @productId
      `);

    const product = productResult.recordset[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const check = await pool.request()
      .input("userId", sql.Int, userId)
      .input("productId", sql.Int, productId)
      .input("size", sql.VarChar, selectedSize)
      .input("color", sql.VarChar, selectedColor)
      .query(`
        SELECT * FROM Cart 
        WHERE userId = @userId AND productId = @productId AND size = @size AND color = @color
      `);

    if (check.recordset.length > 0) {
      await pool.request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("size", sql.VarChar, selectedSize)
        .input("color", sql.VarChar, selectedColor)
        .input("quantity", sql.Int, quantity)
        .query(`
          UPDATE Cart 
          SET quantity = quantity + @quantity 
          WHERE userId = @userId AND productId = @productId AND size = @size AND color = @color
        `);
    } else {
      await pool.request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .input("size", sql.VarChar, selectedSize)
        .input("color", sql.VarChar, selectedColor)
        .input("categoryName", sql.VarChar, product.CategoryName || '')
        .input("subCategoryName", sql.VarChar, product.SubCategoryName || 'Uncategorized')
        .input("imagePath", sql.VarChar, product.ImagePath || '')
        .query(`
          INSERT INTO Cart 
          (userId, productId, quantity, size, color, categoryName, subCategoryName, imagePath)
          VALUES 
          (@userId, @productId, @quantity, @size, @color, @categoryName, @subCategoryName, @imagePath)
        `);
    }

    res.json({ message: 'Item added to cart' });
  } catch (err) {
    console.error('❌ Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

// ✅ Get Cart Items
const getCartByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT 
          c.id,
          c.quantity,
          c.size,
          c.color,
          p.Name AS productName,
          p.Price AS price,
          c.categoryName,
          c.subCategoryName,
          ISNULL(v.ImagePath, p.ImagePath) AS imagePath
        FROM Cart c
        JOIN Products p ON c.productId = p.ID
        LEFT JOIN ProductVariants v 
          ON v.ProductID = c.productId 
         AND v.Color = c.color 
         AND CHARINDEX(c.size, v.Size) > 0
        WHERE c.userId = @userId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching cart data:", err);
    res.status(500).json({ error: 'Error fetching cart data' });
  }
};

// ✅ Update Quantity
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await poolConnect;
    await pool.request()
      .input("id", sql.Int, id)
      .input("quantity", sql.Int, quantity)
      .query(`UPDATE Cart SET quantity = @quantity WHERE id = @id`);

    res.json({ message: 'Quantity updated' });
  } catch (err) {
    console.error("❌ Error updating quantity:", err);
    res.status(500).json({ error: 'Error updating quantity' });
  }
};

// ✅ Delete from Cart
const deleteCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    await poolConnect;

    const cartRes = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT c.productId, p.Name FROM Cart c JOIN Products p ON c.productId = p.ID WHERE c.id = @id`);

    const item = cartRes.recordset[0];
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    await pool.request()
      .input("ProductName", sql.VarChar, item.Name)
      .input("DeletedBy", sql.VarChar, 'cart')
      .input("ProductID", sql.Int, item.productId)
      .query(`
        INSERT INTO DeletedProductLogs (ProductName, DeletedBy, ProductID)
        VALUES (@ProductName, @DeletedBy, @ProductID)
      `);

    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Cart WHERE id = @id`);

    res.json({ message: 'Item deleted and logged' });
  } catch (err) {
    console.error("❌ SQL Error:", err);
    res.status(500).json({ error: 'Error deleting cart item' });
  }
};

module.exports = {
  addToCart,
  getCartByUser,
  updateCartItem,
  deleteCartItem
};
