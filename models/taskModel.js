const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  taskName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  //   time: '14:30'
  //   date: '5/12/2023' (input in DD/MM/YYYY format)
  //   duration: 90 (in minutes)
  time: {
    type: String,
    required: true,
    validate: {
      validator: function (inputTime) {
        return moment(inputTime, "hh:mm a", true).isValid();
      },
      message: "Invalid time format. Please use HH:mm AM/PM format.",
    },
    // Custom setter to parse and convert the input time string in HH:mm AM/PM format
    set: function (inputTime) {
      return moment(inputTime, "hh:mm a").format("hh:mm A");
    },
  },

  date: {
    type: Date,
    required: true,
  },

  duration: {
    //input like 90 minutes for the task
    type: Number,
    required: true,
  },

  state: {
    type: String,
    enum: ["finished", "in-progress", "late"],
    required: true,
  },

  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    required: true,
  },

  category: {
    type: String,
    enum: [
      "personal",
      "work",
      "meeting",
      "shopping",
      "exercise",
      "study",
      "appointment",
      "other",
    ],
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
