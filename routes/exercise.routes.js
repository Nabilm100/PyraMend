const express = require("express");
const router = express.Router();
const exerciseController = require("../controllers/exercise.controller");
const {
  fetchExercisesByBodyPart,
  saveExercisesToDatabase,
} = require("../utils/exerciseDataFetcher");

const { protect } = require("../controllers/authController");

router.use(protect);

// Define routes for exercises
router.post("/exercises", exerciseController.createExercise);
router.get("/exercises", exerciseController.getAllExercises);

// Define routes for updating and deleting exercises
router.get("/exercises/:id", exerciseController.getExerciseById);
router.put("/exercises/:id", exerciseController.updateExercise);
router.delete("/exercises/:id", exerciseController.deleteExercise);

// Define routes for getting and setting the number of sets for an exercise
router.get("/exercises/:id/sets", exerciseController.getExerciseSets);
router.put("/exercises/:id/sets", exerciseController.setExerciseSets);

// Define routes for getting and setting the weight for an exercise
router.get("/exercises/:id/weight", exerciseController.getExerciseWeight);
router.put("/exercises/:id/weight", exerciseController.setExerciseWeight);

// Define routes for getting and setting the repetitions for an exercise
router.get("/exercises/:id/repeats", exerciseController.getExerciseRepetitions);
router.put("/exercises/:id/repeats", exerciseController.setExerciseRepetitions);

//analysis steps to distance in km
router.post("/dayDistance", exerciseController.createOrUpdateDayDistance);
router.get("/dayDistance", exerciseController.getAllDayDistances);

//analysis steps to minutes
router.post("/activity", exerciseController.createActivity);
router.get("/activity", exerciseController.getAllActivities);
// test the ML API
router.post(
  "/send-activities",
  exerciseController.sendAllActivitiesToAnotherAPI
);
// get calories of user in a certain dayofweek
router.get("/get-calories", exerciseController.getCalories);

// Route to fetch exercises by body part and save them to the database
router.get("/exercises/fetch/:bodyPart", async (req, res) => {
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
});

module.exports = router;
