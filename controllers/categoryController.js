const { sql, pool, poolConnect } = require('../config/db');


// Fetch all categories
const getCategories = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT ID, Name FROM Categories');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send('Error fetching categories');
  }
};

// Add new category
const addCategory = async (req, res) => {
  const { Name } = req.body;
  try {
    //const pool = await poolPromise.connect();
   await poolConnect;
    await pool.request()
      .input('Name', sql.VarChar, Name)
      .query('INSERT INTO Categories (Name) VALUES (@Name)');
    res.status(201).send('Category added');
  } catch (err) {
    res.status(500).send('Error adding category');
  }
};

module.exports = { getCategories, addCategory };
