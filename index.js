require('dotenv').config();

const path = require('path'); // ✅ Add this at the top
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cartRoutes = require('./routes/cart.routes');
const categoryRoutes = require('./routes/category.routes'); // 👈 Add this
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const deletedLogsRoutes = require('./routes/deletedLogsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/order.routes');
const app = express();
const PORT = 5000;

// ✅ Proper CORS Setup for frontend at localhost:3000
app.use(cors({
  origin: 'https://ycart.coreedgetechnology.com',
  credentials: true // VERY IMPORTANT: allows cookies/sessions to be sent
}));

app.use(bodyParser.json());

// ✅ Session Setup (for authentication)
app.use(session({
  secret: 'mysecretkey123', // use your secret key here
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,     // true only with HTTPS (in production)
    sameSite: 'lax'    // prevents CSRF while allowing cross-origin requests
  }
}));

// // Serve React static files (production build)
// app.use(express.static(path.join(__dirname, 'client', 'build')));

// // Catch-all route for React frontend
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard-metrics', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes); // 👈 Add this line
app.use('/uploads', express.static('uploads'));
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/deleted-logs', deletedLogsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/products', reviewRoutes);
app.use('/api/orders', orderRoutes);
// app.use('/api', orderRoutes);

// ✅ Start server


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});