const responseTime = require('response-time');
const compression = require('compression');

// Response time tracking
const trackResponseTime = responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
});

// Compression middleware
const enableCompression = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// Cache control headers
const setCacheHeaders = (req, res, next) => {
  // Cache static assets for 1 year
  if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  // Cache API responses for 5 minutes
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  // No cache for HTML
  else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
};

// Rate limiting
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// API rate limiter (stricter)
const apiLimiter = createRateLimiter(15 * 60 * 1000, 200); // 200 requests per 15 minutes

// General rate limiter
const generalLimiter = createRateLimiter(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    };
    
    // Log errors and slow requests
    if (res.statusCode >= 400 || duration > 1000) {
      console.warn('Slow/Error Request:', logData);
    }
  });
  
  next();
};

module.exports = {
  trackResponseTime,
  enableCompression,
  setCacheHeaders,
  apiLimiter,
  generalLimiter,
  requestLogger
}; 