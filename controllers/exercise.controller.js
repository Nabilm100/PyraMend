// exercise.controller.js
const Exercise = require("../models/exercise.model");
const DayDistance = require("../models/distanceModel");
const Activity  = require("../models/minutesModel");
const axios = require('axios');
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
  const distancePerStep = gender === 'male' ? 0.78 : 0.7;
  const distanceInMeters = steps * distancePerStep;
  const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
  return distanceInKilometers;
};

const createOrUpdateDayDistance = async (req, res) => {
  try {
    const { day, gender, steps } = req.body;

    if (!['male', 'female'].includes(gender)) {
      return res.status(400).send('Invalid gender');
    }

    if (!['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(day)) {
      return res.status(400).send('Invalid day');
    }

    const distance = calculateDistance(gender, steps);

    let dayDistance = await DayDistance.findOne({ day });
    if (dayDistance) {
      dayDistance.distance = distance;
    } else {
      dayDistance = new DayDistance({ day, distance });
    }

    await dayDistance.save();
    res.status(201).json({success:"Steps data sent Succesfully",dayDistance});
  } catch (error) {
    res.status(400).json(error.message);
  }
};

// Controller to get all day distances
const getAllDayDistances = async (req, res) => {
  try {
    const dayDistances = await DayDistance.find();
    res.status(200).json({data: dayDistances});
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const calculateMinutes = (steps, gender, day) => {
  // Calculate total minutes
  const totalMinutes = steps * (gender === 'male' ? 0.13 : 0.12); // Adjust for gender, assuming male as 75% and female as 65%

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
      sedentaryMinutes
  };
};

const createActivity = async (req, res) => {
  const { steps, gender, day } = req.body;

  try {
      // Check if activity for the day already exists
      let activity = await Activity.findOne({ dayOfWeek: day });

      if (activity) {
          // Update existing activity
          const { veryActiveMinutes, fairlyActiveMinutes, lightlyActiveMinutes, sedentaryMinutes } = calculateMinutes(steps, gender, day);

          activity.totalSteps = steps;
          activity.veryActiveMinutes = veryActiveMinutes;
          activity.fairlyActiveMinutes = fairlyActiveMinutes;
          activity.lightlyActiveMinutes = lightlyActiveMinutes;
          activity.sedentaryMinutes = sedentaryMinutes;

          await activity.save();

          res.status(200).json({ message: 'Activity updated successfully', activity });
      } else {
          // Create new activity
          const { veryActiveMinutes, fairlyActiveMinutes, lightlyActiveMinutes, sedentaryMinutes } = calculateMinutes(steps, gender, day);

          const newActivity = new Activity({
              dayOfWeek: day,
              totalSteps: steps,
              veryActiveMinutes,
              fairlyActiveMinutes,
              lightlyActiveMinutes,
              sedentaryMinutes
          });

          await newActivity.save();

          res.status(201).json({ message: 'Activity recorded successfully', activity: newActivity });
      }
  } catch (err) {
      res.status(500).json({ message: 'Failed to record activity', error: err.message });
  }
};

const getAllActivities = async (req, res) => {
  try {
      const activities = await Activity.find();
      res.status(200).json(activities);
  } catch (err) {
      res.status(500).json({ message: 'Failed to fetch activities', error: err.message });
  }
};



//hena y ganna t3mli controller y retrieve el data mn model mt3rf fo2 fi lfile b 2esm (activity) w tb3ti eldata di li api ibrahim 3mlha w trg3i response bt3 api da li hwa calories
// da structure elcontroller elmfrod (ht7tagi tzbti feh kam haga)

/*
const sendAllActivitiesToAnotherAPI = async (req, res) => {
    try {
        // Fetch all activities from the database
        const activities = await Activity.find();

        // Define the target API URL
        const targetApiUrl = 'http://example.com/api/receive-data'; // Replace with the actual target API URL li mdholek ibrahim y ganna

        // Send the data to the target API
        const response = await axios.post(targetApiUrl, { data: activities });

        // Return the response from the target API to the client
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch or send activities', error: err.message });
    }
};

//mtnsesh t3mlelo route fi file exercise.route.js



*/




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
  getAllActivities
};
