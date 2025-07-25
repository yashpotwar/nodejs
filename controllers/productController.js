const { sql, pool, poolConnect } = require('../config/db');

// 🔹 Get all products
const getProducts = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT ID, Name, Price, Discount, Rating, Stock,
             CategoryID, SubCategoryID, ImagePath, Brand,
             Description, Warranty
      FROM Products
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).send('Server error while fetching products');
  }
};

// 🔹 Get product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Products WHERE ID = @id');

    const product = result.recordset[0];
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).send('Server error while fetching product');
  }
};

// 🔹 Create product with variants and size-wise pricing
const createProduct = async (req, res) => {
  try {
    const {
      Name, Price, Discount, Rating, CategoryID, SubCategoryID,
      Brand, Description, Warranty, Offers, DeliveryInfo,
      SellerName, ReturnPolicy, ProductDetails
    } = req.body;

    await poolConnect;
    const files = req.files || {};

    const mainImages = Object.keys(files)
      .filter(key => key.startsWith('MainImages_'))
      .flatMap(key => files[key].map(file => file.filename));

    const mainImage = mainImages[0] || null;
    const extraMainImages = mainImages.slice(1).join(',');

    const variants = [];

    for (let i = 0; i < 10; i++) {
      const color = req.body[`Color_${i}`];
      const sku = req.body[`SKU_${i}`];
      const attributes = req.body[`Attributes_${i}`];
      const sizePriceRaw = req.body[`SizePrice_${i}`];

      let sizePriceArray = [];
      try {
        sizePriceArray = JSON.parse(sizePriceRaw || '[]');
      } catch {
        console.warn(`⚠️ Invalid JSON in SizePrice_${i}`);
      }

      if (!color && !sku && sizePriceArray.length === 0) continue;

      const variantImages = [];
      for (let j = 0; j < 6; j++) {
        const field = `VariantImages_${i}_${j}`;
        if (files[field]) variantImages.push(files[field][0].filename);
      }

      const mainVariantImage = variantImages[0] || null;
      const extraImages = variantImages.slice(1).join(',');

      variants.push({
        Color: color,
        SKU: sku,
        Attributes: attributes,
        Image: mainVariantImage,
        ExtraImages: extraImages,
        SizePrice: sizePriceArray
      });
    }

    const totalStock = variants.reduce((sum, v) => {
      return sum + v.SizePrice.reduce((s, sz) => s + (parseInt(sz.Stock) || 0), 0);
    }, 0);

    // 🔸 Insert Product
    await pool.request()
      .input('Name', sql.VarChar, Name)
      .input('Price', sql.Decimal, Price)
      .input('Discount', sql.Int, Discount || 0)
      .input('Rating', sql.Int, Rating || 0)
      .input('Stock', sql.Int, totalStock)
      .input('CategoryID', sql.Int, CategoryID)
      .input('SubCategoryID', sql.Int, SubCategoryID)
      .input('ImagePath', sql.VarChar, mainImage)
      .input('MainImagePaths', sql.VarChar, extraMainImages)
      .input('Brand', sql.VarChar, Brand)
      .input('Description', sql.VarChar(sql.MAX), Description)
      .input('Warranty', sql.VarChar, Warranty)
      .input('Offers', sql.VarChar(sql.MAX), Offers || '')
      .input('DeliveryInfo', sql.VarChar, DeliveryInfo || '')
      .input('SellerName', sql.VarChar, SellerName || '')
      .input('ReturnPolicy', sql.VarChar, ReturnPolicy || '')
      .input('ProductDetails', sql.VarChar(sql.MAX), ProductDetails || '')
      .query(`
        INSERT INTO Products (
          Name, Price, Discount, Rating, Stock, CategoryID, SubCategoryID,
          ImagePath, MainImagePaths, Brand, Description, Warranty,
          Offers, DeliveryInfo, SellerName, ReturnPolicy, ProductDetails
        ) VALUES (
          @Name, @Price, @Discount, @Rating, @Stock, @CategoryID, @SubCategoryID,
          @ImagePath, @MainImagePaths, @Brand, @Description, @Warranty,
          @Offers, @DeliveryInfo, @SellerName, @ReturnPolicy, @ProductDetails
        )
      `);

    const result = await pool.request().query('SELECT TOP 1 ID FROM Products ORDER BY ID DESC');
    const productId = result.recordset[0].ID;

    // 🔸 Insert Variants + SizePrice
    for (const variant of variants) {
      await pool.request()
        .input('ProductID', sql.Int, productId)
        .input('Color', sql.VarChar, variant.Color)
        .input('Size', sql.VarChar, '') // placeholder
        .input('Stock', sql.Int, 0)
        .input('SKU', sql.VarChar, variant.SKU)
        .input('Attributes', sql.VarChar, variant.Attributes)
        .input('ImagePath', sql.VarChar, variant.Image)
        .input('ExtraImagePaths', sql.VarChar, variant.ExtraImages)
        .input('Price', sql.Decimal(10, 2), 0)
        .query(`
          INSERT INTO ProductVariants 
          (ProductID, Color, Size, Stock, Price, SKU, Attributes, ImagePath, ExtraImagePaths)
          VALUES 
          (@ProductID, @Color, @Size, @Stock, @Price, @SKU, @Attributes, @ImagePath, @ExtraImagePaths)
        `);

      const variantInsertResult = await pool.request()
  .input('ProductID', sql.Int, productId)
  .input('Color', sql.VarChar, variant.Color)
  .input('Size', sql.VarChar, '') // placeholder
  .input('Stock', sql.Int, 0)
  .input('SKU', sql.VarChar, variant.SKU)
  .input('Attributes', sql.VarChar, variant.Attributes)
  .input('ImagePath', sql.VarChar, variant.Image)
  .input('ExtraImagePaths', sql.VarChar, variant.ExtraImages)
  .input('Price', sql.Decimal(10, 2), 0)
  .query(`
    INSERT INTO ProductVariants 
    (ProductID, Color, Size, Stock, Price, SKU, Attributes, ImagePath, ExtraImagePaths)
    OUTPUT INSERTED.ID
    VALUES 
    (@ProductID, @Color, @Size, @Stock, @Price, @SKU, @Attributes, @ImagePath, @ExtraImagePaths)
  `);
const variantId = variantInsertResult.recordset[0].ID;


      for (const sp of variant.SizePrice) {
        await pool.request()
          .input('VariantID', sql.Int, variantId)
          .input('Size', sql.VarChar, sp.Size)
          .input('Price', sql.Decimal(10, 2), sp.Price)
          .input('Discount', sql.Int, sp.Discount || 0)
          .input('Stock', sql.Int, sp.Stock || 0)
          .query(`
            INSERT INTO VariantSizes (VariantID, Size, Price, Discount, Stock)
            VALUES (@VariantID, @Size, @Price, @Discount, @Stock)
          `);
      }
    }

    res.status(201).send('✅ Product with size-wise variants added successfully');
  } catch (error) {
    console.error('❌ Error in createProduct:', error);
    res.status(500).send('Server error while adding product');
  }
};

// 🔹 Delete product + variants + log
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Name FROM Products WHERE ID = @id');

    const product = result.recordset[0];
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await pool.request()
      .input('ProductName', sql.VarChar, product.Name)
      .input('DeletedBy', sql.VarChar, 'admin')
      .input('ProductID', sql.Int, id)
      .query(`
        INSERT INTO DeletedProductLogs (ProductName, DeletedBy, ProductID)
        VALUES (@ProductName, @DeletedBy, @ProductID)
      `);

    await pool.request().input('id', sql.Int, id)
      .query('DELETE FROM ProductVariants WHERE ProductID = @id');

    await pool.request().input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE ID = @id');

    res.status(200).json({ message: '✅ Product and its variants deleted successfully!' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// 🔹 Update product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    Name, Price, Discount, Rating, Stock, CategoryID, SubCategoryID,
    Brand, Description, Warranty, Offers, DeliveryInfo,
    SellerName, ReturnPolicy, ProductDetails
  } = req.body;

  try {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Name', sql.VarChar, Name)
      .input('Price', sql.Decimal, Price)
      .input('Discount', sql.Int, Discount || 0)
      .input('Rating', sql.Int, Rating || 0)
      .input('Stock', sql.Int, Stock)
      .input('CategoryID', sql.Int, CategoryID)
      .input('SubCategoryID', sql.Int, SubCategoryID || null)
      .input('Brand', sql.VarChar, Brand)
      .input('Description', sql.VarChar(sql.MAX), Description)
      .input('Warranty', sql.VarChar, Warranty)
      .input('Offers', sql.VarChar(sql.MAX), Offers || '')
      .input('DeliveryInfo', sql.VarChar, DeliveryInfo || '')
      .input('SellerName', sql.VarChar, SellerName || '')
      .input('ReturnPolicy', sql.VarChar, ReturnPolicy || '')
      .input('ProductDetails', sql.VarChar(sql.MAX), ProductDetails || '')
      .query(`
        UPDATE Products SET
          Name = @Name, Price = @Price, Discount = @Discount, Rating = @Rating,
          Stock = @Stock, CategoryID = @CategoryID, SubCategoryID = @SubCategoryID,
          Brand = @Brand, Description = @Description, Warranty = @Warranty,
          Offers = @Offers, DeliveryInfo = @DeliveryInfo, SellerName = @SellerName,
          ReturnPolicy = @ReturnPolicy, ProductDetails = @ProductDetails
        WHERE ID = @id
      `);

    res.status(200).json({ message: '✅ Product updated' });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// 🔹 Get product with variants
const getProductWithVariants = async (req, res) => {
  try {
    const { id } = req.params;
    await poolConnect;

    const productResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Products WHERE ID = @id');

    const variantResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM ProductVariants WHERE ProductID = @id');

    res.json({
      product: productResult.recordset[0],
      variants: variantResult.recordset
    });
  } catch (err) {
    console.error('❌ Error fetching product with variants:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🔹 Get full product + variants + sizes + reviews
const getProductFullDetails = async (req, res) => {
  try {
    const { id } = req.params;
    await poolConnect;

    const productResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Products WHERE ID = @id');

    const variantResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM ProductVariants WHERE ProductID = @id');

    const reviewResult = await pool.request()
      .input('productId', sql.Int, id)
      .query(`
        SELECT R.Comment, U.Name AS UserName
        FROM ProductReviews R
        JOIN Users U ON U.ID = R.UserID
        WHERE R.ProductID = @productId
      `);

    const variantIds = variantResult.recordset.map(v => v.ID);
    let sizeResult = { recordset: [] };
    if (variantIds.length > 0) {
      sizeResult = await pool.request()
        .query(`SELECT * FROM VariantSizes WHERE VariantID IN (${variantIds.join(',')})`);
    }

    res.json({
      product: productResult.recordset[0],
      variants: variantResult.recordset,
      variantSizes: sizeResult.recordset,
      reviews: reviewResult.recordset
    });
  } catch (err) {
    console.error('❌ Error in getProductFullDetails:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 🔹 Get related products (same subcategory)
const getRelatedProducts = async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;

    const subCatResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT SubCategoryID FROM Products WHERE ID = @id');

    const subCategoryID = subCatResult.recordset[0]?.SubCategoryID;
    if (!subCategoryID) return res.status(404).json({ message: 'SubCategory not found' });

    const relatedResult = await pool.request()
      .input('subCatId', sql.Int, subCategoryID)
      .input('currentId', sql.Int, id)
      .query(`
        SELECT TOP 10 ID, Name, Price, Discount, Rating, ImagePath
        FROM Products 
        WHERE SubCategoryID = @subCatId AND ID != @currentId
      `);

    res.json(relatedResult.recordset);
  } catch (err) {
    console.error('❌ Error fetching related products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductWithVariants,
  getProductFullDetails,
  getRelatedProducts,
};
