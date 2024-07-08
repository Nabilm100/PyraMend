// controllers/workout.controller.js

const WorkoutService = require("../services/workout.services");

// Controller function to add a new workout
async function addWorkout(req, res, next) {
  try {
    const { exercises, date } = req.body;
    if (!exercises || !date) {
      return res
        .status(400)
        .json({ status: "error", message: "Exercises and date are required" });
    }
    const savedWorkout = await WorkoutService.addWorkout(
      req.user.id,
      exercises,
      date
    );
    res.status(201).json({ status: "success", data: savedWorkout });
  } catch (error) {
    console.error("Error adding workout:", error); // Log the error for debugging
    if (
      error.message === "Duplicate workout found" ||
      error.message === "Duplicate exercises found in the workout"
    ) {
      res.status(400).json({ status: "error", message: error.message });
    } else if (error.message === "Some exercises do not exist") {
      res.status(400).json({
        status: "error",
        message: "One or more exercises do not exist in the database",
      });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Something went wrong!" });
    }
  }
}

// Controller function to get workouts for a specific date
async function getWorkoutsForDate(req, res, next) {
  try {
    const { date } = req.params;
    const workouts = await WorkoutService.getWorkoutsForDate(
      req.user.id,
      parseInt(date)
    );
    res.status(200).json(workouts);
  } catch (error) {
    next(error);
  }
}

// Controller function to get all workouts
async function getAllWorkouts(req, res, next) {
  try {
    const workouts = await WorkoutService.getAllWorkouts(req.user.id);
    res.status(200).json(workouts);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addWorkout,
  getWorkoutsForDate,
  getAllWorkouts,
};
