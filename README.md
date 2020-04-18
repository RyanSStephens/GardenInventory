# Garden Inventory Management System

A comprehensive web application for tracking garden plants, inventory, and harvests. Built with Node.js, Express, MongoDB, and modern web technologies.

## Features

- **Plant Management**: Track plant lifecycle from planting to harvest
- **Inventory Tracking**: Manage gardening supplies with low-stock alerts
- **Harvest Recording**: Log yields with quality ratings and storage info
- **Dashboard Analytics**: Visual insights and trend analysis
- **Automated Notifications**: Email alerts for plant care and inventory
- **Data Export**: Backup and export functionality
- **Performance Monitoring**: System health and metrics tracking
- **Docker Support**: Containerized deployment with Docker Compose

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Vanilla JavaScript, modern CSS with Grid/Flexbox
- **Security**: JWT authentication, input validation, rate limiting
- **Infrastructure**: Docker, Docker Compose, Nginx reverse proxy
- **Monitoring**: Winston logging, metrics tracking, health checks
- **Automation**: Cron-based task scheduling, email notifications
- **Testing**: Jest, Supertest

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/garden-inventory.git
   cd garden-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config/env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start your local MongoDB service
   sudo systemctl start mongod
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

### Docker Deployment

For a complete containerized setup:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- Garden Inventory application on port 3000
- MongoDB database on port 27017
- Nginx reverse proxy on port 80

## API Documentation

The API provides comprehensive endpoints for managing all aspects of your garden inventory. See the [API Documentation](docs/API.md) for detailed information about available endpoints, request/response formats, and authentication requirements.

### Quick API Overview

- **Plants**: `/api/plants` - CRUD operations for plant management
- **Inventory**: `/api/inventory` - Manage gardening supplies and tools
- **Harvests**: `/api/harvests` - Record and track harvest data
- **Dashboard**: `/api/dashboard` - Analytics and summary data
- **Notifications**: `/api/notifications` - Automated alerts and reminders
- **Backup**: `/api/backup` - Data export and backup functionality

## Project Structure

```
garden-inventory/
├── config/                 # Configuration files
│   ├── database.js         # Database connection setup
│   └── env.example         # Environment variables template
├── data/                   # Data files and seeds
│   ├── seeds.js           # Database seeding script
│   └── mongo-init.js      # MongoDB initialization
├── docs/                   # Documentation
│   └── API.md             # API documentation
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   ├── validation.js      # Input validation
│   ├── performance.js     # Performance monitoring
│   └── monitoring.js      # Request/response monitoring
├── models/                 # MongoDB models
│   ├── Plant.js           # Plant data model
│   ├── Inventory.js       # Inventory item model
│   └── Harvest.js         # Harvest record model
├── public/                 # Static frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   └── app.js             # Frontend JavaScript
├── routes/                 # API route handlers
│   ├── plants.js          # Plant management routes
│   ├── inventory.js       # Inventory management routes
│   ├── harvests.js        # Harvest recording routes
│   ├── dashboard.js       # Dashboard and analytics
│   ├── notifications.js   # Notification management
│   └── backup.js          # Backup and export routes
├── tests/                  # Test files
│   └── plant.test.js      # Plant API tests
├── utils/                  # Utility functions
│   ├── helpers.js         # General helper functions
│   ├── logger.js          # Logging utility
│   ├── notifications.js   # Email notification system
│   ├── scheduler.js       # Task scheduling
│   ├── backup.js          # Backup functionality
│   └── analytics.js       # Analytics and insights
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── nginx.conf             # Nginx configuration
├── package.json           # Node.js dependencies and scripts
└── server.js              # Main application entry point
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Database Operations

```bash
# Seed database with sample data
npm run seed

# Create database backup
npm run backup
```

## Features Overview

### Plant Management
- Track plant lifecycle from seed to harvest
- Monitor growth stages and health status
- Set planting and expected harvest dates
- Record care instructions and observations
- Organize plants by location and category

### Inventory Tracking
- Manage seeds, tools, fertilizers, and supplies
- Set minimum stock levels for automatic alerts
- Track costs and suppliers for budget management
- Monitor expiration dates for perishable items
- Categorize items for easy organization

### Harvest Recording
- Log harvest quantities and quality ratings
- Track storage methods and locations
- Calculate estimated values and yields
- Monitor harvest trends over time
- Export harvest data for analysis

### Dashboard Analytics
- Real-time overview of garden status
- Visual charts and trend analysis
- Performance metrics and insights
- Seasonal pattern recognition
- Growth and yield forecasting

### Automated Notifications
- Email alerts for plant care reminders
- Low stock inventory notifications
- Harvest timing recommendations
- System health and error alerts
- Customizable notification schedules

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check MongoDB status: `sudo systemctl status mongod`
- Verify connection string in `.env` file

**Port Already in Use**
```
Error: listen EADDRINUSE :::3000
```
- Check for running processes: `lsof -i :3000`
- Kill the process: `kill -9 <PID>`
- Or use a different port in `.env`: `PORT=3001`

**Docker Issues**
```
docker: Error response from daemon: port is already allocated
```
- Stop existing containers: `docker-compose down`
- Remove containers: `docker rm $(docker ps -aq)`
- Restart Docker service: `sudo systemctl restart docker`

**Seed Data Not Loading**
- Ensure MongoDB is running before seeding
- Check database connection in `config/database.js`
- Verify environment variables are set correctly
- Run seed script with debug output: `DEBUG=* npm run seed`

**Missing Dependencies**
```
Error: Cannot find module 'express'
```
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules`
- Reinstall dependencies: `npm install`

### Performance Issues

**Slow API Responses**
- Check MongoDB indexes: `db.plants.getIndexes()`
- Monitor memory usage: `docker stats`
- Review application logs for bottlenecks
- Consider adding database indexes for frequently queried fields

**High Memory Usage**
- Check for memory leaks in logs
- Restart the application: `pm2 restart garden-inventory`
- Monitor with: `docker stats` or `htop`
- Consider increasing container memory limits

### Docker Troubleshooting

**Container Won't Start**
- Check container logs: `docker-compose logs app`
- Verify environment variables: `docker-compose config`
- Ensure all required files exist
- Check file permissions: `chmod +x scripts/*`

**Database Connection Issues in Docker**
- Verify network connectivity: `docker network ls`
- Check service names in docker-compose.yml
- Ensure MongoDB container is healthy: `docker-compose ps`
- Review MongoDB logs: `docker-compose logs mongo`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#troubleshooting) above
2. Search existing [GitHub issues](https://github.com/yourusername/garden-inventory/issues)
3. Create a new issue with detailed information about your problem
4. Include system information, error messages, and steps to reproduce

## Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the gardening community's need for better organization tools
- Thanks to all contributors who help improve this project

---

**Happy Gardening! 🌱** 