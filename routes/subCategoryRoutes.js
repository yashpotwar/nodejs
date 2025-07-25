const express = require('express');
const router = express.Router();
const { getSubCategories } = require('../controllers/subCategoryController');

router.get('/', getSubCategories);

module.exports = router;
