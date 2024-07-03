const axios = require("axios");
const Exercise = require("../models/exercise.model");

async function fetchExercisesByBodyPart(bodyPart) {
  try {
    // Modify body part based on conditions
    const bodyPartMapping = {
      upperlegs: "upper%20legs",
      lowerlegs: "lower%20legs",
      upperarm: "upper%20arms",
      lowerarm: "lower%20arms",
    };
    bodyPart = bodyPartMapping[bodyPart.toLowerCase()] || bodyPart;

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
    console.log("Fetched exercises:", response.data); // Log fetched data
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch exercises from external API:",
      error.message
    );
    throw new Error("Failed to fetch exercises from external API");
  }
}

async function saveExercisesToDatabase(bodyPart) {
  try {
    const fetchedExercises = await fetchExercisesByBodyPart(bodyPart);
    const savedExercises = [];

    for (const exerciseData of fetchedExercises) {
      const exercise = await Exercise.findOneAndUpdate(
        { name: exerciseData.name },
        {
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
        },
        { new: true, upsert: true } // Create the document if it doesn't exist
      );
      console.log("Saved exercise:", exercise); // Log saved exercise
      savedExercises.push(exercise);
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
