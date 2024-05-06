const mongoose = require('mongoose');

// Define the schema for the Food model
const foodSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  ingredients: [String],
  ingredients_raw: [String],
  steps: [String],
  servings: Number,
  serving_size: String,
  tags: [String]
});

// Create the Food model using the schema
const Food = mongoose.model('Food', foodSchema);


module.exports = Food;
