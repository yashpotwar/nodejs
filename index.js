require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();


// ✅ Middlewares
// app.use(cors({
//   origin: 'https://ycart.coreedgetechnology.com',
//   credentials: true
// }));
const allowedOrigins = ['https://ycart.coreedgetechnology.com', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'mysecretkey123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // ⚠️ If using HTTPS,set this to true
    sameSite: 'lax'
  }
}));

// ✅ Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cartRoutes = require('./routes/cart.routes');
const categoryRoutes = require('./routes/category.routes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const deletedLogsRoutes = require('./routes/deletedLogsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/order.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // main product routes
app.use('/api/products', reviewRoutes);  // review routes
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard-metrics', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/deleted-logs', deletedLogsRoutes);
app.use('/api/orders', orderRoutes);

// ✅ Serve uploads (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ Serve React Static Files
app.use(express.static(path.join(__dirname, 'client', 'build')));

// ✅ Catch-All Route (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
