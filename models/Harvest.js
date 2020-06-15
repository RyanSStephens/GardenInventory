const mongoose = require('mongoose');

const HarvestSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  harvestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['pounds', 'ounces', 'pieces', 'bunches', 'heads', 'cups', 'quarts', 'gallons']
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  storage: {
    method: {
      type: String,
      enum: ['fresh', 'frozen', 'canned', 'dried', 'pickled', 'other']
    },
    location: String,
    expectedShelfLife: String
  },
  notes: {
    type: String
  },
  weather: {
    temperature: Number,
    humidity: Number,
    conditions: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Harvest', HarvestSchema); 