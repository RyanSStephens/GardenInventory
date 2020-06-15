const mongoose = require('mongoose');

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetable', 'fruit', 'herb', 'flower', 'tree', 'shrub']
  },
  plantedDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['seed', 'seedling', 'growing', 'flowering', 'fruiting', 'harvested', 'dormant'],
    default: 'seed'
  },
  notes: {
    type: String
  },
  expectedHarvestDate: {
    type: Date
  },
  wateringSchedule: {
    frequency: String,
    lastWatered: Date
  },
  fertilizing: {
    type: String
  },
  companions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Plant', PlantSchema); 