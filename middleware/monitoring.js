const logger = require('../utils/logger');

// Application metrics storage
const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byStatus: {},
    byRoute: {}
  },
  performance: {
    averageResponseTime: 0,
    slowRequests: 0,
    fastRequests: 0
  },
  errors: {
    total: 0,
    byType: {}
  },
  database: {
    connections: 0,
    queries: 0,
    errors: 0
  }
};

// Request metrics middleware
const requestMetrics = (req, res, next) => {
  const startTime = Date.now();
  
  // Increment request counters
  metrics.requests.total++;
  metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;
  
  // Track route if available
  const route = req.route ? req.route.path : req.path;
  metrics.requests.byRoute[route] = (metrics.requests.byRoute[route] || 0) + 1;

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    // Update status metrics
    metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1;
    
    // Update performance metrics
    updatePerformanceMetrics(responseTime);
    
    // Log request
    logger.logRequest(req, res, responseTime);
    
    // Track slow requests
    if (responseTime > 1000) {
      metrics.performance.slowRequests++;
      logger.warn('Slow Request Detected', {
        url: req.url,
        method: req.method,
        responseTime: `${responseTime}ms`
      });
    } else {
      metrics.performance.fastRequests++;
    }
  });

  next();
};

// Update performance metrics
function updatePerformanceMetrics(responseTime) {
  const currentAvg = metrics.performance.averageResponseTime;
  const totalRequests = metrics.requests.total;
  
  // Calculate new average response time
  metrics.performance.averageResponseTime = 
    ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests;
}

// Error tracking middleware
const errorTracking = (err, req, res, next) => {
  metrics.errors.total++;
  
  const errorType = err.name || 'UnknownError';
  metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
  
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user ? req.user.id : null
  });
  
  next(err);
};

// Health check endpoint data
const healthCheck = (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    metrics: {
      totalRequests: metrics.requests.total,
      averageResponseTime: `${Math.round(metrics.performance.averageResponseTime)}ms`,
      errorRate: metrics.errors.total > 0 ? 
        `${((metrics.errors.total / metrics.requests.total) * 100).toFixed(2)}%` : '0%',
      slowRequestRate: metrics.performance.slowRequests > 0 ?
        `${((metrics.performance.slowRequests / metrics.requests.total) * 100).toFixed(2)}%` : '0%'
    }
  };
  
  // Check if system is under stress
  if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
    health.status = 'warning';
    health.warnings = ['High memory usage detected'];
  }
  
  if (metrics.performance.averageResponseTime > 2000) {
    health.status = 'warning';
    health.warnings = health.warnings || [];
    health.warnings.push('High average response time');
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
};

// Metrics endpoint
const getMetrics = (req, res) => {
  const detailedMetrics = {
    ...metrics,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(detailedMetrics);
};

// Database metrics tracking
const trackDatabaseOperation = (operation, collection, executionTime) => {
  metrics.database.queries++;
  logger.logDatabase(operation, collection, {}, { executionTime });
};

const trackDatabaseError = (error) => {
  metrics.database.errors++;
  logger.error('Database Error', { error: error.message });
};

module.exports = {
  requestMetrics,
  errorTracking,
  healthCheck,
  getMetrics,
  trackDatabaseOperation,
  trackDatabaseError,
  metrics
}; 