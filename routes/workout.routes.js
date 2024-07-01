// routes/workout.routes.js
const express = require("express");
const router = express.Router();
const WorkoutController = require("../controllers/workout.controller");
const { protect } = require("../controllers/authController");

router.use(protect);
// Route to add a new workout
router.post("/workouts", WorkoutController.addWorkout);

// Route to get workouts for a specific date
router.get("/workouts/:date", WorkoutController.getWorkoutsForDate);

// Route to get all workouts
router.get("/workouts", WorkoutController.getAllWorkouts);

module.exports = router;
