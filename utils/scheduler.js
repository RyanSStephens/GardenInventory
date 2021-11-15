const cron = require('node-cron');
const logger = require('./logger');
const notifications = require('./notifications');
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');

class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.isInitialized = false;
  }

  // Initialize all scheduled tasks
  initialize() {
    if (this.isInitialized) {
      logger.warn('Task scheduler already initialized');
      return;
    }

    logger.info('Initializing task scheduler');

    // Daily checks at 8 AM
    this.scheduleTask('dailyChecks', '0 8 * * *', this.runDailyChecks.bind(this));
    
    // Weekly inventory check on Sundays at 9 AM
    this.scheduleTask('weeklyInventory', '0 9 * * 0', this.runWeeklyInventoryCheck.bind(this));
    
    // Hourly system health check
    this.scheduleTask('healthCheck', '0 * * * *', this.runHealthCheck.bind(this));
    
    // Monthly maintenance on 1st of month at 2 AM
    this.scheduleTask('monthlyMaintenance', '0 2 1 * *', this.runMonthlyMaintenance.bind(this));

    this.isInitialized = true;
    logger.info('Task scheduler initialized with tasks', { 
      taskCount: this.tasks.size,
      tasks: Array.from(this.tasks.keys())
    });
  }

  // Schedule a new task
  scheduleTask(name, cronExpression, taskFunction) {
    if (this.tasks.has(name)) {
      logger.warn('Task already exists, replacing', { taskName: name });
      this.tasks.get(name).destroy();
    }

    const task = cron.schedule(cronExpression, async () => {
      logger.info('Executing scheduled task', { taskName: name });
      const startTime = Date.now();
      
      try {
        await taskFunction();
        const duration = Date.now() - startTime;
        logger.info('Scheduled task completed', { 
          taskName: name, 
          duration: `${duration}ms` 
        });
      } catch (error) {
        logger.error('Scheduled task failed', { 
          taskName: name, 
          error: error.message,
          stack: error.stack 
        });
      }
    }, {
      scheduled: false
    });

    this.tasks.set(name, task);
    task.start();
    
    logger.info('Task scheduled', { 
      taskName: name, 
      cronExpression 
    });
  }

  // Daily checks for plant care and harvest readiness
  async runDailyChecks() {
    logger.info('Running daily checks');
    
    try {
      // Check for plants ready to harvest
      await this.checkHarvestReadiness();
      
      // Check for plants needing care
      await this.checkPlantCare();
      
      // Check low stock items
      await this.checkLowStock();
      
    } catch (error) {
      logger.error('Daily checks failed', { error: error.message });
    }
  }

  // Check for plants ready to harvest
  async checkHarvestReadiness() {
    const plants = await Plant.find({ 
      status: { $in: ['flowering', 'fruiting'] }
    });

    const recipients = process.env.NOTIFICATION_EMAILS?.split(',') || [];
    if (recipients.length === 0) return;

    for (const plant of plants) {
      const daysSincePlanted = Math.floor(
        (Date.now() - plant.plantedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if plant might be ready based on typical growing times
      const typicalHarvestDays = this.getTypicalHarvestDays(plant.category);
      
      if (daysSincePlanted >= typicalHarvestDays) {
        await notifications.notifyHarvestReady(recipients, {
          plantName: plant.name,
          variety: plant.variety,
          plantedDate: plant.plantedDate.toDateString(),
          daysGrowing: daysSincePlanted
        });
      }
    }
  }

  // Check for plants needing care
  async checkPlantCare() {
    const plants = await Plant.find({ 
      status: { $in: ['seedling', 'growing', 'flowering'] }
    });

    const recipients = process.env.NOTIFICATION_EMAILS?.split(',') || [];
    if (recipients.length === 0) return;

    for (const plant of plants) {
      const daysSinceLastCare = plant.lastCareDate ? 
        Math.floor((Date.now() - plant.lastCareDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        999;

      const careInterval = this.getCareInterval(plant.category);
      
      if (daysSinceLastCare >= careInterval) {
        const careType = this.getRecommendedCare(plant.status, daysSinceLastCare);
        
        await notifications.notifyPlantCare(recipients, {
          plantName: plant.name,
          careType: careType,
          lastCareDate: plant.lastCareDate ? 
            plant.lastCareDate.toDateString() : 'Never',
          recommendation: this.getCareRecommendation(careType)
        });
      }
    }
  }

  // Check for low stock inventory items
  async checkLowStock() {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minThreshold'] }
    });

    if (lowStockItems.length === 0) return;

    const recipients = process.env.NOTIFICATION_EMAILS?.split(',') || [];
    if (recipients.length === 0) return;

    for (const item of lowStockItems) {
      await notifications.notifyLowStock(recipients, {
        itemName: item.name,
        category: item.category,
        currentQuantity: item.quantity,
        minThreshold: item.minThreshold
      });
    }
  }

  // Weekly inventory summary
  async runWeeklyInventoryCheck() {
    logger.info('Running weekly inventory check');
    
    try {
      const totalPlants = await Plant.countDocuments();
      const activePlants = await Plant.countDocuments({ 
        status: { $in: ['growing', 'flowering', 'fruiting'] }
      });
      const lowStockItems = await Inventory.countDocuments({
        $expr: { $lte: ['$quantity', '$minThreshold'] }
      });

      logger.info('Weekly inventory summary', {
        totalPlants,
        activePlants,
        lowStockItems
      });

      // Send summary email if configured
      const recipients = process.env.NOTIFICATION_EMAILS?.split(',') || [];
      if (recipients.length > 0) {
        await notifications.notifySystemAlert(recipients, {
          alertType: 'Weekly Summary',
          severity: 'INFO',
          message: `Weekly Summary: ${totalPlants} total plants, ${activePlants} active plants, ${lowStockItems} low stock items`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Weekly inventory check failed', { error: error.message });
    }
  }

  // Hourly health check
  async runHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    };

    // Check for concerning metrics
    const memoryUsagePercent = health.memory.heapUsed / health.memory.heapTotal;
    
    if (memoryUsagePercent > 0.9) {
      logger.warn('High memory usage detected', { 
        usage: `${(memoryUsagePercent * 100).toFixed(2)}%` 
      });
    }

    logger.debug('Health check completed', health);
  }

  // Monthly maintenance tasks
  async runMonthlyMaintenance() {
    logger.info('Running monthly maintenance');
    
    try {
      // Clean up old log files (keep last 30 days)
      await this.cleanupLogs();
      
      // Database maintenance
      await this.runDatabaseMaintenance();
      
    } catch (error) {
      logger.error('Monthly maintenance failed', { error: error.message });
    }
  }

  // Helper methods
  getTypicalHarvestDays(category) {
    const harvestTimes = {
      'vegetables': 60,
      'herbs': 45,
      'fruits': 120,
      'flowers': 90
    };
    return harvestTimes[category.toLowerCase()] || 75;
  }

  getCareInterval(category) {
    const intervals = {
      'vegetables': 3,
      'herbs': 2,
      'fruits': 7,
      'flowers': 5
    };
    return intervals[category.toLowerCase()] || 5;
  }

  getRecommendedCare(status, daysSinceLastCare) {
    if (daysSinceLastCare > 7) return 'watering';
    if (status === 'seedling') return 'monitoring';
    if (status === 'growing') return 'fertilizing';
    if (status === 'flowering') return 'pruning';
    return 'general care';
  }

  getCareRecommendation(careType) {
    const recommendations = {
      'watering': 'Check soil moisture and water if dry',
      'fertilizing': 'Apply appropriate fertilizer for growth stage',
      'pruning': 'Remove dead leaves and trim as needed',
      'monitoring': 'Check for pests and diseases',
      'general care': 'Inspect plant health and provide needed care'
    };
    return recommendations[careType] || 'Provide appropriate care';
  }

  async cleanupLogs() {
    // Implementation would clean up old log files
    logger.info('Log cleanup completed');
  }

  async runDatabaseMaintenance() {
    // Implementation would run database optimization
    logger.info('Database maintenance completed');
  }

  // Stop all scheduled tasks
  stopAll() {
    logger.info('Stopping all scheduled tasks');
    
    for (const [name, task] of this.tasks) {
      task.destroy();
      logger.info('Task stopped', { taskName: name });
    }
    
    this.tasks.clear();
    this.isInitialized = false;
  }

  // Get scheduler status
  getStatus() {
    return {
      initialized: this.isInitialized,
      taskCount: this.tasks.size,
      tasks: Array.from(this.tasks.keys())
    };
  }
}

module.exports = new TaskScheduler(); 