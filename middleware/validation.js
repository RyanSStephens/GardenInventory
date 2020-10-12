const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validatePlant = [
  body('name').notEmpty().withMessage('Plant name is required'),
  body('category').isIn(['vegetable', 'fruit', 'herb', 'flower', 'tree', 'shrub'])
    .withMessage('Invalid plant category'),
  body('plantedDate').isISO8601().withMessage('Invalid planted date'),
  body('location').notEmpty().withMessage('Location is required'),
  handleValidationErrors
];

const validateInventory = [
  body('name').notEmpty().withMessage('Item name is required'),
  body('category').isIn(['seeds', 'tools', 'fertilizer', 'pesticide', 'soil', 'containers', 'equipment', 'other'])
    .withMessage('Invalid inventory category'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').isIn(['pieces', 'packets', 'pounds', 'ounces', 'gallons', 'liters', 'bags', 'bottles'])
    .withMessage('Invalid unit'),
  body('location').notEmpty().withMessage('Location is required'),
  handleValidationErrors
];

const validateHarvest = [
  body('plant').isMongoId().withMessage('Valid plant ID is required'),
  body('harvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').isIn(['pounds', 'ounces', 'pieces', 'bunches', 'heads', 'cups', 'quarts', 'gallons'])
    .withMessage('Invalid unit'),
  handleValidationErrors
];

module.exports = {
  validatePlant,
  validateInventory,
  validateHarvest,
  handleValidationErrors
}; 