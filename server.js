const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import monitoring and logging
const logger = require('./utils/logger');
const { requestMetrics, errorTracking } = require('./middleware/monitoring');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add monitoring middleware
app.use(requestMetrics);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garden_inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import routes
const plantRoutes = require('./routes/plants');
const inventoryRoutes = require('./routes/inventory');
const harvestRoutes = require('./routes/harvests');
const dashboardRoutes = require('./routes/dashboard');
const monitoringRoutes = require('./routes/monitoring');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/plants', plantRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/harvests', harvestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error handling middleware (must be last)
app.use(errorTracking);

app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`Garden Inventory server running on port ${PORT}`);
}); 