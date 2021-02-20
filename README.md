# Garden Inventory

A comprehensive tool for tracking garden resources, plants, and yields.

## Project Overview

This application helps gardeners manage their inventory, track plant growth, and monitor harvest yields. Built with Node.js, Express, MongoDB, and vanilla JavaScript for a clean, responsive interface.

## Features

### ✅ Implemented
- **Plant Management**: Track plants with categories, varieties, planting dates, and growth status
- **Inventory Tracking**: Manage seeds, tools, fertilizers, and supplies with low-stock alerts
- **Harvest Recording**: Log harvest yields with quality ratings and storage methods
- **Dashboard Analytics**: View growth timelines, yield trends, and inventory value analysis
- **Smart Alerts**: Get notifications for low stock, expiring items, and harvest reminders
- **Responsive Design**: Modern CSS with mobile-friendly interface

### 🚧 Planned
- Weather integration for optimal planting recommendations
- User authentication and multi-user support
- Photo uploads for plants and harvests
- Export functionality for data analysis
- Mobile app companion

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Frontend**: Vanilla JavaScript, Modern CSS with Grid/Flexbox
- **Testing**: Jest, Supertest
- **Security**: JWT authentication, input validation
- **Development**: Nodemon, ESLint, environment configuration

## Getting Started

### Prerequisites
- Node.js (v12 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RyanSStephens/GardenInventory.git
cd GardenInventory
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

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:3000`

## API Endpoints

### Plants
- `GET /api/plants` - Get all plants
- `POST /api/plants` - Create new plant
- `GET /api/plants/:id` - Get specific plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new item
- `GET /api/inventory/status/low-stock` - Get low stock items

### Harvests
- `GET /api/harvests` - Get all harvests
- `POST /api/harvests` - Record new harvest
- `GET /api/harvests/stats/summary` - Get harvest statistics

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard overview
- `GET /api/dashboard/harvest-trends` - Get monthly trends
- `GET /api/dashboard/growth-timeline` - Get plant timeline

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run seed` - Populate database with sample data

### Project Structure
```
GardenInventory/
├── config/          # Configuration files
├── data/            # Seed data and migrations
├── middleware/      # Express middleware
├── models/          # MongoDB schemas
├── public/          # Frontend assets
├── routes/          # API route handlers
├── tests/           # Test files
├── utils/           # Helper functions
└── server.js        # Main application file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with love for the gardening community
- Inspired by the need for better garden organization tools
- Thanks to all contributors and testers 