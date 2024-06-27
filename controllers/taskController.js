const Task = require("../models/taskModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");

const handleNewTask = async (req, res) => {
  const {
    taskName,
    description,
    category,
    priority,
    state,
    duration,
    date,
    time,
  } = req.body;

  if (
    !taskName ||
    !description ||
    !category ||
    !priority ||
    !state ||
    !duration ||
    !date ||
    !time
  )
    return res.status(400).json({
      message:
        " task name, description, category, priority, state, duration, date and time values are required.",
    });

  try {
    //create and store the new task
    const result = await Task.create({
      taskName: taskName,
      description: description,
      category: category,
      priority: priority,
      state: state,
      duration: duration,
      date: date,
      time: time,
      userId: req.user._id,
    });

    console.log(result);

    res.status(201).json({
      status: "Success",
      message: `The ${taskName} Task has been added successfully`,
      data: req.body,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update task data
const updateTask = async (req, res) => {
  const {
    taskName,
    description,
    category,
    priority,
    state,
    duration,
    date,
    time,
  } = req.body;
  try {
    // Check if the task exists
    const existingTask = await Task.findOne({ taskName, userId: req.user._id });

    if (
      !existingTask ||
      existingTask.userId.toString() !== req.user._id.toString()
    )
      return res.status(400).json({ message: "This task isn't stored." });

    // Update the task fields if provided in the request body
    if (priority) existingTask.priority = priority;
    if (description) existingTask.description = description;
    if (state) existingTask.state = state;
    if (category) existingTask.category = category;
    if (date) existingTask.date = date;
    if (duration) existingTask.duration = duration;
    if (time) existingTask.time = time;

    // Save the updated task
    await existingTask.save();

    return res.json({ success: `${taskName} is updated successfully` });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: "Could not update task" });
  }
};

//Delete task from database
const deleteTask = async (req, res) => {
  const { taskName } = req.body;
  //to check if the taskName to be deleted is already in the db
  const existingTask = await Task.findOne({ taskName, userId: req.user._id });
  console.log(existingTask);
  if (
    !existingTask ||
    existingTask.userId.toString() !== req.user._id.toString()
  )
    return res.status(400).json({ message: "This task isn't stored." });
  const deletedTask = await Task.deleteOne({ taskName });
  console.log(deletedTask);
  if (deletedTask) {
    return res.json({ success: `${taskName} Task is deleted successfully` });
  } else {
    return res.json({ fail: "Could not delete task" });
  }
};

//get tasks of user
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });

    if (tasks.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "You have not added any tasks yet.",
      });
    }

    res.status(201).json({
      status: "success",
      result: tasks.length,
      data: tasks,
    });
  } catch (err) {
    return next(
      new AppError("There is error with sending the list of tasks !", 500)
    );
  }
};

// New function to get tasks by filter (status, date, or category)

const getTasksByFilter = async (req, res) => {
  const { state, date, category, priority } = req.body;

  try {
    // Initialize the filter object with the userId from the request
    let filter = { userId: req.user._id };

    // Add filter criteria if they exist
    if (state) filter.state = state;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Modify the date filter to include tasks with the exact provided date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999); // End of the day

      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Debugging: log the filter criteria
    console.log("Filter criteria:", filter);

    // Find tasks that match the filter criteria
    const tasks = await Task.find(filter);

    // Check if no tasks are found
    if (tasks.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No tasks found with the provided filters.",
      });
    }

    // Return the found tasks
    res.status(200).json({
      status: "success",
      result: tasks.length,
      data: tasks,
    });
  } catch (err) {
    // Log the error and return a 500 status
    console.error("Error fetching tasks:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  handleNewTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByFilter,
};
