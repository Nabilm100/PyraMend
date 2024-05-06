const express = require("express");
const router = express.Router();
const mealController = require("../controllers/mealController");
const { protect } = require("../controllers/authController");
const authController = require('../controllers/authController');
router.use(protect);
// All routes below are protected by router.use(protect)
//verifyy token w lazm ab3thalo fl authorization Bearer 3ashan yshof eni logged in abl ma y3ml l req l matloba
router.route("/addMeal").post(mealController.handleNewMeal);
router.route("/updateMeal").patch(mealController.updateMeal);
router.route("/deleteMeal").delete(mealController.deleteMeal);
router.route("/getMeal").get(mealController.getMeals);
router.route("/recommendMeals").get(mealController.recommendMeals);
router.route("/createFood").post(authController.restrictTo('admin'),mealController.createFood);
module.exports = router;
