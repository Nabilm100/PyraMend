//services/workout.services.js

const Workout = require("../models/workout.model");
const Exercise = require("../models/exercise.model");

async function addWorkout(exercises, date) {
  // Ensure no duplicate exercises in the workout
  const uniqueExercises = [...new Set(exercises)];
  if (uniqueExercises.length !== exercises.length) {
    throw new Error("Duplicate exercises found in the workout");
  }

  // Ensure all exercises exist in the database
  const exercisePromises = uniqueExercises.map((id) => Exercise.findById(id));
  const foundExercises = await Promise.all(exercisePromises);
  if (foundExercises.some((exercise) => !exercise)) {
    throw new Error("Some exercises do not exist");
  }

  // Check for duplicate workout with the same exercises and date
  const existingWorkout = await Workout.findOne({
    exercises: { $all: uniqueExercises, $size: uniqueExercises.length },
    date,
  });
  if (existingWorkout) {
    throw new Error("Duplicate workout found");
  }

  const workout = new Workout({ exercises: uniqueExercises, date });
  return await workout.save();
}

async function getWorkoutsForDate(date) {
  return await Workout.find({ date });
}

async function getAllWorkouts() {
  return await Workout.find();
}

module.exports = {
  addWorkout,
  getWorkoutsForDate,
  getAllWorkouts,
};
