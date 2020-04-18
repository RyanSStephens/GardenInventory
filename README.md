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
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Infrastructure**: Docker, Nginx, Docker Compose
- **Testing**: Jest, Supertest
- **Monitoring**: Winston logging, custom metrics

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/garden-inventory.git
cd garden-inventory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp config/env.example .env
# Edit .env with your configuration
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Docker Installation

1. Clone and navigate to the project:
```bash
git clone https://github.com/yourusername/garden-inventory.git
cd garden-inventory
```

2. Start with Docker Compose:
```bash
docker-compose up -d
```

3. Access the application at `http://localhost`

## Troubleshooting

### Common Issues

**MongoDB Connection Issues:**
- Ensure MongoDB is running on the correct port (default: 27017)
- Check if the connection string in `.env` is correct
- Verify MongoDB authentication credentials if using authentication

**Port Already in Use:**
- Change the PORT variable in `.env` file
- Kill existing processes using the port: `lsof -ti:3000 | xargs kill -9`

**Docker Issues:**
- Ensure Docker daemon is running
- Clear Docker cache: `docker system prune -a`
- Rebuild containers: `docker-compose up --build`

**npm Install Failures:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Try using yarn instead: `yarn install`

## API Documentation

Comprehensive API documentation is available in the [docs/API.md](docs/API.md) file, including:

- Complete endpoint reference
- Request/response examples
- Authentication details
- Rate limiting information
- SDK examples for JavaScript and Python

## Project Structure

```
garden-inventory/
├── config/          # Configuration files
├── data/           # Seed data and database scripts
├── docs/           # Documentation
├── middleware/     # Express middleware
├── models/         # MongoDB models
├── public/         # Static frontend files
├── routes/         # API routes
├── tests/          # Test files
├── utils/          # Utility functions
├── docker-compose.yml
├── Dockerfile
└── server.js       # Main application file
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Development Scripts

```bash
# Start in development mode with nodemon
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Seed database with sample data
npm run seed

# Create backup
npm run backup

# Generate API documentation
npm run docs
```

### Environment Variables

Create a `.env` file based on `config/env.example`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/garden-inventory
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
API_KEY=your-api-key
BACKUP_RETENTION_DAYS=30
```

## Features Overview

### Plant Management
- Add plants with varieties, categories, and planting dates
- Track plant status throughout lifecycle
- Set expected harvest dates and care reminders
- Location-based organization

### Inventory System
- Manage gardening supplies and tools
- Set minimum stock thresholds
- Track expiration dates
- Cost and supplier information

### Harvest Tracking
- Record harvest yields and quality
- Storage method and location tracking
- Historical yield analysis
- Quality trend monitoring

### Dashboard & Analytics
- Real-time statistics and KPIs
- Harvest trends and seasonal patterns
- Plant growth analytics
- Inventory value analysis
- Performance metrics and insights

### Automation & Monitoring
- Automated email notifications
- Scheduled task management
- System health monitoring
- Performance metrics tracking
- Comprehensive logging

### Data Management
- Automated backup system
- Data export in JSON/CSV formats
- Database seeding for development
- Backup retention policies

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@garden-inventory.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/garden-inventory/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/garden-inventory/wiki)

## Roadmap

- [ ] Mobile app development
- [ ] Weather integration
- [ ] Plant disease detection
- [ ] Community features
- [ ] Advanced analytics dashboard
- [ ] IoT sensor integration
- [ ] Multi-language support 