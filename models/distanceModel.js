const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dayDistanceSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  day: {
    type: String,
    enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    required: true,
    unique: true,
  },
  distance: {
    type: Number,
    required: true,
  },
});

const DayDistance = mongoose.model("DayDistance", dayDistanceSchema);

module.exports = DayDistance;
