const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waterSchema = new Schema({
  waterTarget: { type: Number },
  inputTarget: { type: Number },
  waterConsumed: { type: Number, default: 0 },
  remainingWater: { type: Number },
  date: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Water", waterSchema);
