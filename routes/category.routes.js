const express = require('express');
const router = express.Router();
const { getCategories, addCategory } = require('../controllers/categoryController');

router.get('/', getCategories);
router.post('/', addCategory);

module.exports = router;
