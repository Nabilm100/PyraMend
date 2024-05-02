const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mealSchema = new Schema({
  mealName: {
    type: String,
    required: true,
    
  },
  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= new Date(); // Check if the date is not in the past
      },
      message: "Date cannot be in the past.",
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Meal", mealSchema);
