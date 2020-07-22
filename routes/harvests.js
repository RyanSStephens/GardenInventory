const express = require('express');
const router = express.Router();
const Harvest = require('../models/Harvest');

// GET all harvests
router.get('/', async (req, res) => {
  try {
    const harvests = await Harvest.find()
      .populate('plant', 'name variety category')
      .sort({ harvestDate: -1 });
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET harvest by ID
router.get('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findById(req.params.id)
      .populate('plant', 'name variety category location');
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    res.json(harvest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new harvest
router.post('/', async (req, res) => {
  try {
    const harvest = new Harvest(req.body);
    const savedHarvest = await harvest.save();
    const populatedHarvest = await Harvest.findById(savedHarvest._id)
      .populate('plant', 'name variety category');
    res.status(201).json(populatedHarvest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update harvest
router.put('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('plant', 'name variety category');
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    res.json(harvest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE harvest
router.delete('/:id', async (req, res) => {
  try {
    const harvest = await Harvest.findByIdAndDelete(req.params.id);
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    res.json({ message: 'Harvest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET harvests by plant
router.get('/plant/:plantId', async (req, res) => {
  try {
    const harvests = await Harvest.find({ plant: req.params.plantId })
      .sort({ harvestDate: -1 });
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET harvest statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Harvest.aggregate([
      {
        $group: {
          _id: null,
          totalHarvests: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          averageQuantity: { $avg: '$quantity' }
        }
      }
    ]);
    
    const monthlyStats = await Harvest.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$harvestDate' },
            month: { $month: '$harvestDate' }
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overall: stats[0] || { totalHarvests: 0, totalQuantity: 0, averageQuantity: 0 },
      monthly: monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 