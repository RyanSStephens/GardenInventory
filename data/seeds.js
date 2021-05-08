const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const Inventory = require('../models/Inventory');
const Harvest = require('../models/Harvest');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garden-inventory');
    console.log('📦 Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedPlants = async () => {
  console.log('🌱 Seeding plants...');
  
  const plants = [
    {
      name: 'Tomato',
      variety: 'Cherokee Purple',
      category: 'vegetables',
      status: 'growing',
      plantedDate: new Date('2023-04-15'),
      expectedHarvestDate: new Date('2023-07-15'),
      location: 'Garden Bed A - Row 1',
      notes: 'Heirloom variety with excellent flavor',
      careInstructions: 'Water deeply twice weekly, stake when 12 inches tall',
      tags: ['heirloom', 'indeterminate', 'purple']
    },
    {
      name: 'Basil',
      variety: 'Genovese',
      category: 'herbs',
      status: 'flowering',
      plantedDate: new Date('2023-05-01'),
      expectedHarvestDate: new Date('2023-06-01'),
      location: 'Herb Garden - Container 3',
      notes: 'Perfect for pesto, pinch flowers to encourage leaf growth',
      careInstructions: 'Keep soil moist, harvest regularly',
      tags: ['culinary', 'aromatic', 'annual']
    },
    {
      name: 'Lettuce',
      variety: 'Buttercrunch',
      category: 'vegetables',
      status: 'harvested',
      plantedDate: new Date('2023-03-20'),
      expectedHarvestDate: new Date('2023-05-15'),
      harvestDate: new Date('2023-05-12'),
      location: 'Cold Frame - Section 2',
      notes: 'Excellent head formation, sweet and crispy',
      isActive: false,
      tags: ['cool-season', 'quick-growing']
    },
    {
      name: 'Sunflower',
      variety: 'Mammoth',
      category: 'flowers',
      status: 'fruiting',
      plantedDate: new Date('2023-05-15'),
      expectedHarvestDate: new Date('2023-09-01'),
      location: 'Back Fence - East Side',
      notes: 'Growing over 8 feet tall, attracting lots of bees',
      careInstructions: 'Support with stake, deep watering',
      tags: ['tall', 'pollinator-friendly', 'seeds']
    },
    {
      name: 'Pepper',
      variety: 'Bell - California Wonder',
      category: 'vegetables',
      status: 'growing',
      plantedDate: new Date('2023-05-10'),
      expectedHarvestDate: new Date('2023-08-01'),
      location: 'Garden Bed B - Row 2',
      notes: 'First flowers appearing, looking healthy',
      careInstructions: 'Regular watering, mulch around base',
      tags: ['sweet', 'thick-walled', 'productive']
    },
    {
      name: 'Cucumber',
      variety: 'Marketmore 76',
      category: 'vegetables',
      status: 'flowering',
      plantedDate: new Date('2023-05-20'),
      expectedHarvestDate: new Date('2023-07-10'),
      location: 'Trellis - North Wall',
      notes: 'Climbing well, first female flowers visible',
      careInstructions: 'Train vines up trellis, consistent moisture',
      tags: ['climbing', 'disease-resistant', 'slicing']
    },
    {
      name: 'Marigold',
      variety: 'French Petite',
      category: 'flowers',
      status: 'flowering',
      plantedDate: new Date('2023-04-25'),
      expectedHarvestDate: new Date('2023-10-15'),
      location: 'Garden Borders - Multiple',
      notes: 'Companion planting for pest control',
      careInstructions: 'Deadhead regularly, drought tolerant',
      tags: ['companion', 'pest-deterrent', 'colorful']
    },
    {
      name: 'Carrot',
      variety: 'Nantes',
      category: 'vegetables',
      status: 'growing',
      plantedDate: new Date('2023-04-01'),
      expectedHarvestDate: new Date('2023-07-01'),
      location: 'Raised Bed C - Deep Section',
      notes: 'Thinned to 2 inches apart, good germination',
      careInstructions: 'Keep soil loose, light watering',
      tags: ['root-crop', 'storage', 'sweet']
    }
  ];

  await Plant.deleteMany({});
  const createdPlants = await Plant.insertMany(plants);
  console.log(`✅ Created ${createdPlants.length} plants`);
  return createdPlants;
};

const seedInventory = async () => {
  console.log('📦 Seeding inventory...');
  
  const inventory = [
    {
      name: 'Tomato Seeds - Cherokee Purple',
      category: 'seeds',
      quantity: 25,
      unit: 'seeds',
      cost: 4.99,
      supplier: 'Seed Savers Exchange',
      location: 'Seed Storage - Refrigerator',
      expirationDate: new Date('2025-12-31'),
      minimumStock: 10,
      notes: 'Heirloom variety, save seeds from best plants'
    },
    {
      name: 'Organic Compost',
      category: 'soil-amendments',
      quantity: 5,
      unit: 'cubic yards',
      cost: 150.00,
      supplier: 'Local Farm Co-op',
      location: 'Compost Bin Area',
      minimumStock: 1,
      notes: 'Well-aged, perfect for spring soil prep'
    },
    {
      name: 'Bamboo Stakes - 6ft',
      category: 'tools',
      quantity: 20,
      unit: 'pieces',
      cost: 24.99,
      supplier: 'Garden Center Plus',
      location: 'Tool Shed - Wall Mount',
      minimumStock: 5,
      notes: 'For supporting tall plants like tomatoes'
    },
    {
      name: 'Drip Irrigation Tubing',
      category: 'irrigation',
      quantity: 100,
      unit: 'feet',
      cost: 45.00,
      supplier: 'Irrigation Supply Co',
      location: 'Garage - Shelf 2',
      minimumStock: 25,
      notes: '1/4 inch tubing for micro-irrigation'
    },
    {
      name: 'Organic Fertilizer - All Purpose',
      category: 'fertilizers',
      quantity: 2,
      unit: 'bags (50lb)',
      cost: 89.98,
      supplier: 'Organic Gardens Inc',
      location: 'Tool Shed - Floor',
      expirationDate: new Date('2024-06-30'),
      minimumStock: 1,
      notes: '4-4-4 NPK ratio, slow release'
    },
    {
      name: 'Garden Gloves - Medium',
      category: 'tools',
      quantity: 3,
      unit: 'pairs',
      cost: 21.97,
      supplier: 'Hardware Store',
      location: 'Tool Shed - Hook',
      minimumStock: 2,
      notes: 'Waterproof with grip coating'
    },
    {
      name: 'Mulch - Straw',
      category: 'mulch',
      quantity: 10,
      unit: 'bales',
      cost: 60.00,
      supplier: 'Farm Supply Store',
      location: 'Side Yard - Covered',
      minimumStock: 3,
      notes: 'Excellent for vegetable garden paths'
    },
    {
      name: 'Seed Starting Trays',
      category: 'containers',
      quantity: 8,
      unit: 'trays (72-cell)',
      cost: 32.00,
      supplier: 'Greenhouse Supply',
      location: 'Garage - Shelf 1',
      minimumStock: 2,
      notes: 'Reusable plastic trays for seed starting'
    },
    {
      name: 'pH Test Kit',
      category: 'testing',
      quantity: 1,
      unit: 'kit',
      cost: 12.99,
      supplier: 'Garden Center Plus',
      location: 'Tool Shed - Drawer',
      expirationDate: new Date('2024-12-31'),
      minimumStock: 1,
      notes: 'Digital soil pH meter with probe'
    },
    {
      name: 'Neem Oil Concentrate',
      category: 'pest-control',
      quantity: 1,
      unit: 'bottle (32oz)',
      cost: 18.95,
      supplier: 'Organic Solutions',
      location: 'Tool Shed - Chemical Cabinet',
      expirationDate: new Date('2025-03-15'),
      minimumStock: 1,
      notes: 'Organic pest and disease control'
    }
  ];

  await Inventory.deleteMany({});
  const createdInventory = await Inventory.insertMany(inventory);
  console.log(`✅ Created ${createdInventory.length} inventory items`);
  return createdInventory;
};

const seedHarvests = async (plants) => {
  console.log('🌾 Seeding harvests...');
  
  const lettuceId = plants.find(p => p.name === 'Lettuce')?._id;
  
  const harvests = [
    {
      plant: lettuceId,
      harvestDate: new Date('2023-05-12'),
      quantity: 8,
      unit: 'heads',
      weight: 2.5,
      quality: 'excellent',
      storageMethod: 'refrigerated',
      storageLocation: 'Kitchen refrigerator',
      notes: 'Perfect timing, crispy and sweet heads',
      estimatedValue: 24.00
    },
    {
      plant: plants.find(p => p.name === 'Basil')?._id,
      harvestDate: new Date('2023-06-01'),
      quantity: 2,
      unit: 'cups',
      weight: 0.5,
      quality: 'good',
      storageMethod: 'dried',
      storageLocation: 'Pantry - Herb Jars',
      notes: 'First major harvest, made pesto',
      estimatedValue: 8.00
    },
    {
      plant: plants.find(p => p.name === 'Basil')?._id,
      harvestDate: new Date('2023-06-15'),
      quantity: 1.5,
      unit: 'cups',
      weight: 0.3,
      quality: 'excellent',
      storageMethod: 'fresh',
      storageLocation: 'Used immediately',
      notes: 'Perfect for caprese salad',
      estimatedValue: 6.00
    }
  ];

  await Harvest.deleteMany({});
  const createdHarvests = await Harvest.insertMany(harvests);
  console.log(`✅ Created ${createdHarvests.length} harvest records`);
  return createdHarvests;
};

// Additional realistic plants for better testing
const additionalPlants = [
  {
    name: 'Cherry Tomatoes',
    variety: 'Sweet 100',
    category: 'vegetable',
    plantingDate: new Date('2024-03-15'),
    expectedHarvestDate: new Date('2024-06-15'),
    location: 'Greenhouse Shelf A',
    status: 'flowering',
    notes: 'Excellent for fresh eating and salads. Very productive variety.',
    careInstructions: 'Water daily, support with stakes, pinch suckers',
    isActive: true
  },
  {
    name: 'Buttercrunch Lettuce',
    variety: 'Buttercrunch',
    category: 'vegetable',
    plantingDate: new Date('2024-02-20'),
    expectedHarvestDate: new Date('2024-04-20'),
    location: 'Cold Frame',
    status: 'ready_to_harvest',
    notes: 'Cool season crop, perfect for spring harvests',
    careInstructions: 'Keep soil moist, harvest outer leaves first',
    isActive: true
  },
  {
    name: 'Purple Basil',
    variety: 'Dark Opal',
    category: 'herb',
    plantingDate: new Date('2024-04-01'),
    expectedHarvestDate: new Date('2024-05-15'),
    location: 'Herb Garden',
    status: 'growing',
    notes: 'Beautiful purple leaves, great for cooking and garnish',
    careInstructions: 'Pinch flowers to encourage leaf growth, water regularly',
    isActive: true
  },
  {
    name: 'Sunflowers',
    variety: 'Mammoth Russian',
    category: 'flower',
    plantingDate: new Date('2024-04-10'),
    expectedHarvestDate: new Date('2024-08-15'),
    location: 'Back Fence',
    status: 'growing',
    notes: 'Giant variety that can reach 12 feet tall',
    careInstructions: 'Full sun, deep watering, may need staking',
    isActive: true
  },
  {
    name: 'Zucchini',
    variety: 'Black Beauty',
    category: 'vegetable',
    plantingDate: new Date('2024-04-20'),
    expectedHarvestDate: new Date('2024-06-20'),
    location: 'Vegetable Bed 3',
    status: 'planted',
    notes: 'Prolific producer, harvest when 6-8 inches long',
    careInstructions: 'Space well for air circulation, regular watering',
    isActive: true
  }
];

// Additional inventory items
const additionalInventory = [
  {
    name: 'Organic Bone Meal',
    category: 'fertilizer',
    quantity: 5,
    unit: 'lbs',
    cost: 12.99,
    supplier: 'Garden Supply Co',
    purchaseDate: new Date('2024-02-15'),
    expirationDate: new Date('2026-02-15'),
    location: 'Shed - Shelf B',
    minimumStock: 2,
    notes: 'Slow-release phosphorus for root development'
  },
  {
    name: 'Copper Fungicide',
    category: 'pesticide',
    quantity: 1,
    unit: 'bottle',
    cost: 8.50,
    supplier: 'Organic Solutions',
    purchaseDate: new Date('2024-03-01'),
    expirationDate: new Date('2025-03-01'),
    location: 'Shed - Chemical Cabinet',
    minimumStock: 1,
    notes: 'For organic disease control on fruits and vegetables'
  },
  {
    name: 'Drip Irrigation Tubing',
    category: 'tools',
    quantity: 100,
    unit: 'feet',
    cost: 25.00,
    supplier: 'Irrigation Direct',
    purchaseDate: new Date('2024-01-20'),
    location: 'Shed - Storage Bin',
    minimumStock: 50,
    notes: '1/4 inch tubing for micro-irrigation systems'
  },
  {
    name: 'Heirloom Pepper Seeds',
    category: 'seeds',
    quantity: 8,
    unit: 'packets',
    cost: 32.00,
    supplier: 'Heritage Seeds',
    purchaseDate: new Date('2024-01-15'),
    expirationDate: new Date('2026-01-15'),
    location: 'House - Refrigerator',
    minimumStock: 3,
    notes: 'Mixed variety pack including hot and sweet peppers'
  }
];

// Additional harvest records
const additionalHarvests = [
  {
    plant: null, // Will be populated with actual plant ID
    harvestDate: new Date('2024-03-10'),
    quantity: 2.5,
    unit: 'lbs',
    quality: 'excellent',
    notes: 'Perfect ripeness, great flavor',
    storageMethod: 'fresh',
    storageLocation: 'Kitchen counter',
    estimatedValue: 8.50
  },
  {
    plant: null, // Will be populated with actual plant ID
    harvestDate: new Date('2024-02-28'),
    quantity: 1.2,
    unit: 'lbs',
    quality: 'good',
    notes: 'Tender leaves, harvested before flowering',
    storageMethod: 'refrigerated',
    storageLocation: 'Refrigerator crisper',
    estimatedValue: 4.80
  },
  {
    plant: null, // Will be populated with actual plant ID
    harvestDate: new Date('2024-03-20'),
    quantity: 0.5,
    unit: 'lbs',
    quality: 'excellent',
    notes: 'Aromatic and flavorful, perfect for pesto',
    storageMethod: 'dried',
    storageLocation: 'Pantry',
    estimatedValue: 12.00
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Plant.deleteMany({});
    await Inventory.deleteMany({});
    await Harvest.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create plants (combine original and additional)
    const allPlants = [...plants, ...additionalPlants];
    const createdPlants = await Plant.insertMany(allPlants);
    console.log(`Created ${createdPlants.length} plants`);
    
    // Create inventory items (combine original and additional)
    const allInventory = [...inventory, ...additionalInventory];
    const createdInventory = await Inventory.insertMany(allInventory);
    console.log(`Created ${createdInventory.length} inventory items`);
    
    // Create harvest records (combine original and additional)
    const allHarvests = [...harvests, ...additionalHarvests];
    // Assign random plants to harvests
    const harvestsWithPlants = allHarvests.map(harvest => ({
      ...harvest,
      plant: createdPlants[Math.floor(Math.random() * createdPlants.length)]._id
    }));
    
    const createdHarvests = await Harvest.insertMany(harvestsWithPlants);
    console.log(`Created ${createdHarvests.length} harvest records`);
    
    console.log('Database seeded successfully!');
    console.log(`Total records: ${createdPlants.length} plants, ${createdInventory.length} inventory, ${createdHarvests.length} harvests`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedPlants,
  seedInventory,
  seedHarvests
}; 