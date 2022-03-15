# Garden Inventory API Documentation

## Overview

The Garden Inventory API provides comprehensive endpoints for managing plants, inventory, harvests, and analytics for garden management systems. This RESTful API supports full CRUD operations and advanced features like monitoring, notifications, and data export.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow a consistent JSON format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2022-03-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2022-03-15T10:30:00Z"
}
```

## Plants API

### Get All Plants

```http
GET /api/plants
```

**Query Parameters:**
- `category` (string): Filter by plant category
- `status` (string): Filter by plant status (planted, growing, harvested, failed)
- `location` (string): Filter by location
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "plants": [
      {
        "_id": "60f1234567890abcdef12345",
        "name": "Tomato",
        "variety": "Cherry",
        "category": "vegetables",
        "status": "growing",
        "location": "greenhouse",
        "plantedDate": "2022-03-01T00:00:00Z",
        "expectedHarvestDate": "2022-05-15T00:00:00Z",
        "notes": "Growing well, needs support",
        "createdAt": "2022-03-01T10:00:00Z",
        "updatedAt": "2022-03-10T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Plant by ID

```http
GET /api/plants/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f1234567890abcdef12345",
    "name": "Tomato",
    "variety": "Cherry",
    "category": "vegetables",
    "status": "growing",
    "location": "greenhouse",
    "plantedDate": "2022-03-01T00:00:00Z",
    "expectedHarvestDate": "2022-05-15T00:00:00Z",
    "notes": "Growing well, needs support",
    "createdAt": "2022-03-01T10:00:00Z",
    "updatedAt": "2022-03-10T15:30:00Z"
  }
}
```

### Create Plant

```http
POST /api/plants
```

**Request Body:**
```json
{
  "name": "Tomato",
  "variety": "Cherry",
  "category": "vegetables",
  "location": "greenhouse",
  "plantedDate": "2022-03-01",
  "expectedHarvestDate": "2022-05-15",
  "notes": "Planted in rich soil"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f1234567890abcdef12345",
    "name": "Tomato",
    "variety": "Cherry",
    "category": "vegetables",
    "status": "planted",
    "location": "greenhouse",
    "plantedDate": "2022-03-01T00:00:00Z",
    "expectedHarvestDate": "2022-05-15T00:00:00Z",
    "notes": "Planted in rich soil",
    "createdAt": "2022-03-01T10:00:00Z",
    "updatedAt": "2022-03-01T10:00:00Z"
  }
}
```

### Update Plant

```http
PUT /api/plants/:id
```

**Request Body:**
```json
{
  "status": "harvested",
  "harvestDate": "2022-05-10",
  "notes": "Excellent yield, sweet flavor"
}
```

### Delete Plant

```http
DELETE /api/plants/:id
```

## Inventory API

### Get All Inventory Items

```http
GET /api/inventory
```

**Query Parameters:**
- `category` (string): Filter by category
- `lowStock` (boolean): Show only low stock items
- `expiring` (boolean): Show items expiring within 30 days
- `page` (number): Page number for pagination
- `limit` (number): Items per page

### Get Inventory Item by ID

```http
GET /api/inventory/:id
```

### Create Inventory Item

```http
POST /api/inventory
```

**Request Body:**
```json
{
  "name": "Organic Fertilizer",
  "category": "fertilizers",
  "quantity": 50,
  "unit": "lbs",
  "cost": 25.99,
  "supplier": "Garden Supply Co",
  "purchaseDate": "2022-03-01",
  "expirationDate": "2024-03-01",
  "minThreshold": 10,
  "location": "storage-shed",
  "notes": "All-purpose organic blend"
}
```

### Update Inventory Item

```http
PUT /api/inventory/:id
```

### Delete Inventory Item

```http
DELETE /api/inventory/:id
```

## Harvests API

### Get All Harvests

```http
GET /api/harvests
```

**Query Parameters:**
- `plantId` (string): Filter by plant ID
- `startDate` (date): Filter harvests after this date
- `endDate` (date): Filter harvests before this date
- `quality` (string): Filter by quality rating
- `page` (number): Page number for pagination
- `limit` (number): Items per page

### Get Harvest by ID

```http
GET /api/harvests/:id
```

### Create Harvest

```http
POST /api/harvests
```

**Request Body:**
```json
{
  "plantId": "60f1234567890abcdef12345",
  "harvestDate": "2022-05-10",
  "quantity": 5.5,
  "unit": "lbs",
  "quality": "excellent",
  "storageMethod": "refrigerated",
  "storageLocation": "main-fridge",
  "notes": "Perfect ripeness, great flavor"
}
```

### Update Harvest

```http
PUT /api/harvests/:id
```

### Delete Harvest

```http
DELETE /api/harvests/:id
```

## Dashboard API

### Get Dashboard Stats

```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPlants": 45,
    "activeGrowing": 32,
    "totalHarvests": 128,
    "totalYield": 245.5,
    "inventoryItems": 23,
    "lowStockItems": 3,
    "recentActivity": [
      {
        "type": "harvest",
        "description": "Harvested 3.2 lbs of tomatoes",
        "date": "2022-03-10T14:30:00Z"
      }
    ]
  }
}
```

### Get Harvest Trends

```http
GET /api/dashboard/harvest-trends
```

**Query Parameters:**
- `period` (string): "week", "month", "quarter", "year"
- `category` (string): Filter by plant category

### Get Plant Growth Timeline

```http
GET /api/dashboard/plant-timeline
```

### Get Inventory Analysis

```http
GET /api/dashboard/inventory-analysis
```

## Analytics API

### Get Plant Growth Analytics

```http
GET /api/analytics/plant-growth
```

**Query Parameters:**
- `timeframe` (string): "week", "month", "quarter", "year"

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPlanted": 45,
    "byCategory": {
      "vegetables": 25,
      "herbs": 12,
      "fruits": 8
    },
    "byStatus": {
      "growing": 32,
      "harvested": 10,
      "failed": 3
    },
    "averageGrowthTime": 75,
    "successRate": "77.78",
    "monthlyTrends": [
      {"month": "2022-1", "count": 8},
      {"month": "2022-2", "count": 12}
    ]
  }
}
```

### Get Harvest Analytics

```http
GET /api/analytics/harvest
```

**Query Parameters:**
- `timeframe` (string): "week", "month", "quarter", "year"

### Get Inventory Analytics

```http
GET /api/analytics/inventory
```

### Get Seasonal Patterns

```http
GET /api/analytics/seasonal-patterns
```

### Get Performance Metrics

```http
GET /api/analytics/performance
```

## Notifications API

### Get Notifications

```http
GET /api/notifications
```

**Query Parameters:**
- `type` (string): Filter by notification type
- `read` (boolean): Filter by read status
- `page` (number): Page number for pagination

### Mark Notification as Read

```http
PUT /api/notifications/:id/read
```

### Send Test Notification

```http
POST /api/notifications/test
```

**Request Body:**
```json
{
  "type": "plant_care",
  "recipient": "user@example.com",
  "subject": "Test Notification",
  "message": "This is a test notification"
}
```

### Get Notification Settings

```http
GET /api/notifications/settings
```

### Update Notification Settings

```http
PUT /api/notifications/settings
```

## Backup API

### Create Backup

```http
POST /api/backup
```

**Request Body:**
```json
{
  "includeDatabase": true,
  "includeFiles": true,
  "includeConfig": true,
  "description": "Weekly backup before maintenance"
}
```

### Get Backup List

```http
GET /api/backup
```

### Download Backup

```http
GET /api/backup/:filename/download
```

### Delete Backup

```http
DELETE /api/backup/:filename
```

### Get Backup Status

```http
GET /api/backup/status
```

## Monitoring API

### Get System Health

```http
GET /api/monitoring/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "database": {
      "status": "connected",
      "responseTime": 12
    },
    "memory": {
      "used": 156.7,
      "total": 512.0,
      "percentage": 30.6
    },
    "disk": {
      "used": 2.1,
      "total": 10.0,
      "percentage": 21.0
    }
  }
}
```

### Get Metrics

```http
GET /api/monitoring/metrics
```

**Headers:**
- `X-API-Key`: Required for metrics access

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `DUPLICATE_ENTRY` | Resource already exists |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Data Export

### Export Plants Data

```http
GET /api/export/plants
```

**Query Parameters:**
- `format` (string): "json" or "csv"
- `startDate` (date): Filter records after this date
- `endDate` (date): Filter records before this date

### Export Harvests Data

```http
GET /api/export/harvests
```

### Export Inventory Data

```http
GET /api/export/inventory
```

### Export Full System Data

```http
GET /api/export/all
```

## Webhooks

The system supports webhooks for real-time notifications:

### Plant Status Changes

```json
{
  "event": "plant.status_changed",
  "data": {
    "plantId": "60f1234567890abcdef12345",
    "oldStatus": "growing",
    "newStatus": "harvested",
    "timestamp": "2022-03-15T10:30:00Z"
  }
}
```

### Low Stock Alerts

```json
{
  "event": "inventory.low_stock",
  "data": {
    "itemId": "60f1234567890abcdef12346",
    "itemName": "Organic Fertilizer",
    "currentQuantity": 8,
    "minThreshold": 10,
    "timestamp": "2022-03-15T10:30:00Z"
  }
}
```

### Harvest Recorded

```json
{
  "event": "harvest.recorded",
  "data": {
    "harvestId": "60f1234567890abcdef12347",
    "plantName": "Tomato - Cherry",
    "quantity": 3.2,
    "quality": "excellent",
    "timestamp": "2022-03-15T10:30:00Z"
  }
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class GardenInventoryAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getPlants(filters = {}) {
    const response = await this.client.get('/plants', { params: filters });
    return response.data;
  }

  async createPlant(plantData) {
    const response = await this.client.post('/plants', plantData);
    return response.data;
  }

  async recordHarvest(harvestData) {
    const response = await this.client.post('/harvests', harvestData);
    return response.data;
  }
}

// Usage
const api = new GardenInventoryAPI('http://localhost:3000/api', 'your-jwt-token');
const plants = await api.getPlants({ category: 'vegetables' });
```

### Python

```python
import requests
import json

class GardenInventoryAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_plants(self, filters=None):
        response = requests.get(
            f'{self.base_url}/plants',
            headers=self.headers,
            params=filters or {}
        )
        return response.json()
    
    def create_plant(self, plant_data):
        response = requests.post(
            f'{self.base_url}/plants',
            headers=self.headers,
            json=plant_data
        )
        return response.json()

# Usage
api = GardenInventoryAPI('http://localhost:3000/api', 'your-jwt-token')
plants = api.get_plants({'category': 'vegetables'})
```

## Testing

The API includes comprehensive test coverage. Run tests with:

```bash
npm test
```

Test categories:
- Unit tests for models and utilities
- Integration tests for API endpoints
- Performance tests for high-load scenarios
- Security tests for authentication and authorization

## Deployment

The API is containerized and can be deployed using Docker:

```bash
# Build and start services
docker-compose up -d

# Scale the application
docker-compose up -d --scale app=3

# View logs
docker-compose logs -f app
```

## Support

For API support and questions:
- Documentation: [https://github.com/yourusername/garden-inventory/wiki](https://github.com/yourusername/garden-inventory/wiki)
- Issues: [https://github.com/yourusername/garden-inventory/issues](https://github.com/yourusername/garden-inventory/issues)
- Email: support@garden-inventory.com

## Changelog

### v1.0.0 (2022-03-15)
- Initial API release
- Complete CRUD operations for plants, inventory, and harvests
- Dashboard analytics and reporting
- Advanced analytics and insights
- Notification system
- Backup and export functionality
- Comprehensive monitoring and health checks
- Docker containerization
- Full test coverage 