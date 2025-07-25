// controllers/reviewController.js
const { sql, pool, poolConnect } = require('../config/db');

// Submit Review
const submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, comment, rating = 5, userName } = req.body;
    await poolConnect;
    await pool.request()
      .input('ProductID', sql.Int, productId)
      .input('UserID', sql.Int, userId)
      .input('UserName', sql.VarChar, userName || 'Anonymous')
      .input('Rating', sql.Int, rating)
      .input('Comment', sql.NVarChar, comment)
      .query(`INSERT INTO ProductReviews (ProductID, UserID, UserName, Rating, Comment) 
              VALUES (@ProductID, @UserID, @UserName, @Rating, @Comment)`);

    res.status(201).json({ message: 'Review submitted for approval' });
  } catch (err) {
    console.error('❌ Error submitting review:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Approved Reviews
const getApprovedReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    await poolConnect;
    const result = await pool.request()
      .input('ProductID', sql.Int, productId)
      .query(`SELECT UserName, Comment, Rating FROM ProductReviews 
              WHERE ProductID = @ProductID AND Status = 'approved' 
              ORDER BY CreatedAt DESC`);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin - Get Pending Reviews
const getPendingReviews = async (req, res) => {
  const result = await pool.request().query(`
    SELECT r.ID, r.UserID, r.ProductID, r.Rating, r.Comment, u.Name AS UserName
    FROM ProductReviews r
    JOIN Users u ON r.UserID = u.ID
    WHERE r.IsApproved = 0
  `);
  res.json(result.recordset);
};

const approveReview = async (req, res) => {
  const { id } = req.params;
  await pool.request()
    .input('id', sql.Int, id)
    .query('UPDATE ProductReviews SET IsApproved = 1 WHERE ID = @id');
  res.sendStatus(200);
};

const rejectReview = async (req, res) => {
  const { id } = req.params;
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM ProductReviews WHERE ID = @id');
  res.sendStatus(200);
};


module.exports = {
  submitReview,
  getApprovedReviews,
  getPendingReviews,
  approveReview,
  rejectReview
};
