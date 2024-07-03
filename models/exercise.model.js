const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  isChosen: {
    type: Boolean,
    default: false,
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  sets: {
    type: Number,
  },
  repeats: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  bodyPart: {
    type: String,
  },
  equipment: {
    type: String,
  },
  gifUrl: {
    type: String,
  },
  target: {
    type: String,
  },
  secondaryMuscles: {
    type: [String],
  },
  instructions: {
    type: [String],
  },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
