const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Nutrition = new Schema({
  mealName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protien: {
    type: Number,
    required: true,
  },
  carbs: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  sugar: {
    type: Number,
    required: true,
  },

});
module.exports = mongoose.model("Nutrition", Nutrition);
