const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  medName: {
    type: String,
    required: true,
  },
  Dose: {
    type: Number,
    required: true,
    integer: true,
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
