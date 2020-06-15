const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['seeds', 'tools', 'fertilizer', 'pesticide', 'soil', 'containers', 'equipment', 'other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'packets', 'pounds', 'ounces', 'gallons', 'liters', 'bags', 'bottles']
  },
  location: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date
  },
  expirationDate: {
    type: Date
  },
  supplier: {
    type: String
  },
  cost: {
    type: Number,
    min: 0
  },
  minimumStock: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

InventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minimumStock;
});

module.exports = mongoose.model('Inventory', InventorySchema); 