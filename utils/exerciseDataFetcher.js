//utils/exerciseDataFetcher.js
const axios = require("axios");
const Exercise = require("../models/exercise.model");

async function fetchExercisesByBodyPart(bodyPart) {
  try {
    // Modify body part based on conditions
    if (bodyPart.toLowerCase() == "upperlegs") {
      bodyPart = "upper%20legs";
    } else if (bodyPart.toLowerCase() == "lowerlegs") {
      bodyPart = "lower%20legs";
    } else if (bodyPart.toLowerCase() == "upperarm") {
      bodyPart = "upper%20arms";
    } else if (bodyPart.toLowerCase() == "lowerarm") {
      bodyPart = "lower%20arms";
    }

    const response = await axios.get(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`,
      {
        params: { limit: 15 },
        headers: {
          "X-RapidAPI-Key":
            "410e57d5a7mshbec52df78536f84p195cd1jsn9117daaf9a44",
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    const fetchedExercises = response.data;
    return fetchedExercises;
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    throw new Error("Failed to fetch exercises");
  }
}

async function saveExercisesToDatabase(bodyPart) {
  try {
    const fetchedExercises = await fetchExercisesByBodyPart(bodyPart);

    // Iterate over fetched exercises and save them to the database
    const savedExercises = [];
    for (const exerciseData of fetchedExercises) {
      const exercise = new Exercise({
        name: exerciseData.name,
        isFinished: false,
        sets: 0,
        repeats: 0,
        weight: 0,
        bodyPart: exerciseData.bodyPart,
        equipment: exerciseData.equipment,
        gifUrl: exerciseData.gifUrl,
        target: exerciseData.target,
        secondaryMuscles: exerciseData.secondaryMuscles,
        instructions: exerciseData.instructions,
      });
      const savedExercise = await exercise.save();
      savedExercises.push(savedExercise);
    }

    return savedExercises;
  } catch (error) {
    console.error(
      "Failed to save exercises to database:",
      error.message,
      error.stack
    );
    throw new Error("Failed to save exercises to database: " + error.message);
  }
}

module.exports = {
  fetchExercisesByBodyPart,
  saveExercisesToDatabase,
};
