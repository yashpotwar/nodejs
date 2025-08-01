const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");

// ✅ GET Address by userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT TOP 1 * FROM UserAddresses WHERE UserID = @UserID");

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.json(null); // No address yet
    }
  } catch (err) {
    console.error("GET address error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST (Insert or Update) Address
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;

  if (!address) return res.status(400).json({ error: "Address is required" });

  try {
    const pool = await sql.connect(dbConfig);

    const check = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query("SELECT * FROM UserAddresses WHERE UserID = @UserID");

    if (check.recordset.length > 0) {
      // Update
      await pool
        .request()
        .input("UserID", sql.Int, userId)
        .input("Address", sql.NVarChar, address)
        .query("UPDATE UserAddresses SET Address = @Address, UpdatedAt = GETDATE() WHERE UserID = @UserID");
    } else {
      // Insert
      await pool
        .request()
        .input("UserID", sql.Int, userId)
        .input("Address", sql.NVarChar, address)
        .query("INSERT INTO UserAddresses (UserID, Address) VALUES (@UserID, @Address)");
    }

    res.json({ message: "Address saved" });
  } catch (err) {
    console.error("POST address error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
