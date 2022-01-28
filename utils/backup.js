const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('./logger');
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');
const Harvest = require('../models/Harvest');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 30;
    this.compressionLevel = parseInt(process.env.BACKUP_COMPRESSION) || 6;
  }

  // Ensure backup directory exists
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('Backup directory created', { path: this.backupDir });
    }
  }

  // Create full system backup
  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `garden-inventory-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    logger.info('Starting full system backup', { backupName });

    try {
      await this.ensureBackupDirectory();
      await fs.mkdir(backupPath);

      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        type: 'full',
        components: ['database', 'files', 'configuration'],
        metadata: {
          nodeVersion: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV || 'development'
        }
      };

      // Backup database collections
      await this.backupDatabase(backupPath);

      // Backup configuration files
      await this.backupConfiguration(backupPath);

      // Backup user uploads and logs
      await this.backupFiles(backupPath);

      // Save manifest
      await fs.writeFile(
        path.join(backupPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Create compressed archive
      const archivePath = await this.compressBackup(backupPath);

      // Clean up uncompressed backup
      await this.removeDirectory(backupPath);

      // Clean up old backups
      await this.cleanupOldBackups();

      logger.info('Full backup completed successfully', {
        backupName,
        archivePath,
        size: await this.getFileSize(archivePath)
      });

      return {
        success: true,
        backupName,
        archivePath,
        timestamp: manifest.timestamp
      };

    } catch (error) {
      logger.error('Full backup failed', {
        backupName,
        error: error.message,
        stack: error.stack
      });

      // Clean up failed backup
      try {
        await this.removeDirectory(backupPath);
      } catch (cleanupError) {
        logger.warn('Failed to clean up incomplete backup', {
          path: backupPath,
          error: cleanupError.message
        });
      }

      throw error;
    }
  }

  // Backup database collections to JSON
  async backupDatabase(backupPath) {
    const dbPath = path.join(backupPath, 'database');
    await fs.mkdir(dbPath);

    logger.info('Backing up database collections');

    // Backup plants collection
    const plants = await Plant.find({}).lean();
    await fs.writeFile(
      path.join(dbPath, 'plants.json'),
      JSON.stringify(plants, null, 2)
    );

    // Backup inventory collection
    const inventory = await Inventory.find({}).lean();
    await fs.writeFile(
      path.join(dbPath, 'inventory.json'),
      JSON.stringify(inventory, null, 2)
    );

    // Backup harvests collection
    const harvests = await Harvest.find({}).populate('plantId').lean();
    await fs.writeFile(
      path.join(dbPath, 'harvests.json'),
      JSON.stringify(harvests, null, 2)
    );

    // Create database statistics
    const stats = {
      plants: plants.length,
      inventory: inventory.length,
      harvests: harvests.length,
      totalRecords: plants.length + inventory.length + harvests.length,
      exportDate: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(dbPath, 'statistics.json'),
      JSON.stringify(stats, null, 2)
    );

    logger.info('Database backup completed', stats);
  }

  // Backup configuration files
  async backupConfiguration(backupPath) {
    const configPath = path.join(backupPath, 'configuration');
    await fs.mkdir(configPath);

    logger.info('Backing up configuration files');

    const configFiles = [
      'package.json',
      'docker-compose.yml',
      'Dockerfile',
      'nginx.conf',
      '.env.example'
    ];

    for (const file of configFiles) {
      const sourcePath = path.join(__dirname, '..', file);
      const targetPath = path.join(configPath, file);

      try {
        await fs.copyFile(sourcePath, targetPath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.warn('Failed to backup configuration file', {
            file,
            error: error.message
          });
        }
      }
    }

    // Backup environment template
    const envTemplate = `# Garden Inventory Environment Configuration
# Database
MONGODB_URI=mongodb://localhost:27017/garden_inventory

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key-here

# Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=garden-inventory@yourdomain.com
NOTIFICATION_EMAILS=admin@yourdomain.com

# Monitoring
METRICS_API_KEY=your-metrics-api-key
LOG_LEVEL=INFO

# Backup
MAX_BACKUPS=30
BACKUP_COMPRESSION=6
`;

    await fs.writeFile(path.join(configPath, '.env.template'), envTemplate);
  }

  // Backup important files
  async backupFiles(backupPath) {
    const filesPath = path.join(backupPath, 'files');
    await fs.mkdir(filesPath);

    logger.info('Backing up important files');

    // Backup logs (last 7 days)
    await this.backupRecentLogs(filesPath);

    // Backup any user uploads or data files
    await this.backupDataFiles(filesPath);
  }

  // Backup recent log files
  async backupRecentLogs(filesPath) {
    const logsPath = path.join(__dirname, '../logs');
    const backupLogsPath = path.join(filesPath, 'logs');

    try {
      await fs.access(logsPath);
      await fs.mkdir(backupLogsPath);

      const logFiles = await fs.readdir(logsPath);
      const recentFiles = await this.filterRecentFiles(logsPath, logFiles, 7);

      for (const file of recentFiles) {
        await fs.copyFile(
          path.join(logsPath, file),
          path.join(backupLogsPath, file)
        );
      }

      logger.info('Recent logs backed up', { count: recentFiles.length });
    } catch (error) {
      logger.warn('Failed to backup logs', { error: error.message });
    }
  }

  // Backup data files
  async backupDataFiles(filesPath) {
    const dataPath = path.join(__dirname, '../data');
    const backupDataPath = path.join(filesPath, 'data');

    try {
      await fs.access(dataPath);
      await fs.mkdir(backupDataPath);

      const dataFiles = await fs.readdir(dataPath);
      
      for (const file of dataFiles) {
        if (file.endsWith('.json') || file.endsWith('.js')) {
          await fs.copyFile(
            path.join(dataPath, file),
            path.join(backupDataPath, file)
          );
        }
      }

      logger.info('Data files backed up', { count: dataFiles.length });
    } catch (error) {
      logger.warn('Failed to backup data files', { error: error.message });
    }
  }

  // Filter files modified within specified days
  async filterRecentFiles(dirPath, files, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentFiles = [];

    for (const file of files) {
      try {
        const stats = await fs.stat(path.join(dirPath, file));
        if (stats.mtime > cutoffDate) {
          recentFiles.push(file);
        }
      } catch (error) {
        logger.warn('Failed to check file stats', { file, error: error.message });
      }
    }

    return recentFiles;
  }

  // Compress backup directory
  async compressBackup(backupPath) {
    const archiveName = `${path.basename(backupPath)}.tar.gz`;
    const archivePath = path.join(path.dirname(backupPath), archiveName);

    logger.info('Compressing backup', { archiveName });

    try {
      const command = `tar -czf "${archivePath}" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`;
      await execAsync(command);

      logger.info('Backup compressed successfully', {
        archivePath,
        size: await this.getFileSize(archivePath)
      });

      return archivePath;
    } catch (error) {
      logger.error('Backup compression failed', { error: error.message });
      throw new Error(`Failed to compress backup: ${error.message}`);
    }
  }

  // Clean up old backups
  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('garden-inventory-backup-') && file.endsWith('.tar.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file)
        }));

      if (backupFiles.length <= this.maxBackups) {
        return;
      }

      // Sort by creation time (oldest first)
      const fileStats = await Promise.all(
        backupFiles.map(async file => ({
          ...file,
          stats: await fs.stat(file.path)
        }))
      );

      fileStats.sort((a, b) => a.stats.mtime - b.stats.mtime);

      // Remove oldest files
      const filesToRemove = fileStats.slice(0, fileStats.length - this.maxBackups);

      for (const file of filesToRemove) {
        await fs.unlink(file.path);
        logger.info('Old backup removed', { filename: file.name });
      }

      logger.info('Backup cleanup completed', {
        removed: filesToRemove.length,
        remaining: this.maxBackups
      });

    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
    }
  }

  // Export data in various formats
  async exportData(format = 'json', collections = ['plants', 'inventory', 'harvests']) {
    logger.info('Starting data export', { format, collections });

    const exportData = {};

    if (collections.includes('plants')) {
      exportData.plants = await Plant.find({}).lean();
    }

    if (collections.includes('inventory')) {
      exportData.inventory = await Inventory.find({}).lean();
    }

    if (collections.includes('harvests')) {
      exportData.harvests = await Harvest.find({}).populate('plantId').lean();
    }

    exportData.metadata = {
      exportDate: new Date().toISOString(),
      format,
      collections,
      totalRecords: Object.values(exportData).reduce((sum, arr) => 
        sum + (Array.isArray(arr) ? arr.length : 0), 0
      )
    };

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'csv':
        return this.convertToCSV(exportData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Convert data to CSV format
  convertToCSV(data) {
    const csvData = [];

    // Convert each collection to CSV
    for (const [collection, records] of Object.entries(data)) {
      if (collection === 'metadata' || !Array.isArray(records)) continue;

      csvData.push(`\n=== ${collection.toUpperCase()} ===`);
      
      if (records.length > 0) {
        const headers = Object.keys(records[0]);
        csvData.push(headers.join(','));

        for (const record of records) {
          const row = headers.map(header => {
            const value = record[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          csvData.push(row.join(','));
        }
      }
    }

    return csvData.join('\n');
  }

  // Utility methods
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return this.formatBytes(stats.size);
    } catch (error) {
      return 'Unknown';
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async removeDirectory(dirPath) {
    await fs.rm(dirPath, { recursive: true, force: true });
  }

  // Get backup status and history
  async getBackupStatus() {
    try {
      await this.ensureBackupDirectory();
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => 
        file.startsWith('garden-inventory-backup-') && file.endsWith('.tar.gz')
      );

      const backups = await Promise.all(
        backupFiles.map(async file => {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: this.formatBytes(stats.size),
            created: stats.mtime.toISOString(),
            path: filePath
          };
        })
      );

      backups.sort((a, b) => new Date(b.created) - new Date(a.created));

      return {
        totalBackups: backups.length,
        maxBackups: this.maxBackups,
        backupDirectory: this.backupDir,
        backups
      };

    } catch (error) {
      logger.error('Failed to get backup status', { error: error.message });
      throw error;
    }
  }
}

module.exports = new BackupService(); 