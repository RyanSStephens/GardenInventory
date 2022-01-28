const express = require('express');
const router = express.Router();
const backupService = require('../utils/backup');
const logger = require('../utils/logger');

// Get backup status and history
router.get('/status', async (req, res) => {
  try {
    const status = await backupService.getBackupStatus();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get backup status', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve backup status' });
  }
});

// Create full system backup
router.post('/create', async (req, res) => {
  try {
    logger.info('Manual backup requested', { 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const result = await backupService.createFullBackup();
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      ...result
    });

  } catch (error) {
    logger.error('Manual backup failed', { error: error.message });
    res.status(500).json({ 
      success: false,
      error: 'Backup creation failed',
      message: error.message
    });
  }
});

// Export data in various formats
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { collections } = req.query;
    
    const collectionsArray = collections ? 
      collections.split(',').map(c => c.trim()) : 
      ['plants', 'inventory', 'harvests'];

    if (!['json', 'csv'].includes(format.toLowerCase())) {
      return res.status(400).json({ 
        error: 'Invalid format. Supported formats: json, csv' 
      });
    }

    logger.info('Data export requested', { 
      format, 
      collections: collectionsArray,
      ip: req.ip
    });

    const exportData = await backupService.exportData(format, collectionsArray);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `garden-inventory-export-${timestamp}.${format}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 
      format === 'json' ? 'application/json' : 'text/csv'
    );

    res.send(exportData);

  } catch (error) {
    logger.error('Data export failed', { 
      format: req.params.format,
      error: error.message 
    });
    res.status(500).json({ 
      error: 'Export failed',
      message: error.message
    });
  }
});

// Download specific backup file
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (!filename.match(/^garden-inventory-backup-[\d-T]+\.tar\.gz$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const status = await backupService.getBackupStatus();
    const backup = status.backups.find(b => b.filename === filename);

    if (!backup) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    logger.info('Backup download requested', { 
      filename,
      ip: req.ip
    });

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/gzip');
    
    res.download(backup.path, filename);

  } catch (error) {
    logger.error('Backup download failed', { 
      filename: req.params.filename,
      error: error.message 
    });
    res.status(500).json({ 
      error: 'Download failed',
      message: error.message
    });
  }
});

// Delete specific backup file
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename.match(/^garden-inventory-backup-[\d-T]+\.tar\.gz$/)) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const status = await backupService.getBackupStatus();
    const backup = status.backups.find(b => b.filename === filename);

    if (!backup) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const fs = require('fs').promises;
    await fs.unlink(backup.path);

    logger.info('Backup deleted', { 
      filename,
      ip: req.ip
    });

    res.json({ 
      success: true,
      message: 'Backup deleted successfully',
      filename
    });

  } catch (error) {
    logger.error('Backup deletion failed', { 
      filename: req.params.filename,
      error: error.message 
    });
    res.status(500).json({ 
      error: 'Deletion failed',
      message: error.message
    });
  }
});

// Get backup configuration
router.get('/config', (req, res) => {
  res.json({
    maxBackups: parseInt(process.env.MAX_BACKUPS) || 30,
    compressionLevel: parseInt(process.env.BACKUP_COMPRESSION) || 6,
    backupDirectory: require('path').join(__dirname, '../backups'),
    supportedExportFormats: ['json', 'csv'],
    availableCollections: ['plants', 'inventory', 'harvests']
  });
});

// Update backup configuration
router.post('/config', (req, res) => {
  const { maxBackups, compressionLevel } = req.body;
  
  if (maxBackups && (maxBackups < 1 || maxBackups > 100)) {
    return res.status(400).json({ 
      error: 'maxBackups must be between 1 and 100' 
    });
  }
  
  if (compressionLevel && (compressionLevel < 1 || compressionLevel > 9)) {
    return res.status(400).json({ 
      error: 'compressionLevel must be between 1 and 9' 
    });
  }

  // In a real application, this would save to database or config file
  logger.info('Backup configuration updated', { 
    maxBackups,
    compressionLevel,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Backup configuration updated',
    config: {
      maxBackups: maxBackups || parseInt(process.env.MAX_BACKUPS) || 30,
      compressionLevel: compressionLevel || parseInt(process.env.BACKUP_COMPRESSION) || 6
    }
  });
});

module.exports = router; 