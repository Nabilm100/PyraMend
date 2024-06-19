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
    
  },
  calories: {
    type: Number,
    required: true,
  },
  NotificationHour: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // Regular expression to match time in HH:MM format
        return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(value);
      },
      message: "Invalid time format. Time should be in HH:MM format.",
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  taken: {
    type: Boolean,
    default: false,
  },
});

mealSchema.statics.resetTakenValue = function() {
  const Meal = this; 

  
  
    Meal.updateMany({}, { $set: { taken: false } }, function(err, res) {
      if (err) {
        console.error("Error resetting taken value:", err);
      } else {
        console.log("MEAL Taken values reset successfully at 01:00 AM.");
      }
    });
  

  
};


module.exports = mongoose.model("Meal", mealSchema);
