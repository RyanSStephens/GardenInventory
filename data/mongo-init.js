// MongoDB initialization script for Docker container
db = db.getSiblingDB('garden_inventory');

// Create collections with validation
db.createCollection('plants', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'plantedDate'],
      properties: {
        name: { bsonType: 'string' },
        variety: { bsonType: 'string' },
        category: { bsonType: 'string' },
        plantedDate: { bsonType: 'date' },
        status: { 
          enum: ['seedling', 'growing', 'flowering', 'fruiting', 'harvested', 'dormant'] 
        }
      }
    }
  }
});

db.createCollection('inventory', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'quantity'],
      properties: {
        name: { bsonType: 'string' },
        category: { bsonType: 'string' },
        quantity: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

db.createCollection('harvests', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['plantId', 'harvestDate', 'quantity'],
      properties: {
        quantity: { bsonType: 'number', minimum: 0 },
        harvestDate: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
db.plants.createIndex({ 'name': 1 });
db.plants.createIndex({ 'category': 1 });
db.plants.createIndex({ 'status': 1 });
db.plants.createIndex({ 'plantedDate': 1 });

db.inventory.createIndex({ 'name': 1 });
db.inventory.createIndex({ 'category': 1 });
db.inventory.createIndex({ 'quantity': 1 });

db.harvests.createIndex({ 'plantId': 1 });
db.harvests.createIndex({ 'harvestDate': -1 });

// Create user for application
db.createUser({
  user: 'garden_app',
  pwd: 'garden_password',
  roles: [
    {
      role: 'readWrite',
      db: 'garden_inventory'
    }
  ]
});

print('Database initialized successfully!'); 