const express = require('express');
const router = express.Router();
const { healthCheck, getMetrics } = require('../middleware/monitoring');
const logger = require('../utils/logger');

// Health check endpoint
router.get('/health', healthCheck);

// Detailed metrics endpoint (protected)
router.get('/metrics', (req, res, next) => {
  // Simple API key authentication for metrics
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = process.env.METRICS_API_KEY || 'dev-metrics-key';
  
  if (apiKey !== validApiKey) {
    logger.logSecurity('Unauthorized metrics access attempt', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  getMetrics(req, res);
});

// System information endpoint
router.get('/system', (req, res) => {
  const systemInfo = {
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
  
  res.json(systemInfo);
});

// Log level management endpoint
router.post('/log-level', (req, res) => {
  const { level } = req.body;
  const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  
  if (!validLevels.includes(level)) {
    return res.status(400).json({ 
      error: 'Invalid log level', 
      validLevels 
    });
  }
  
  process.env.LOG_LEVEL = level;
  logger.info('Log level changed', { newLevel: level });
  
  res.json({ 
    message: 'Log level updated successfully', 
    level 
  });
});

// Recent logs endpoint (last 100 entries)
router.get('/logs', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '../logs/combined.log');
  
  try {
    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [] });
    }
    
    const logContent = fs.readFileSync(logFile, 'utf8');
    const logLines = logContent.trim().split('\n').slice(-100);
    const logs = logLines
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { message: line, level: 'INFO', timestamp: new Date().toISOString() };
        }
      });
    
    res.json({ logs });
  } catch (error) {
    logger.error('Error reading logs', { error: error.message });
    res.status(500).json({ error: 'Unable to read logs' });
  }
});

module.exports = router; 