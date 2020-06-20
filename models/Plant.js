const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true,
    maxlength: [100, 'Plant name cannot exceed 100 characters']
  },
  variety: {
    type: String,
    trim: true,
    maxlength: [50, 'Variety name cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['vegetables', 'fruits', 'herbs', 'flowers', 'trees', 'shrubs', 'other'],
      message: 'Category must be one of: vegetables, fruits, herbs, flowers, trees, shrubs, other'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['planted', 'seedling', 'growing', 'flowering', 'fruiting', 'harvested', 'dormant', 'failed'],
      message: 'Status must be one of: planted, seedling, growing, flowering, fruiting, harvested, dormant, failed'
    },
    default: 'planted'
  },
  plantedDate: {
    type: Date,
    required: [true, 'Planted date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Planted date cannot be in the future'
    }
  },
  expectedHarvestDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > this.plantedDate;
      },
      message: 'Expected harvest date must be after planted date'
    }
  },
  harvestDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= this.plantedDate;
      },
      message: 'Harvest date must be on or after planted date'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [300, 'Care instructions cannot exceed 300 characters']
  },
  lastCareDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since planted
plantSchema.virtual('daysSincePlanted').get(function() {
  if (!this.plantedDate) return null;
  const diffTime = Math.abs(new Date() - this.plantedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until expected harvest
plantSchema.virtual('daysUntilHarvest').get(function() {
  if (!this.expectedHarvestDate) return null;
  const diffTime = this.expectedHarvestDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for growth stage percentage (rough estimate)
plantSchema.virtual('growthProgress').get(function() {
  if (!this.plantedDate || !this.expectedHarvestDate) return null;
  const totalTime = this.expectedHarvestDate - this.plantedDate;
  const elapsedTime = new Date() - this.plantedDate;
  const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  return Math.round(progress);
});

// Index for common queries
plantSchema.index({ category: 1, status: 1 });
plantSchema.index({ plantedDate: -1 });
plantSchema.index({ expectedHarvestDate: 1 });
plantSchema.index({ location: 1 });

// Pre-save middleware
plantSchema.pre('save', function(next) {
  if (this.plantingDate && this.plantingDate > new Date()) {
    return next(new Error('Planting date cannot be in the future'));
  }
  
  // Bug: This will prevent updating existing plants
  if (this.expectedHarvestDate && this.expectedHarvestDate < this.plantingDate) {
    return next(new Error('Expected harvest date must be after planting date'));
  }
  
  // Auto-update status based on harvest date
  if (this.harvestDate && this.status !== 'harvested') {
    this.status = 'harvested';
  }
  
  // Ensure consistent data
  if (this.status === 'failed' || this.status === 'harvested') {
    this.isActive = false;
  }
  
  next();
});

// Static methods
plantSchema.statics.getActiveCount = function() {
  return this.countDocuments({ isActive: true });
};

plantSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ plantedDate: -1 });
};

plantSchema.statics.getHarvestReady = function() {
  const today = new Date();
  return this.find({
    expectedHarvestDate: { $lte: today },
    status: { $nin: ['harvested', 'failed'] },
    isActive: true
  }).sort({ expectedHarvestDate: 1 });
};

// Instance methods
plantSchema.methods.markAsHarvested = function(harvestDate = new Date()) {
  this.status = 'harvested';
  this.harvestDate = harvestDate;
  this.isActive = false;
  return this.save();
};

plantSchema.methods.updateCareDate = function() {
  this.lastCareDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Plant', plantSchema); 