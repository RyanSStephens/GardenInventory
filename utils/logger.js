const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = this.logLevels[process.env.LOG_LEVEL] || this.logLevels.INFO;
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      pid: process.pid,
      ...meta
    };
    return JSON.stringify(logEntry) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content);
  }

  shouldLog(level) {
    return this.logLevels[level] <= this.currentLevel;
  }

  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      const formatted = this.formatMessage('ERROR', message, meta);
      console.error(formatted.trim());
      this.writeToFile('error.log', formatted);
      this.writeToFile('combined.log', formatted);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      const formatted = this.formatMessage('WARN', message, meta);
      console.warn(formatted.trim());
      this.writeToFile('combined.log', formatted);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      const formatted = this.formatMessage('INFO', message, meta);
      console.log(formatted.trim());
      this.writeToFile('combined.log', formatted);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      const formatted = this.formatMessage('DEBUG', message, meta);
      console.log(formatted.trim());
      this.writeToFile('debug.log', formatted);
      this.writeToFile('combined.log', formatted);
    }
  }

  // HTTP request logging
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null
    };

    if (res.statusCode >= 500) {
      this.error('HTTP 5xx Error', logData);
    } else if (res.statusCode >= 400) {
      this.warn('HTTP 4xx Error', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // Database operation logging
  logDatabase(operation, collection, query = {}, result = {}) {
    this.debug('Database Operation', {
      operation,
      collection,
      query: JSON.stringify(query),
      resultCount: result.length || (result.n !== undefined ? result.n : 'N/A'),
      executionTime: result.executionTime || 'N/A'
    });
  }

  // Performance monitoring
  logPerformance(metric, value, unit = 'ms') {
    this.info('Performance Metric', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  // Security events
  logSecurity(event, details = {}) {
    this.warn('Security Event', {
      event,
      ...details,
      severity: 'HIGH'
    });
  }
}

module.exports = new Logger(); 