const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');
const Harvest = require('../models/Harvest');
const { getHarvestYieldAnalysis, getInventoryAlerts, generatePlantCareReminders } = require('../utils/helpers');

// GET dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const [plants, inventory, harvests] = await Promise.all([
      Plant.find(),
      Inventory.find(),
      Harvest.find().populate('plant', 'name category')
    ]);

    // Basic counts
    const totalPlants = plants.length;
    const activePlants = plants.filter(p => ['growing', 'flowering', 'fruiting'].includes(p.status)).length;
    const totalInventoryItems = inventory.length;

    // Monthly harvest count
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyHarvests = harvests.filter(h => {
      const harvestDate = new Date(h.harvestDate);
      return harvestDate.getMonth() === currentMonth && harvestDate.getFullYear() === currentYear;
    }).length;

    // Harvest yield analysis
    const yieldAnalysis = getHarvestYieldAnalysis(harvests);

    // Inventory alerts
    const inventoryAlerts = getInventoryAlerts(inventory);

    // Plant care reminders
    const careReminders = generatePlantCareReminders(plants);

    // Plants by category
    const plantsByCategory = plants.reduce((acc, plant) => {
      acc[plant.category] = (acc[plant.category] || 0) + 1;
      return acc;
    }, {});

    // Plants by status
    const plantsByStatus = plants.reduce((acc, plant) => {
      acc[plant.status] = (acc[plant.status] || 0) + 1;
      return acc;
    }, {});

    // Recent harvests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHarvests = harvests.filter(h => new Date(h.harvestDate) >= thirtyDaysAgo);

    res.json({
      summary: {
        totalPlants,
        activePlants,
        totalInventoryItems,
        monthlyHarvests
      },
      yieldAnalysis,
      alerts: inventoryAlerts,
      reminders: careReminders,
      analytics: {
        plantsByCategory,
        plantsByStatus,
        recentHarvestsCount: recentHarvests.length,
        totalYieldThisMonth: recentHarvests.reduce((sum, h) => sum + h.quantity, 0)
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET monthly harvest trends
router.get('/harvest-trends', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const harvests = await Harvest.find()
      .populate('plant', 'name category')
      .sort({ harvestDate: -1 });

    // Group harvests by month
    const monthlyData = {};
    const categoryData = {};

    harvests.forEach(harvest => {
      const date = new Date(harvest.harvestDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const category = harvest.plant ? harvest.plant.category : 'unknown';

      // Monthly totals
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          totalQuantity: 0,
          harvestCount: 0,
          categories: {}
        };
      }
      monthlyData[monthYear].totalQuantity += harvest.quantity;
      monthlyData[monthYear].harvestCount += 1;

      // Category breakdown
      if (!monthlyData[monthYear].categories[category]) {
        monthlyData[monthYear].categories[category] = 0;
      }
      monthlyData[monthYear].categories[category] += harvest.quantity;

      // Overall category data
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += harvest.quantity;
    });

    // Convert to array and limit to requested months
    const trends = Object.values(monthlyData)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, parseInt(months));

    res.json({
      trends: trends.reverse(), // Show oldest to newest
      categoryTotals: categoryData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET plant growth timeline
router.get('/growth-timeline', async (req, res) => {
  try {
    const plants = await Plant.find().sort({ plantedDate: 1 });
    
    const timeline = plants.map(plant => {
      const plantedDate = new Date(plant.plantedDate);
      const today = new Date();
      const daysGrowing = Math.floor((today - plantedDate) / (1000 * 60 * 60 * 24));
      
      let expectedDaysToHarvest = null;
      if (plant.expectedHarvestDate) {
        const harvestDate = new Date(plant.expectedHarvestDate);
        expectedDaysToHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      }

      return {
        id: plant._id,
        name: plant.name,
        variety: plant.variety,
        category: plant.category,
        status: plant.status,
        plantedDate: plant.plantedDate,
        daysGrowing,
        expectedDaysToHarvest,
        location: plant.location
      };
    });

    res.json({ timeline });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET inventory value analysis
router.get('/inventory-value', async (req, res) => {
  try {
    const inventory = await Inventory.find();
    
    const analysis = {
      totalValue: 0,
      valueByCategory: {},
      itemCount: inventory.length,
      lowStockItems: 0,
      expiringSoonItems: 0
    };

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    inventory.forEach(item => {
      const itemValue = (item.cost || 0) * item.quantity;
      analysis.totalValue += itemValue;

      // Value by category
      if (!analysis.valueByCategory[item.category]) {
        analysis.valueByCategory[item.category] = 0;
      }
      analysis.valueByCategory[item.category] += itemValue;

      // Low stock check
      if (item.quantity <= item.minimumStock) {
        analysis.lowStockItems += 1;
      }

      // Expiration check
      if (item.expirationDate && new Date(item.expirationDate) <= thirtyDaysFromNow) {
        analysis.expiringSoonItems += 1;
      }
    });

    analysis.totalValue = Math.round(analysis.totalValue * 100) / 100;

    res.json({ analysis });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 