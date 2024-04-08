const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");
const { protect } = require("../controllers/authController");

router.use(protect);
// All routes below are protected by router.use(protect)
//verifyy token w lazm ab3thalo fl authorization Bearer 3ashan yshof eni logged in abl ma y3ml l req l matloba
router.route("/addMedicine").post(medicineController.handleNewMedicine);
router.route("/updateMedicine").patch(medicineController.updateMedicine);
router.route("/deleteMedicine").delete(medicineController.deleteMedicine);
router.route("/getMedicine").get(medicineController.getMedicines);
module.exports = router;
