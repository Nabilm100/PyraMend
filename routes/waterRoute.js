const express = require("express");
const router = express.Router();
const waterController = require("../controllers/waterController");
const { protect } = require("../controllers/authController");

router.use(protect);

// router.route("/addWaterIntake").post(waterController.addWaterIntake);
// router.route("/updateWaterTarget").patch(waterController.updateWaterTarget);
router.route("/waterTarget").post(waterController.setWaterTarget);
router.route("/waterConsumption").post(waterController.trackWaterConsumption);

module.exports = router;
