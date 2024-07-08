// exercise.controller.js
const Exercise = require("../models/exercise.model");
const DayDistance = require("../models/distanceModel");
const Activity = require("../models/minutesModel");
const axios = require("axios");
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

//--------------------------------------

const calculateDistance = (gender, steps) => {
  const distancePerStep = gender === "male" ? 0.78 : 0.7;
  const distanceInMeters = steps * distancePerStep;
  const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
  return distanceInKilometers;
};

const createOrUpdateDayDistance = async (req, res) => {
  try {
    const { day, gender, steps } = req.body;
    const userId = req.user._id; // Assuming userId is available in req.user

    if (!["male", "female"].includes(gender)) {
      return res.status(400).send("Invalid gender");
    }

    if (!["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(day)) {
      return res.status(400).send("Invalid day");
    }

    const distance = calculateDistance(gender, steps);

    let dayDistance = await DayDistance.findOne({ userId, day });

    if (dayDistance) {
      dayDistance.distance = distance;
    } else {
      dayDistance = new DayDistance({ userId, day, distance });
    }

    await dayDistance.save();
    res
      .status(201)
      .json({ success: "Steps data sent successfully", dayDistance });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

// Controller to get all day distances
const getAllDayDistances = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is available in req.user

    const dayDistances = await DayDistance.find({ userId });
    res.status(200).json({ data: dayDistances });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
const calculateMinutes = (steps, gender, day) => {
  // Calculate total minutes
  const totalMinutes = steps * (gender === "male" ? 0.13 : 0.12); // Adjust for gender, assuming male as 75% and female as 65%

  // Calculate percentages
  const veryActivePercent = 0.05;
  const fairlyActivePercent = 0.01;
  const lightlyActivePercent = 0.37;
  const sedentaryPercent = 0.57;

  // Calculate minutes for each type
  const veryActiveMinutes = Math.round(totalMinutes * veryActivePercent);
  const fairlyActiveMinutes = Math.round(totalMinutes * fairlyActivePercent);
  const lightlyActiveMinutes = Math.round(totalMinutes * lightlyActivePercent);
  const sedentaryMinutes = Math.round(totalMinutes * sedentaryPercent);

  return {
    veryActiveMinutes,
    fairlyActiveMinutes,
    lightlyActiveMinutes,
    sedentaryMinutes,
  };
};

const createActivity = async (req, res) => {
  const { steps, gender, dayOfWeek } = req.body;
  const userId = req.user._id;

  // Validate the presence of required fields
  if (!steps || !gender || !dayOfWeek) {
    return res.status(400).json({
      message: "Invalid input. Please provide steps, gender, and dayOfWeek.",
    });
  }

  // Validate that dayOfWeek is one of the valid enum values
  const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (!validDays.includes(dayOfWeek)) {
    return res.status(400).json({
      message: "Invalid day of the week. Please provide a valid dayOfWeek.",
    });
  }

  try {
    // Check if activity for the user and dayOfWeek already exists
    let activity = await Activity.findOne({ userId, dayOfWeek });

    if (activity) {
      // Update existing activity
      const {
        veryActiveMinutes,
        fairlyActiveMinutes,
        lightlyActiveMinutes,
        sedentaryMinutes,
      } = calculateMinutes(steps, gender, dayOfWeek);

      activity.totalSteps = steps;
      activity.veryActiveMinutes = veryActiveMinutes;
      activity.fairlyActiveMinutes = fairlyActiveMinutes;
      activity.lightlyActiveMinutes = lightlyActiveMinutes;
      activity.sedentaryMinutes = sedentaryMinutes;

      await activity.save();

      res
        .status(200)
        .json({ message: "Activity updated successfully", activity });
    } else {
      // Create new activity
      const {
        veryActiveMinutes,
        fairlyActiveMinutes,
        lightlyActiveMinutes,
        sedentaryMinutes,
      } = calculateMinutes(steps, gender, dayOfWeek);

      const newActivity = new Activity({
        userId,
        dayOfWeek,
        totalSteps: steps,
        veryActiveMinutes,
        fairlyActiveMinutes,
        lightlyActiveMinutes,
        sedentaryMinutes,
      });

      await newActivity.save();

      res.status(201).json({
        message: "Activity recorded successfully",
        activity: newActivity,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to record activity", error: err.message });
  }
};

const getAllActivities = async (req, res) => {
  const userId = req.user._id;

  try {
    const activities = await Activity.find({ userId });
    res.status(200).json(activities);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch activities", error: err.message });
  }
};

const sendAllActivitiesToAnotherAPI = async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch all activities from the database for the logged-in user
    const activities = await Activity.find({ userId });

    // Process activities data to match the required format
    const processedActivities = activities.map((activity) => ({
      TotalSteps: activity.totalSteps,
      VeryActiveMinutes: activity.veryActiveMinutes,
      FairlyActiveMinutes: activity.fairlyActiveMinutes,
      LightlyActiveMinutes: activity.lightlyActiveMinutes,
      SedentaryMinutes: activity.sedentaryMinutes,
    }));

    // Log the payload to be sent
    console.log("Payload to be sent:", processedActivities);

    // Define the target API URL
    const targetApiUrl = "https://calories.pythonanywhere.com/predict";

    // Array to store activities with calories
    let activitiesWithCalories = [];

    // Send the data to the target API and capture response
    for (const activity of processedActivities) {
      try {
        const response = await axios.post(targetApiUrl, activity);
        console.log("Response from the target API:", response.data);

        // Assuming the response contains calories field
        const calories = response.data.calories; // Adjust according to actual response structure

        // Update the activity object with calories
        const activityWithCalories = {
          ...activity,
          calories: calories,
        };

        activitiesWithCalories.push(activityWithCalories);
      } catch (err) {
        console.error("Error for activity:", activity, err.response.data);
        res.status(400).json({
          message: "Failed to fetch or send activities",
          error: err.response.data,
        });
        return;
      }
    }

    // Return activities with calories to the client
    res.status(200).json({ activities: activitiesWithCalories });
  } catch (err) {
    console.error("Error sending activities to another API:", err); // Log the error
    res.status(500).json({
      message: "Failed to fetch or send activities",
      error: err.message,
    });
  }
};
const getCalories = async (req, res) => {
  const { dayOfWeek } = req.body;
  const userId = req.user._id;

  // Validate the presence of required parameters
  if (!userId || !dayOfWeek) {
    return res.status(400).json({
      message: "Invalid input. Please provide userId and dayOfWeek.",
    });
  }

  try {
    // Find the activity for the user on the specified day
    const activity = await Activity.findOne({ userId, dayOfWeek });

    if (!activity) {
      return res.status(200).json({ calories: 0 });
    }

    // Prepare the activity data for the external API
    const activityData = {
      TotalSteps: activity.totalSteps,
      VeryActiveMinutes: activity.veryActiveMinutes,
      FairlyActiveMinutes: activity.fairlyActiveMinutes,
      LightlyActiveMinutes: activity.lightlyActiveMinutes,
      SedentaryMinutes: activity.sedentaryMinutes,
    };

    // Define the target API URL
    const targetApiUrl = "https://calories.pythonanywhere.com/predict";

    // Send the data to the target API and capture response
    const response = await axios.post(targetApiUrl, activityData);
    console.log("Response from the target API:", response.data);

    // Assuming the response contains calories field
    const calories = response.data.calories; // Adjust according to actual response structure

    // Return the calories to the client
    res.status(200).json({ calories });
  } catch (err) {
    console.error("Error fetching or sending activity data:", err); // Log the error
    res.status(500).json({
      message: "Failed to get calories",
      error: err.message,
    });
  }
};

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
  createOrUpdateDayDistance,
  getAllDayDistances,
  createActivity,
  getAllActivities,
  sendAllActivitiesToAnotherAPI,
  getCalories,
};
