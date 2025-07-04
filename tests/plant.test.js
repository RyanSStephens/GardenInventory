const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Plant = require('../models/Plant');

describe('Plant API', () => {
  beforeAll(async () => {
    const url = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/garden_test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Plant.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/plants', () => {
    it('should return all plants', async () => {
      const plants = [
        {
          name: 'Tomato',
          variety: 'Cherry',
          category: 'vegetables',
          location: 'Garden Bed A',
          plantedDate: new Date('2020-03-01')
        },
        {
          name: 'Basil',
          variety: 'Sweet',
          category: 'herbs',
          location: 'Herb Garden',
          plantedDate: new Date('2020-03-15')
        }
      ];

      await Plant.insertMany(plants);

      const response = await request(app)
        .get('/api/plants')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].name).toBe('Tomato');
    });

    it('should filter plants by category', async () => {
      const plants = [
        {
          name: 'Tomato',
          category: 'vegetables',
          location: 'Garden',
          plantedDate: new Date('2020-03-01')
        },
        {
          name: 'Basil',
          category: 'herbs',
          location: 'Garden',
          plantedDate: new Date('2020-03-15')
        }
      ];

      await Plant.insertMany(plants);

      const response = await request(app)
        .get('/api/plants?category=herbs')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Basil');
    });

    it('should filter plants by status', async () => {
      const plants = [
        {
          name: 'Tomato',
          category: 'vegetables',
          status: 'growing',
          location: 'Garden',
          plantedDate: new Date('2020-03-01')
        },
        {
          name: 'Basil',
          category: 'herbs',
          status: 'harvested',
          location: 'Garden',
          plantedDate: new Date('2020-03-15')
        }
      ];

      await Plant.insertMany(plants);

      const response = await request(app)
        .get('/api/plants?status=growing')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Tomato');
    });
  });

  describe('POST /api/plants', () => {
    it('should create a new plant', async () => {
      const plantData = {
        name: 'Lettuce',
        variety: 'Romaine',
        category: 'vegetables',
        location: 'Garden Bed B',
        plantedDate: '2020-03-01',
        expectedHarvestDate: '2020-04-15',
        notes: 'First planting of the season'
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Lettuce');
      expect(response.body.data.status).toBe('planted');
    });

    it('should return validation error for missing required fields', async () => {
      const plantData = {
        variety: 'Cherry'
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should validate category enum values', async () => {
      const plantData = {
        name: 'Test Plant',
        category: 'invalid-category',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate planted date is not in future', async () => {
      const futureDate = new Date('2020-03-01');
      futureDate.setDate(futureDate.getDate() + 10);

      const plantData = {
        name: 'Test Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: futureDate
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/plants/:id', () => {
    it('should return a specific plant', async () => {
      const plant = new Plant({
        name: 'Carrot',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      });
      await plant.save();

      const response = await request(app)
        .get(`/api/plants/${plant._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Carrot');
    });

    it('should return 404 for non-existent plant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/plants/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ObjectId', async () => {
      const response = await request(app)
        .get('/api/plants/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/plants/:id', () => {
    it('should update a plant', async () => {
      const plant = new Plant({
        name: 'Pepper',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      });
      await plant.save();

      const updateData = {
        name: 'Updated Tomato',
        variety: 'Beefsteak',
        category: 'vegetable',
        plantedDate: '2020-03-01',
        expectedHarvestDate: '2020-04-15',
        location: 'Updated Location',
        status: 'growing'
      };

      const response = await request(app)
        .put(`/api/plants/${plant._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('growing');
      expect(response.body.data.notes).toBe('Plants are doing well');
    });

    it('should auto-update status when harvest date is set', async () => {
      const plant = new Plant({
        name: 'Cucumber',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      });
      await plant.save();

      const updateData = {
        harvestDate: new Date('2020-03-15')
      };

      const response = await request(app)
        .put(`/api/plants/${plant._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe('harvested');
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /api/plants/:id', () => {
    it('should delete a plant', async () => {
      const plant = new Plant({
        name: 'Spinach',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      });
      await plant.save();

      const response = await request(app)
        .delete(`/api/plants/${plant._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedPlant = await Plant.findById(plant._id);
      expect(deletedPlant).toBeNull();
    });
  });

  describe('Plant Model Methods', () => {
    it('should calculate days since planted correctly', async () => {
      const plantedDate = new Date('2020-03-01');
      plantedDate.setDate(plantedDate.getDate() - 10);

      const plant = new Plant({
        name: 'Test Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate
      });

      expect(plant.daysSincePlanted).toBe(10);
    });

    it('should calculate days until harvest correctly', async () => {
      const expectedHarvestDate = new Date('2020-03-15');
      expectedHarvestDate.setDate(expectedHarvestDate.getDate() + 15);

      const plant = new Plant({
        name: 'Test Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01'),
        expectedHarvestDate
      });

      expect(plant.daysUntilHarvest).toBe(15);
    });

    it('should calculate growth progress correctly', async () => {
      const plantedDate = new Date('2020-03-01');
      plantedDate.setDate(plantedDate.getDate() - 30);
      
      const expectedHarvestDate = new Date('2020-03-15');
      expectedHarvestDate.setDate(expectedHarvestDate.getDate() + 30);

      const plant = new Plant({
        name: 'Test Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate,
        expectedHarvestDate
      });

      expect(plant.growthProgress).toBe(50);
    });

    it('should mark plant as harvested correctly', async () => {
      const plant = new Plant({
        name: 'Test Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01')
      });
      await plant.save();

      await plant.markAsHarvested();

      expect(plant.status).toBe('harvested');
      expect(plant.isActive).toBe(false);
      expect(plant.harvestDate).toBeDefined();
    });
  });

  describe('Plant Static Methods', () => {
    beforeEach(async () => {
      const plants = [
        {
          name: 'Active Plant 1',
          category: 'vegetables',
          location: 'Garden',
          plantedDate: new Date('2020-03-01'),
          isActive: true
        },
        {
          name: 'Inactive Plant',
          category: 'vegetables',
          location: 'Garden',
          plantedDate: new Date('2020-03-15'),
          status: 'harvested',
          isActive: false
        },
        {
          name: 'Active Plant 2',
          category: 'herbs',
          location: 'Garden',
          plantedDate: new Date('2020-03-01'),
          isActive: true
        }
      ];
      await Plant.insertMany(plants);
    });

    it('should get active plant count', async () => {
      const count = await Plant.getActiveCount();
      expect(count).toBe(2);
    });

    it('should get plants by category', async () => {
      const vegetables = await Plant.getByCategory('vegetables');
      expect(vegetables.length).toBe(1);
      expect(vegetables[0].name).toBe('Active Plant 1');
    });

    it('should get harvest ready plants', async () => {
      const pastDate = new Date('2020-03-15');
      pastDate.setDate(pastDate.getDate() - 5);

      await Plant.create({
        name: 'Ready Plant',
        category: 'vegetables',
        location: 'Garden',
        plantedDate: new Date('2020-03-01'),
        expectedHarvestDate: pastDate,
        isActive: true
      });

      const readyPlants = await Plant.getHarvestReady();
      expect(readyPlants.length).toBe(1);
      expect(readyPlants[0].name).toBe('Ready Plant');
    });
  });

  describe('Plant API Edge Cases', () => {
    test('should handle invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/plants/invalid-id')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid plant ID format');
    });

    test('should handle non-existent plant ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/plants/${nonExistentId}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Plant not found');
    });

    test('should validate required fields on creation', async () => {
      const response = await request(app)
        .post('/api/plants')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('name');
    });

    test('should handle duplicate plant names gracefully', async () => {
      const plantData = {
        name: 'Duplicate Test Plant',
        variety: 'Test Variety',
        category: 'vegetable'
      };

      // Create first plant
      await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(201);

      // Create second plant with same name (should succeed)
      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(201);
      
      expect(response.body.name).toBe(plantData.name);
      expect(response.body).toHaveProperty('_id');
    });
  });

  describe('Plant Status Transitions', () => {
    let plantId;

    beforeEach(async () => {
      const plantData = {
        name: 'Status Test Plant',
        variety: 'Test Variety',
        category: 'vegetable',
        status: 'planted'
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(201);
      
      plantId = response.body._id;
    });

    test('should transition from planted to growing', async () => {
      const response = await request(app)
        .put(`/api/plants/${plantId}`)
        .send({ status: 'growing' })
        .expect(200);
      
      expect(response.body.status).toBe('growing');
    });

    test('should transition from growing to flowering', async () => {
      // First transition to growing
      await request(app)
        .put(`/api/plants/${plantId}`)
        .send({ status: 'growing' })
        .expect(200);

      // Then transition to flowering
      const response = await request(app)
        .put(`/api/plants/${plantId}`)
        .send({ status: 'flowering' })
        .expect(200);
      
      expect(response.body.status).toBe('flowering');
    });

    test('should handle invalid status transitions', async () => {
      const response = await request(app)
        .put(`/api/plants/${plantId}`)
        .send({ status: 'invalid-status' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid status');
    });
  });

  describe('Plant API Performance', () => {
    test('should handle bulk plant creation efficiently', async () => {
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const plantData = {
          name: `Bulk Plant ${i}`,
          variety: 'Test Variety',
          category: 'vegetable'
        };
        
        promises.push(
          request(app)
            .post('/api/plants')
            .send(plantData)
            .expect(201)
        );
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    test('should paginate large result sets', async () => {
      // Create test plants first
      const promises = [];
      for (let i = 0; i < 25; i++) {
        const plantData = {
          name: `Pagination Plant ${i}`,
          variety: 'Test Variety',
          category: 'vegetable'
        };
        
        promises.push(
          request(app)
            .post('/api/plants')
            .send(plantData)
        );
      }
      
      await Promise.all(promises);
      
      // Test pagination
      const response = await request(app)
        .get('/api/plants?page=1&limit=10')
        .expect(200);
      
      expect(response.body.plants).toHaveLength(10);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage', 1);
    });
  });
}); 