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

  describe('POST /api/plants', () => {
    it('should create a new plant', async () => {
      const plantData = {
        name: 'Tomato',
        variety: 'Cherry',
        category: 'vegetable',
        plantedDate: '2020-05-01',
        location: 'Garden Bed 1',
        status: 'seedling'
      };

      const response = await request(app)
        .post('/api/plants')
        .send(plantData)
        .expect(201);

      expect(response.body.name).toBe(plantData.name);
      expect(response.body.variety).toBe(plantData.variety);
      expect(response.body.category).toBe(plantData.category);
    });

    it('should return 400 for invalid plant data', async () => {
      const invalidData = {
        name: '', // Empty name
        category: 'invalid_category'
      };

      await request(app)
        .post('/api/plants')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /api/plants', () => {
    it('should return all plants', async () => {
      const plant1 = new Plant({
        name: 'Tomato',
        category: 'vegetable',
        plantedDate: new Date(),
        location: 'Garden Bed 1'
      });

      const plant2 = new Plant({
        name: 'Basil',
        category: 'herb',
        plantedDate: new Date(),
        location: 'Herb Garden'
      });

      await plant1.save();
      await plant2.save();

      const response = await request(app)
        .get('/api/plants')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Basil'); // Should be sorted by createdAt desc
    });
  });

  describe('GET /api/plants/:id', () => {
    it('should return a specific plant', async () => {
      const plant = new Plant({
        name: 'Lettuce',
        category: 'vegetable',
        plantedDate: new Date(),
        location: 'Container 1'
      });

      await plant.save();

      const response = await request(app)
        .get(`/api/plants/${plant._id}`)
        .expect(200);

      expect(response.body.name).toBe('Lettuce');
    });

    it('should return 404 for non-existent plant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/plants/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /api/plants/:id', () => {
    it('should update a plant', async () => {
      const plant = new Plant({
        name: 'Pepper',
        category: 'vegetable',
        plantedDate: new Date(),
        location: 'Garden Bed 2',
        status: 'seedling'
      });

      await plant.save();

      const updateData = {
        status: 'growing',
        notes: 'Growing well!'
      };

      const response = await request(app)
        .put(`/api/plants/${plant._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('growing');
      expect(response.body.notes).toBe('Growing well!');
    });
  });

  describe('DELETE /api/plants/:id', () => {
    it('should delete a plant', async () => {
      const plant = new Plant({
        name: 'Cucumber',
        category: 'vegetable',
        plantedDate: new Date(),
        location: 'Greenhouse'
      });

      await plant.save();

      await request(app)
        .delete(`/api/plants/${plant._id}`)
        .expect(200);

      const deletedPlant = await Plant.findById(plant._id);
      expect(deletedPlant).toBeNull();
    });
  });
}); 