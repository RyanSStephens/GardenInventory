const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');

// GET all plants
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find().sort({ createdAt: -1 });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET plant by ID
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).populate('companions');
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new plant
router.post('/', async (req, res) => {
  try {
    const plant = new Plant(req.body);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update plant
router.put('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE plant
router.delete('/:id', async (req, res) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET plants by status
router.get('/status/:status', async (req, res) => {
  try {
    const plants = await Plant.find({ status: req.params.status });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET plants by category
router.get('/category/:category', async (req, res) => {
  try {
    const plants = await Plant.find({ category: req.params.category });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 