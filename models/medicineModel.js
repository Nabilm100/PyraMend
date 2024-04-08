const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  medName: {
    type: String,
    required: true,
    unique: true
  },
  Dose: {
    type: Number,
    required: true,
    integer: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  pillsDuration: {
    type: String,
    enum: ["BeforeEating", "AfterEating"],
    required: true,
  },
  Notification: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Medicine", medicineSchema);
