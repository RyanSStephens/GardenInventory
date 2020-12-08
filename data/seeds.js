const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');
const Harvest = require('../models/Harvest');

const seedPlants = [
  {
    name: 'Cherry Tomato',
    variety: 'Sweet 100',
    category: 'vegetable',
    plantedDate: new Date('2020-04-15'),
    location: 'Garden Bed 1',
    status: 'growing',
    expectedHarvestDate: new Date('2020-07-15'),
    notes: 'Started from seed indoors, transplanted May 1st'
  },
  {
    name: 'Basil',
    variety: 'Genovese',
    category: 'herb',
    plantedDate: new Date('2020-05-01'),
    location: 'Herb Garden',
    status: 'growing',
    notes: 'Perfect for pesto making'
  },
  {
    name: 'Lettuce',
    variety: 'Buttercrunch',
    category: 'vegetable',
    plantedDate: new Date('2020-03-20'),
    location: 'Cold Frame',
    status: 'harvested',
    notes: 'Great early season crop'
  },
  {
    name: 'Marigold',
    variety: 'French',
    category: 'flower',
    plantedDate: new Date('2020-05-15'),
    location: 'Border Garden',
    status: 'flowering',
    notes: 'Natural pest deterrent'
  },
  {
    name: 'Bell Pepper',
    variety: 'California Wonder',
    category: 'vegetable',
    plantedDate: new Date('2020-05-10'),
    location: 'Garden Bed 2',
    status: 'fruiting',
    expectedHarvestDate: new Date('2020-08-01'),
    notes: 'Slow to start but producing well now'
  }
];

const seedInventory = [
  {
    name: 'Tomato Seeds - Roma',
    category: 'seeds',
    quantity: 25,
    unit: 'packets',
    location: 'Seed Storage',
    supplier: 'Burpee',
    cost: 3.99,
    minimumStock: 5,
    purchaseDate: new Date('2020-02-15'),
    notes: 'Great paste tomato variety'
  },
  {
    name: 'Garden Trowel',
    category: 'tools',
    quantity: 2,
    unit: 'pieces',
    location: 'Tool Shed',
    supplier: 'Local Hardware',
    cost: 15.99,
    minimumStock: 1,
    notes: 'Stainless steel, very durable'
  },
  {
    name: 'Organic Compost',
    category: 'soil',
    quantity: 10,
    unit: 'bags',
    location: 'Storage Shed',
    supplier: 'Garden Center',
    cost: 8.99,
    minimumStock: 3,
    purchaseDate: new Date('2020-03-01'),
    notes: 'High quality organic matter'
  },
  {
    name: 'Watering Can',
    category: 'equipment',
    quantity: 1,
    unit: 'pieces',
    location: 'Greenhouse',
    cost: 24.99,
    minimumStock: 1,
    notes: '2-gallon capacity with fine rose attachment'
  },
  {
    name: 'Neem Oil',
    category: 'pesticide',
    quantity: 2,
    unit: 'bottles',
    location: 'Chemical Storage',
    supplier: 'Organic Solutions',
    cost: 12.99,
    minimumStock: 1,
    expirationDate: new Date('2022-03-01'),
    notes: 'Organic pest control solution'
  }
];

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garden_inventory', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Plant.deleteMany({});
    await Inventory.deleteMany({});
    await Harvest.deleteMany({});

    console.log('Cleared existing data');

    // Insert seed data
    const plants = await Plant.insertMany(seedPlants);
    console.log(`Inserted ${plants.length} plants`);

    const inventory = await Inventory.insertMany(seedInventory);
    console.log(`Inserted ${inventory.length} inventory items`);

    // Create some harvest records for the harvested lettuce
    const lettuce = plants.find(p => p.name === 'Lettuce');
    if (lettuce) {
      const harvestData = [
        {
          plant: lettuce._id,
          harvestDate: new Date('2020-04-20'),
          quantity: 2.5,
          unit: 'pounds',
          quality: 'excellent',
          notes: 'Perfect timing, very tender leaves'
        },
        {
          plant: lettuce._id,
          harvestDate: new Date('2020-04-25'),
          quantity: 1.8,
          unit: 'pounds',
          quality: 'good',
          notes: 'Second harvest before bolting'
        }
      ];

      const harvests = await Harvest.insertMany(harvestData);
      console.log(`Inserted ${harvests.length} harvest records`);
    }

    console.log('Seed data inserted successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData, seedPlants, seedInventory }; 