const Water = require("../models/waterModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
//function to calculate the water target in mL for the user based on his weight and activity levels
const calculateTarget = (weight, activityLevel) => {
  let target = 0;

  if (activityLevel === "sedentary") {
    target = weight * 30;
  } else if (activityLevel === "lightly active") {
    target = weight * 35;
  } else if (activityLevel === "moderately active") {
    target = weight * 40;
  } else if (activityLevel === "very active") {
    target = weight * 45;
  } else if (activityLevel === "extra active") {
    target = weight * 50;
  }

  return target;
};

const setWaterTarget = async (req, res) => {
  const userId = req.user._id; // Assuming req.user contains the authenticated user's data

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If user is not found, return a 404 response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate the target water intake based on user's weight and activity level
    const target = calculateTarget(user.weight, user.activityLevel);

    // Find or create a water document for the user
    let water = await Water.findOne({ userId });
    if (!water) {
      water = new Water({ userId });
    }

    // Get the input target from the request body or default to waterTarget
    const inputTarget = req.body.inputTarget || target;

    // Update the target water intake and save the document
    water.waterTarget = target;
    water.inputTarget = inputTarget;
    await water.save();

    // Convert the target to liters and milliliters for better readability
    const targetLiters = Math.floor(target / 1000); // Convert target to liters
    const targetMilliliters = target % 1000; // Calculate remaining milliliters
    const inputTargetLiters = Math.floor(inputTarget / 1000); // Convert inputTarget to liters
    const inputTargetMilliliters = inputTarget % 1000; // Calculate remaining milliliters

    // Return a success response with the target water intake in liters and milliliters
    res.json({
      message: `Water recommendation set successfully: Water Target: ${target}ml = ${targetLiters}.${targetMilliliters}L`,
      inputTargetMessage: `Input Target: ${inputTarget}ml = ${inputTargetLiters}.${inputTargetMilliliters}L`,
      target,
      inputTarget,
    });
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: err.message });
  }
};

const trackWaterConsumption = async (req, res) => {
  const userId = req.user._id;
  const { amount } = req.body;
  try {
    const water = await Water.findOne({ userId });
    if (!water) {
      return res.status(404).json({ message: "Water target not set" });
    }

    water.waterConsumed += amount;
    if (water.inputTarget) {
      water.remainingWater = Math.max(
        water.inputTarget - water.waterConsumed,
        0
      );
    } else {
      water.remainingWater = Math.max(
        water.waterTarget - water.waterConsumed,
        0
      );
    }
    await water.save();

    const remainingLiters = Math.floor(water.remainingWater / 1000); // Convert remaining to liters
    const remainingMilliliters = water.remainingWater % 1000; // Calculate remaining milliliters

    if (water.remainingWater === 0) {
      return res.json({
        message:
          "Congratulations! You have achieved your water intake goal for today",
        remaining: water.remainingWater,
      });
    }

    res.json({
      message: `Water consumption tracked successfully. Remaining target: ${water.remainingWater}ml = ${remainingLiters}.${remainingMilliliters}L`,
      remaining: water.remainingWater,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { calculateTarget, setWaterTarget, trackWaterConsumption };
// const trackWaterConsumption = async (req, res) => {
//   const userId = req.user._id;
//   const { amount } = req.body;
//   try {
//     const water = await Water.findOne({ userId });
//     if (!water) {
//       return res.status(404).json({ message: "Water target not set" });
//     }

//     water.waterConsumed += amount;
//     water.remainingWater = Math.max(water.waterTarget - water.waterConsumed, 0);
//     await water.save();

//     const remainingLiters = Math.floor(water.remainingWater / 1000); // Convert remaining to liters
//     const remainingMilliliters = water.remainingWater % 1000; // Calculate remaining milliliters

//     if (water.remainingWater === 0) {
//       return res.json({
//         message:
//           "Congratulations! You have achieved your water intake goal for today",
//         remaining: water.remainingWater,
//       });
//     }

//     res.json({
//       message: `Water consumption tracked successfully. Remaining target: ${water.remainingWater}ml = ${remainingLiters}.${remainingMilliliters}L`,
//       remaining: water.remainingWater,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// const setWaterTarget = async (req, res) => {
//   const userId = req.user._id; // Assuming req.user contains the authenticated user's data

//   try {
//     // Find the user by ID
//     const user = await User.findById(userId);

//     // If user is not found, return a 404 response
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Calculate the target water intake based on user's weight and activity level
//     const target = calculateTarget(user.weight, user.activityLevel);

//      // Get the input target from the request body or default to waterTarget
//      const inputTarget = req.body.inputTarget || waterTarget;

//     // Find or create a water document for the user
//     let water = await Water.findOne({ userId });
//     if (!water) {
//       water = new Water({ userId });
//     }

//     // Update the target water intake and save the document
//     water.waterTarget = target;
//     water.inputTarget = inputTarget;
//     await water.save();

//     // Convert the target to liters and milliliters for better readability
//     const targetLiters = Math.floor(target / 1000); // Convert target to liters
//     const targetMilliliters = target % 1000; // Calculate remaining milliliters
//     const inputTargetLiters = Math.floor(inputTarget / 1000); // Convert inputTarget to liters
//     const inputTargetMilliliters = inputTarget % 1000; // Calculate remaining milliliters

//     // Return a success response with the target water intake in liters and milliliters
//     res.json({
//         message: `Water recommendation set successfully: Water Target: ${target}ml = ${targetLiters}.${targetMilliliters}L`,
//         inputTargetMessage: `Input Target: ${inputTarget}ml = ${inputTargetLiters}.${inputTargetMilliliters}L`,
//         target,
//         inputTarget
//     });
//   } catch (err) {
//     // Handle any errors that occur during the process
//     res.status(500).json({ error: err.message });
//   }
// };
