const nodemailer = require('nodemailer');
const logger = require('./logger');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.notificationQueue = [];
    this.isProcessingQueue = false;
  }

  createEmailTransporter() {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Email notification templates
  getEmailTemplate(type, data) {
    const templates = {
      lowStock: {
        subject: `🚨 Low Stock Alert: ${data.itemName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Low Stock Alert</h2>
            <p>Your garden inventory item is running low:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Item:</strong> ${data.itemName}<br>
              <strong>Category:</strong> ${data.category}<br>
              <strong>Current Quantity:</strong> ${data.currentQuantity}<br>
              <strong>Minimum Threshold:</strong> ${data.minThreshold}
            </div>
            <p>Consider restocking this item soon to avoid running out.</p>
            <p><em>Garden Inventory System</em></p>
          </div>
        `
      },
      harvestReady: {
        subject: `🌱 Harvest Ready: ${data.plantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #388e3c;">Harvest Ready!</h2>
            <p>Your plant is ready for harvesting:</p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Plant:</strong> ${data.plantName}<br>
              <strong>Variety:</strong> ${data.variety}<br>
              <strong>Planted Date:</strong> ${data.plantedDate}<br>
              <strong>Days Growing:</strong> ${data.daysGrowing}
            </div>
            <p>Don't forget to record your harvest in the system!</p>
            <p><em>Garden Inventory System</em></p>
          </div>
        `
      },
      plantCare: {
        subject: `🌿 Plant Care Reminder: ${data.plantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Plant Care Reminder</h2>
            <p>Your plant needs attention:</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Plant:</strong> ${data.plantName}<br>
              <strong>Care Type:</strong> ${data.careType}<br>
              <strong>Last Care Date:</strong> ${data.lastCareDate}<br>
              <strong>Recommended Action:</strong> ${data.recommendation}
            </div>
            <p>Regular care helps ensure healthy plant growth!</p>
            <p><em>Garden Inventory System</em></p>
          </div>
        `
      },
      systemAlert: {
        subject: `⚠️ System Alert: ${data.alertType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f57c00;">System Alert</h2>
            <p>Garden Inventory System Alert:</p>
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Alert Type:</strong> ${data.alertType}<br>
              <strong>Severity:</strong> ${data.severity}<br>
              <strong>Message:</strong> ${data.message}<br>
              <strong>Timestamp:</strong> ${data.timestamp}
            </div>
            <p>Please check your system for more details.</p>
            <p><em>Garden Inventory System</em></p>
          </div>
        `
      }
    };

    return templates[type] || {
      subject: 'Garden Inventory Notification',
      html: `<p>${data.message}</p>`
    };
  }

  // Add notification to queue
  async queueNotification(type, recipients, data) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      data,
      timestamp: new Date(),
      attempts: 0,
      maxAttempts: 3
    };

    this.notificationQueue.push(notification);
    logger.info('Notification queued', { 
      type, 
      recipients: notification.recipients.length,
      id: notification.id 
    });

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return notification.id;
  }

  // Process notification queue
  async processQueue() {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    logger.info('Processing notification queue', { 
      queueSize: this.notificationQueue.length 
    });

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        await this.sendNotification(notification);
        logger.info('Notification sent successfully', { 
          id: notification.id,
          type: notification.type 
        });
      } catch (error) {
        notification.attempts++;
        
        if (notification.attempts < notification.maxAttempts) {
          // Re-queue for retry
          this.notificationQueue.push(notification);
          logger.warn('Notification failed, retrying', { 
            id: notification.id,
            attempt: notification.attempts,
            error: error.message 
          });
        } else {
          logger.error('Notification failed permanently', { 
            id: notification.id,
            error: error.message 
          });
        }
      }

      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.isProcessingQueue = false;
    logger.info('Notification queue processing complete');
  }

  // Send individual notification
  async sendNotification(notification) {
    const template = this.getEmailTemplate(notification.type, notification.data);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'garden-inventory@example.com',
      to: notification.recipients.join(','),
      subject: template.subject,
      html: template.html
    };

    if (this.emailTransporter && process.env.SMTP_USER) {
      await this.emailTransporter.sendMail(mailOptions);
    } else {
      // Log notification instead of sending (for development)
      logger.info('Email notification (dev mode)', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        type: notification.type
      });
    }
  }

  // Specific notification methods
  async notifyLowStock(recipients, itemData) {
    return this.queueNotification('lowStock', recipients, itemData);
  }

  async notifyHarvestReady(recipients, plantData) {
    return this.queueNotification('harvestReady', recipients, plantData);
  }

  async notifyPlantCare(recipients, careData) {
    return this.queueNotification('plantCare', recipients, careData);
  }

  async notifySystemAlert(recipients, alertData) {
    return this.queueNotification('systemAlert', recipients, alertData);
  }

  // Get notification queue status
  getQueueStatus() {
    return {
      queueSize: this.notificationQueue.length,
      isProcessing: this.isProcessingQueue,
      emailConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
    };
  }

  // Test notification system
  async testNotification(recipient) {
    const testData = {
      message: 'This is a test notification from your Garden Inventory system.',
      timestamp: new Date().toISOString(),
      alertType: 'Test',
      severity: 'INFO'
    };

    return this.queueNotification('systemAlert', recipient, testData);
  }
}

module.exports = new NotificationService(); 