const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  veryActiveMinutes: {
    type: Number,
    default: 0,
  },
  fairlyActiveMinutes: {
    type: Number,
    default: 0,
  },
  lightlyActiveMinutes: {
    type: Number,
    default: 0,
  },
  sedentaryMinutes: {
    type: Number,
    default: 0,
  },
});

// Remove any existing unique index on dayOfWeek
activitySchema.index({ dayOfWeek: 1 }, { unique: false });

activitySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
