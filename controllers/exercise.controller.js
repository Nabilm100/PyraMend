// exercise.controller.js
const Exercise = require("../models/exercise.model");

// Controller function to handle creating a new exercise
async function createExercise(req, res) {
  try {
    const exercise = new Exercise(req.body);
    await exercise.save();
    res.status(201).json({ exercise });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      res
        .status(400)
        .json({ message: "Duplicate exercise found in the database" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}

// Controller function to handle fetching and saving exercises by body part
async function fetchAndSaveExercises(req, res) {
  try {
    const { bodyPart } = req.params;
    const savedExercises = await saveExercisesToDatabase(bodyPart);
    res.status(200).json({
      message: "Exercises fetched and saved successfully",
      exercises: savedExercises,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// Controller function to handle fetching all exercises
async function getAllExercises(req, res) {
  try {
    const exercises = await Exercise.find();
    res.status(200).json({ exercises });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle fetching a single exercise by ID
async function getExerciseById(req, res) {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ exercise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle updating an exercise by ID
async function updateExercise(req, res) {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ exercise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle deleting an exercise by ID
async function deleteExercise(req, res) {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle getting the number of sets for an exercise
async function getExerciseSets(req, res) {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ sets: exercise.sets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle setting the number of sets for an exercise
async function setExerciseSets(req, res) {
  try {
    const { sets } = req.body;
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { sets },
      { new: true }
    );
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ sets: exercise.sets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle getting the  weight for an exercise
async function getExerciseWeight(req, res) {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ weight: exercise.weight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle setting the  weight for an exercise
async function setExerciseWeight(req, res) {
  try {
    const { weight } = req.body;
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { weight },
      { new: true }
    );
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ weight: exercise.weight });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle getting the  weight for an exercise
async function getExerciseRepetitions(req, res) {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ repeats: exercise.repeats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Controller function to handle setting the  weight for an exercise
async function setExerciseRepetitions(req, res) {
  try {
    const { repeats } = req.body;
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      { repeats },
      { new: true }
    );
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ repeats: exercise.repeats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise,
  getExerciseSets,
  setExerciseSets,
  setExerciseWeight,
  getExerciseWeight,
  setExerciseRepetitions,
  getExerciseRepetitions,
  fetchAndSaveExercises,
};
