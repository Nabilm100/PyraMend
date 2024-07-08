// models/workout.model.js

const mongoose = require("mongoose");

// Define the schema for the workout model
const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  exercises: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
    },
  ],
  date: {
    type: Number,
    required: true,
  },
});

// Create and export the Workout model
const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
