const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateDaysToHarvest = (plantedDate, expectedHarvestDate) => {
  if (!expectedHarvestDate) return null;
  
  const today = new Date();
  const harvest = new Date(expectedHarvestDate);
  const diffTime = harvest - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getPlantingSeasonRecommendations = (category, location) => {
  // Simple recommendations based on category
  const recommendations = {
    vegetable: {
      spring: ['lettuce', 'spinach', 'peas', 'carrots'],
      summer: ['tomatoes', 'peppers', 'cucumbers', 'beans'],
      fall: ['broccoli', 'cabbage', 'kale', 'radishes']
    },
    herb: {
      spring: ['basil', 'cilantro', 'parsley', 'chives'],
      summer: ['oregano', 'thyme', 'rosemary', 'sage'],
      fall: ['mint', 'dill', 'fennel']
    },
    flower: {
      spring: ['marigolds', 'petunias', 'impatiens'],
      summer: ['sunflowers', 'zinnias', 'cosmos'],
      fall: ['mums', 'asters', 'pansies']
    }
  };

  return recommendations[category] || {};
};

const calculateGrowingDays = (plantedDate) => {
  const today = new Date();
  const planted = new Date(plantedDate);
  const diffTime = today - planted;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getHarvestYieldAnalysis = (harvests) => {
  if (!harvests || harvests.length === 0) {
    return {
      totalYield: 0,
      averageYield: 0,
      bestMonth: null,
      totalHarvests: 0
    };
  }

  const totalYield = harvests.reduce((sum, harvest) => sum + harvest.quantity, 0);
  const averageYield = totalYield / harvests.length;

  // Group harvests by month
  const monthlyYields = {};
  harvests.forEach(harvest => {
    const month = new Date(harvest.harvestDate).getMonth();
    const monthName = new Date(harvest.harvestDate).toLocaleDateString('en-US', { month: 'long' });
    
    if (!monthlyYields[monthName]) {
      monthlyYields[monthName] = 0;
    }
    monthlyYields[monthName] += harvest.quantity;
  });

  const bestMonth = Object.keys(monthlyYields).reduce((a, b) => 
    monthlyYields[a] > monthlyYields[b] ? a : b
  );

  return {
    totalYield: Math.round(totalYield * 100) / 100,
    averageYield: Math.round(averageYield * 100) / 100,
    bestMonth,
    totalHarvests: harvests.length,
    monthlyBreakdown: monthlyYields
  };
};

const getInventoryAlerts = (inventoryItems) => {
  const alerts = [];
  
  inventoryItems.forEach(item => {
    if (item.quantity <= item.minimumStock) {
      alerts.push({
        type: 'low_stock',
        item: item.name,
        current: item.quantity,
        minimum: item.minimumStock,
        message: `${item.name} is running low (${item.quantity} ${item.unit} remaining)`
      });
    }

    if (item.expirationDate) {
      const today = new Date();
      const expiration = new Date(item.expirationDate);
      const daysUntilExpiration = Math.ceil((expiration - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
        alerts.push({
          type: 'expiring_soon',
          item: item.name,
          daysRemaining: daysUntilExpiration,
          message: `${item.name} expires in ${daysUntilExpiration} days`
        });
      } else if (daysUntilExpiration <= 0) {
        alerts.push({
          type: 'expired',
          item: item.name,
          message: `${item.name} has expired`
        });
      }
    }
  });

  return alerts;
};

const generatePlantCareReminders = (plants) => {
  const reminders = [];
  const today = new Date();

  plants.forEach(plant => {
    const plantedDate = new Date(plant.plantedDate);
    const daysSincePlanted = Math.floor((today - plantedDate) / (1000 * 60 * 60 * 24));

    // Watering reminders
    if (plant.wateringSchedule && plant.wateringSchedule.lastWatered) {
      const lastWatered = new Date(plant.wateringSchedule.lastWatered);
      const daysSinceWatered = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
      
      if (daysSinceWatered >= 3) { // Generic 3-day rule
        reminders.push({
          type: 'watering',
          plant: plant.name,
          message: `${plant.name} may need watering (last watered ${daysSinceWatered} days ago)`
        });
      }
    }

    // Harvest reminders
    if (plant.expectedHarvestDate) {
      const harvestDate = new Date(plant.expectedHarvestDate);
      const daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilHarvest <= 7 && daysUntilHarvest > 0) {
        reminders.push({
          type: 'harvest',
          plant: plant.name,
          message: `${plant.name} ready for harvest in ${daysUntilHarvest} days`
        });
      } else if (daysUntilHarvest <= 0) {
        reminders.push({
          type: 'overdue_harvest',
          plant: plant.name,
          message: `${plant.name} is ready for harvest!`
        });
      }
    }
  });

  return reminders;
};

module.exports = {
  formatDate,
  calculateDaysToHarvest,
  getPlantingSeasonRecommendations,
  calculateGrowingDays,
  getHarvestYieldAnalysis,
  getInventoryAlerts,
  generatePlantCareReminders
}; 