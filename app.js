require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cartRoutes = require('./routes/cart.routes');
const paymentRoutes = require('./routes/paymentRoutes');
const categoryRoutes = require('./routes/category.routes'); // 👈 Add this
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const deletedLogsRoutes = require('./routes/deletedLogsRoutes');
const bannerRoutes = require('./routes/banner.routes');
const path = require('path'); // ✅ Add this at the top
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/order.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/banners', bannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard-metrics', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes); // 👈 Add this line
app.use('/uploads', express.static('uploads'));
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/deleted-logs', deletedLogsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/products', reviewRoutes);
app.use('/api/orders', orderRoutes);
module.exports = app;
