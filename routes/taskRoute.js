const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect } = require("../controllers/authController");

router.use(protect);

// All routes below are protected by router.use(protect)
//verifyy token w lazm ab3thalo fl authorization Bearer 3ashan yshof eni logged in abl ma y3ml l req l matloba
router.route("/addTask").post(taskController.handleNewTask);
router.route("/updateTask").patch(taskController.updateTask);
router.route("/deleteTask").delete(taskController.deleteTask);
router.route("/getTasks").get(taskController.getTasks);
router.route("/getTasksByFilter").post(taskController.getTasksByFilter);
module.exports = router;
