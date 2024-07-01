const WorkoutService = require("../services/workout.services");

// Controller function to add a new workout
async function addWorkout(req, res, next) {
  try {
    const { exercises, date } = req.body;
    if (!exercises || !date) {
      return res
        .status(400)
        .json({ message: "Exercises and date are required" });
    }
    const savedWorkout = await WorkoutService.addWorkout(exercises, date);
    res.status(201).json(savedWorkout);
  } catch (error) {
    if (
      error.message === "Duplicate workout found" ||
      error.message === "Duplicate exercises found in the workout"
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
}

// Controller function to get workouts for a specific date
async function getWorkoutsForDate(req, res, next) {
  try {
    const { date } = req.params;
    const workouts = await WorkoutService.getWorkoutsForDate(parseInt(date));
    res.status(200).json(workouts);
  } catch (error) {
    next(error);
  }
}

// Controller function to get all workouts
async function getAllWorkouts(req, res, next) {
  try {
    const workouts = await WorkoutService.getAllWorkouts();
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
