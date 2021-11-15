const express = require('express');
const router = express.Router();
const notifications = require('../utils/notifications');
const scheduler = require('../utils/scheduler');
const logger = require('../utils/logger');

// Get notification queue status
router.get('/status', (req, res) => {
  const queueStatus = notifications.getQueueStatus();
  const schedulerStatus = scheduler.getStatus();
  
  res.json({
    notifications: queueStatus,
    scheduler: schedulerStatus,
    timestamp: new Date().toISOString()
  });
});

// Send test notification
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    const notificationId = await notifications.testNotification(email);
    
    logger.info('Test notification sent', { email, notificationId });
    
    res.json({ 
      message: 'Test notification queued successfully',
      notificationId,
      email
    });
  } catch (error) {
    logger.error('Test notification failed', { error: error.message });
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Manual trigger for scheduled tasks
router.post('/trigger/:taskName', async (req, res) => {
  const { taskName } = req.params;
  
  try {
    switch (taskName) {
      case 'dailyChecks':
        await scheduler.runDailyChecks();
        break;
      case 'weeklyInventory':
        await scheduler.runWeeklyInventoryCheck();
        break;
      case 'healthCheck':
        await scheduler.runHealthCheck();
        break;
      case 'monthlyMaintenance':
        await scheduler.runMonthlyMaintenance();
        break;
      default:
        return res.status(400).json({ error: 'Invalid task name' });
    }
    
    logger.info('Manual task trigger completed', { taskName });
    res.json({ message: `Task ${taskName} executed successfully` });
  } catch (error) {
    logger.error('Manual task trigger failed', { taskName, error: error.message });
    res.status(500).json({ error: `Failed to execute task ${taskName}` });
  }
});

// Get notification history (from logs)
router.get('/history', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '../logs/combined.log');
  
  try {
    if (!fs.existsSync(logFile)) {
      return res.json({ notifications: [] });
    }
    
    const logContent = fs.readFileSync(logFile, 'utf8');
    const logLines = logContent.trim().split('\n');
    
    const notificationLogs = logLines
      .filter(line => line.includes('Notification'))
      .slice(-50) // Last 50 notification events
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter(log => log !== null);
    
    res.json({ notifications: notificationLogs });
  } catch (error) {
    logger.error('Error reading notification history', { error: error.message });
    res.status(500).json({ error: 'Unable to read notification history' });
  }
});

// Update notification settings
router.post('/settings', (req, res) => {
  const { emails, enableDaily, enableWeekly, enableAlerts } = req.body;
  
  // In a real application, this would save to database
  // For now, we'll just validate and return success
  
  if (emails && Array.isArray(emails)) {
    const validEmails = emails.filter(email => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    
    if (validEmails.length !== emails.length) {
      return res.status(400).json({ 
        error: 'Invalid email addresses provided' 
      });
    }
  }
  
  logger.info('Notification settings updated', { 
    emailCount: emails?.length || 0,
    enableDaily,
    enableWeekly,
    enableAlerts
  });
  
  res.json({ 
    message: 'Notification settings updated successfully',
    settings: {
      emails: emails || [],
      enableDaily: enableDaily !== false,
      enableWeekly: enableWeekly !== false,
      enableAlerts: enableAlerts !== false
    }
  });
});

module.exports = router; 