// services/exercise.services.js
const Exercise = require("../models/exercise.model");

// Function to create a new exercise
async function createExercise(exerciseData) {
  try {
    const exercise = new Exercise(exerciseData);
    await exercise.save();
    return exercise;
  } catch (error) {
    throw new Error("Failed to create exercise");
  }
}

// Function to get all exercises
async function getAllExercises() {
  try {
    const exercises = await Exercise.find();
    return exercises;
  } catch (error) {
    throw new Error("Failed to fetch exercises");
  }
}

// Function to update an exercise by ID
async function updateExercise(exerciseId, updatedData) {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(
      exerciseId,
      updatedData,
      { new: true }
    );
    return updatedExercise;
  } catch (error) {
    throw new Error("Failed to update exercise");
  }
}

// Function to get an exercise by ID
async function getExerciseById(exerciseId) {
  try {
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      throw new Error("Exercise not found");
    }
    return exercise;
  } catch (error) {
    throw new Error(`Failed to fetch exercise with ID ${exerciseId}`);
  }
}

// Function to delete an exercise by ID
async function deleteExercise(exerciseId) {
  try {
    await Exercise.findByIdAndDelete(exerciseId);
  } catch (error) {
    throw new Error("Failed to delete exercise");
  }
}

module.exports = {
  createExercise,
  getAllExercises,
  updateExercise,
  getExerciseById,
  deleteExercise,
};
