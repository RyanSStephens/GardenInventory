const logger = require('./logger');
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');
const Harvest = require('../models/Harvest');

class AnalyticsService {
  constructor() {
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.cache = new Map();
  }

  // Get cached result or compute new one
  async getCachedResult(key, computeFunction, ttl = this.cacheTimeout) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const result = await computeFunction();
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // Plant growth analytics
  async getPlantGrowthAnalytics(timeframe = 'month') {
    const cacheKey = `plant-growth-${timeframe}`;
    
    return this.getCachedResult(cacheKey, async () => {
      const startDate = this.getStartDate(timeframe);
      
      const plants = await Plant.find({
        plantedDate: { $gte: startDate }
      });

      const growthData = {
        totalPlanted: plants.length,
        byCategory: {},
        byStatus: {},
        averageGrowthTime: 0,
        successRate: 0,
        monthlyTrends: []
      };

      // Analyze by category
      plants.forEach(plant => {
        growthData.byCategory[plant.category] = 
          (growthData.byCategory[plant.category] || 0) + 1;
        growthData.byStatus[plant.status] = 
          (growthData.byStatus[plant.status] || 0) + 1;
      });

      // Calculate success rate (plants that have been harvested)
      const harvestedPlants = plants.filter(p => p.status === 'harvested');
      growthData.successRate = plants.length > 0 ? 
        (harvestedPlants.length / plants.length * 100).toFixed(2) : 0;

      // Calculate average growth time for harvested plants
      if (harvestedPlants.length > 0) {
        const totalGrowthTime = harvestedPlants.reduce((sum, plant) => {
          if (plant.harvestDate && plant.plantedDate) {
            return sum + (plant.harvestDate - plant.plantedDate);
          }
          return sum;
        }, 0);
        
        growthData.averageGrowthTime = Math.round(
          totalGrowthTime / harvestedPlants.length / (1000 * 60 * 60 * 24)
        );
      }

      // Monthly trends
      growthData.monthlyTrends = await this.getMonthlyPlantTrends(startDate);

      return growthData;
    });
  }

  // Harvest yield analytics
  async getHarvestAnalytics(timeframe = 'month') {
    const cacheKey = `harvest-analytics-${timeframe}`;
    
    return this.getCachedResult(cacheKey, async () => {
      const startDate = this.getStartDate(timeframe);
      
      const harvests = await Harvest.find({
        harvestDate: { $gte: startDate }
      }).populate('plantId');

      const analytics = {
        totalHarvests: harvests.length,
        totalYield: 0,
        averageYield: 0,
        byCategory: {},
        byQuality: {},
        topProducers: [],
        yieldTrends: [],
        qualityDistribution: {}
      };

      // Calculate totals and categorize
      harvests.forEach(harvest => {
        analytics.totalYield += harvest.quantity || 0;
        
        if (harvest.plantId) {
          const category = harvest.plantId.category;
          if (!analytics.byCategory[category]) {
            analytics.byCategory[category] = { count: 0, yield: 0 };
          }
          analytics.byCategory[category].count++;
          analytics.byCategory[category].yield += harvest.quantity || 0;
        }

        if (harvest.quality) {
          analytics.byQuality[harvest.quality] = 
            (analytics.byQuality[harvest.quality] || 0) + 1;
        }
      });

      analytics.averageYield = harvests.length > 0 ? 
        (analytics.totalYield / harvests.length).toFixed(2) : 0;

      // Find top producing plants
      const plantYields = {};
      harvests.forEach(harvest => {
        if (harvest.plantId) {
          const plantName = `${harvest.plantId.name} (${harvest.plantId.variety || 'Standard'})`;
          plantYields[plantName] = (plantYields[plantName] || 0) + (harvest.quantity || 0);
        }
      });

      analytics.topProducers = Object.entries(plantYields)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, yield]) => ({ name, yield }));

      // Yield trends over time
      analytics.yieldTrends = await this.getYieldTrends(startDate);

      return analytics;
    });
  }

  // Inventory analytics
  async getInventoryAnalytics() {
    const cacheKey = 'inventory-analytics';
    
    return this.getCachedResult(cacheKey, async () => {
      const inventory = await Inventory.find({});
      
      const analytics = {
        totalItems: inventory.length,
        totalValue: 0,
        lowStockItems: 0,
        byCategory: {},
        valueDistribution: {},
        expiringItems: [],
        utilizationRate: {}
      };

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      inventory.forEach(item => {
        // Calculate total value
        if (item.cost && item.quantity) {
          analytics.totalValue += item.cost * item.quantity;
        }

        // Check low stock
        if (item.quantity <= item.minThreshold) {
          analytics.lowStockItems++;
        }

        // Categorize
        if (!analytics.byCategory[item.category]) {
          analytics.byCategory[item.category] = {
            count: 0,
            totalQuantity: 0,
            totalValue: 0
          };
        }
        analytics.byCategory[item.category].count++;
        analytics.byCategory[item.category].totalQuantity += item.quantity;
        if (item.cost) {
          analytics.byCategory[item.category].totalValue += item.cost * item.quantity;
        }

        // Check expiring items
        if (item.expirationDate && item.expirationDate <= thirtyDaysFromNow) {
          analytics.expiringItems.push({
            name: item.name,
            expirationDate: item.expirationDate,
            daysUntilExpiry: Math.ceil((item.expirationDate - now) / (1000 * 60 * 60 * 24))
          });
        }
      });

      // Sort expiring items by expiration date
      analytics.expiringItems.sort((a, b) => a.expirationDate - b.expirationDate);

      return analytics;
    });
  }

  // Seasonal patterns analysis
  async getSeasonalPatterns() {
    const cacheKey = 'seasonal-patterns';
    
    return this.getCachedResult(cacheKey, async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const plants = await Plant.find({
        plantedDate: { $gte: oneYearAgo }
      });

      const harvests = await Harvest.find({
        harvestDate: { $gte: oneYearAgo }
      }).populate('plantId');

      const patterns = {
        plantingByMonth: {},
        harvestingByMonth: {},
        categorySeasonality: {},
        recommendations: []
      };

      // Analyze planting patterns
      plants.forEach(plant => {
        const month = plant.plantedDate.getMonth();
        const monthName = this.getMonthName(month);
        
        if (!patterns.plantingByMonth[monthName]) {
          patterns.plantingByMonth[monthName] = {};
        }
        patterns.plantingByMonth[monthName][plant.category] = 
          (patterns.plantingByMonth[monthName][plant.category] || 0) + 1;
      });

      // Analyze harvesting patterns
      harvests.forEach(harvest => {
        if (harvest.plantId) {
          const month = harvest.harvestDate.getMonth();
          const monthName = this.getMonthName(month);
          const category = harvest.plantId.category;
          
          if (!patterns.harvestingByMonth[monthName]) {
            patterns.harvestingByMonth[monthName] = {};
          }
          patterns.harvestingByMonth[monthName][category] = 
            (patterns.harvestingByMonth[monthName][category] || 0) + 1;
        }
      });

      // Generate recommendations based on patterns
      patterns.recommendations = this.generateSeasonalRecommendations(
        patterns.plantingByMonth,
        patterns.harvestingByMonth
      );

      return patterns;
    });
  }

  // Performance metrics
  async getPerformanceMetrics() {
    const cacheKey = 'performance-metrics';
    
    return this.getCachedResult(cacheKey, async () => {
      const [plants, harvests, inventory] = await Promise.all([
        Plant.find({}),
        Harvest.find({}).populate('plantId'),
        Inventory.find({})
      ]);

      const metrics = {
        productivity: this.calculateProductivityScore(plants, harvests),
        efficiency: this.calculateEfficiencyScore(inventory, harvests),
        sustainability: this.calculateSustainabilityScore(plants, harvests),
        overallScore: 0,
        insights: []
      };

      // Calculate overall score
      metrics.overallScore = (
        (metrics.productivity + metrics.efficiency + metrics.sustainability) / 3
      ).toFixed(2);

      // Generate insights
      metrics.insights = this.generateInsights(metrics, plants, harvests, inventory);

      return metrics;
    });
  }

  // Helper methods
  getStartDate(timeframe) {
    const date = new Date();
    
    switch (timeframe) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    
    return date;
  }

  getMonthName(monthIndex) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  }

  async getMonthlyPlantTrends(startDate) {
    const plants = await Plant.find({
      plantedDate: { $gte: startDate }
    });

    const trends = {};
    plants.forEach(plant => {
      const monthKey = `${plant.plantedDate.getFullYear()}-${plant.plantedDate.getMonth() + 1}`;
      trends[monthKey] = (trends[monthKey] || 0) + 1;
    });

    return Object.entries(trends).map(([month, count]) => ({ month, count }));
  }

  async getYieldTrends(startDate) {
    const harvests = await Harvest.find({
      harvestDate: { $gte: startDate }
    });

    const trends = {};
    harvests.forEach(harvest => {
      const monthKey = `${harvest.harvestDate.getFullYear()}-${harvest.harvestDate.getMonth() + 1}`;
      trends[monthKey] = (trends[monthKey] || 0) + (harvest.quantity || 0);
    });

    return Object.entries(trends).map(([month, yield]) => ({ month, yield }));
  }

  calculateProductivityScore(plants, harvests) {
    if (plants.length === 0) return 0;
    
    const harvestedPlants = plants.filter(p => p.status === 'harvested').length;
    const successRate = (harvestedPlants / plants.length) * 100;
    
    const avgYield = harvests.length > 0 ? 
      harvests.reduce((sum, h) => sum + (h.quantity || 0), 0) / harvests.length : 0;
    
    return Math.min(100, (successRate * 0.6 + Math.min(avgYield * 10, 40))).toFixed(2);
  }

  calculateEfficiencyScore(inventory, harvests) {
    const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold).length;
    const stockEfficiency = inventory.length > 0 ? 
      ((inventory.length - lowStockItems) / inventory.length) * 100 : 100;
    
    const harvestFrequency = harvests.length > 0 ? Math.min(harvests.length * 2, 40) : 0;
    
    return Math.min(100, (stockEfficiency * 0.6 + harvestFrequency)).toFixed(2);
  }

  calculateSustainabilityScore(plants, harvests) {
    const diversityScore = new Set(plants.map(p => p.category)).size * 20;
    const continuousHarvest = harvests.length > 0 ? Math.min(harvests.length, 30) : 0;
    
    return Math.min(100, diversityScore + continuousHarvest).toFixed(2);
  }

  generateSeasonalRecommendations(planting, harvesting) {
    const recommendations = [];
    const currentMonth = this.getMonthName(new Date().getMonth());
    
    // Add basic seasonal recommendations
    recommendations.push({
      type: 'seasonal',
      message: `Based on historical data, ${currentMonth} is optimal for planting certain varieties.`,
      priority: 'medium'
    });

    return recommendations;
  }

  generateInsights(metrics, plants, harvests, inventory) {
    const insights = [];
    
    if (metrics.productivity < 50) {
      insights.push({
        type: 'improvement',
        category: 'productivity',
        message: 'Consider reviewing plant care routines to improve harvest success rate.',
        priority: 'high'
      });
    }

    if (metrics.efficiency < 60) {
      insights.push({
        type: 'improvement',
        category: 'efficiency',
        message: 'Optimize inventory management to reduce low stock situations.',
        priority: 'medium'
      });
    }

    return insights;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    logger.info('Analytics cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

module.exports = new AnalyticsService(); 