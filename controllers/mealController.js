const Meal = require("../models/mealModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Food = require("../models/foodModel");
const axios = require("axios");

let activityFactorCalculate = (activityLevel) => {
  let activityFactor = 1.2;
  if (activityLevel === "lightly active") {
    activityFactor = 1.375;
  } else if (activityLevel === "moderately active") {
    activityFactor = 1.55;
  } else if (activityLevel === "very active") {
    activityFactor = 1.75;
  } else if (activityLevel === "extra active") {
    activityFactor = 2.0;
  }
  return activityFactor;
};

let caloriesGoalCalculate = (user) => {
  let activityFactor = activityFactorCalculate(user.activityLevel);
  let BMR =
    88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * user.age;
  let TDEE = BMR * activityFactor;
  if (user.goal === "lose weight") {
    TDEE = TDEE - 350;
  } else if (user.goal === "gain weight") {
    TDEE = TDEE + 350;
  }
  TDEE = parseInt(TDEE);
  return TDEE;
};

// Controller function to add meal detail

const handleNewMeal = async (req, res) => {
  const { mealName, mealType, description, calories, NotificationHour } =
    req.body;
  // console.log(req.user._id);
  if (!mealName || !mealType || !calories || !NotificationHour)
    return res.status(400).json({
      message: "meal name, type, calories and the date are required.",
    });

  //console.log(req.user);
  try {
    //create and store the new meal
    const result = await Meal.create({
      mealName: mealName,
      mealType: mealType,
      NotificationHour: NotificationHour,
      description: description,
      calories: calories,
      userId: req.user._id,
    });

    console.log(result);

    res.status(201).json({
      status: "Success",
      message: `The ${mealName} Meal has been added successfully`,
      data: req.body,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//update Meal data
const updateMeal = async (req, res) => {
  const { mealName, mealType, description, calories, NotificationHour, taken } =
    req.body;
  try {
    // Check if the meal exists
    const existingMeal = await Meal.findOne({ mealName, userId: req.user._id });
    // console.log(existingMeal);
    if (
      !existingMeal ||
      existingMeal.userId.toString() !== req.user._id.toString()
    )
      return res.status(400).json({ message: "This meal isn't stored." });
    // Update the Meal fields if provided in the request body
    if (mealName) existingMeal.mealName = mealName;
    if (mealType) existingMeal.mealType = mealType;
    if (NotificationHour) existingMeal.NotificationHour = NotificationHour;
    if (description) existingMeal.description = description;
    if (calories) existingMeal.calories = calories;
    if (taken) existingMeal.taken = taken;

    // Save the updated Meal
    await existingMeal.save();

    return res.json({ success: `${mealName} is updated successfully` });
  } catch (error) {
    console.error("Error updating meal:", error);
    return res.status(500).json({ error: "Could not update meal" });
  }
};

//Delete meal from db
const deleteMeal = async (req, res) => {
  const { mealName } = req.body;
  //to check if the mealName to be deleted is already in the db
  const existingMeal = await Meal.findOne({ mealName, userId: req.user._id });
  console.log(existingMeal);
  if (
    !existingMeal ||
    existingMeal.userId.toString() !== req.user._id.toString()
  )
    return res.status(400).json({ message: "This meal isn't stored." });
  const deletedMeal = await Meal.deleteOne({ mealName });
  console.log(deletedMeal);
  if (deletedMeal) {
    return res.json({ success: `${mealName} is deleted successfully` });
  } else {
    return res.json({ fail: "Could not delete meal" });
  }
};

//get meals of user
const getMeals = async (req, res, next) => {
  try {
    const meals = await Meal.find({ userId: req.user._id });

    const user = await User.findById(req.user.id);
    const TDEE = caloriesGoalCalculate(user);

    if (meals.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "You have not added any meals yet.",
        totalNeededCalories: TDEE,
      });
    }

    // Calculate total calories
    let totalCalories = 0;
    meals.forEach((meal) => {
      totalCalories += meal.calories;
    });

    res.status(201).json({
      status: "success",
      result: meals.length,
      totalMealsCalories: totalCalories,
      totalNeededCalories: TDEE,
      data: meals,
    });
  } catch (err) {
    return next(
      new AppError("There is error with sending the list of meals !", 500)
    );
  }
};

//-----------------get missed meals---------------------
const getMealNames = async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Fetch meals for the logged-in user where taken is false
    const meals = await Meal.find({
      userId: req.user._id,
      taken: false,
    });

    const user = await User.findById(req.user.id);
    const TDEE = caloriesGoalCalculate(user);
    let totalMissedCalories = 0;

    // Filter meals where the NotificationHour has passed
    const filteredMeals = [];
    meals.forEach((meal) => {
      // Check if NotificationHour is defined
      if (meal.NotificationHour) {
        // Extract the hour part from the notification hour string and convert it to an integer
        const notificationHour = parseInt(meal.NotificationHour.split(":")[0]);
        if (notificationHour < currentHour) {
          console.log("notifyHour ", notificationHour);
          console.log("currentHour ", currentHour);
          filteredMeals.push(meal);
          totalMissedCalories += meal.calories;
        }
      }
    });

    // Extract mealNames from the filtered meals
    const mealNames = filteredMeals.map((meal) => meal.mealName);

    const TotalMeal = await Meal.find({ userId: req.user._id });

    const totalMissedMeals = mealNames.length;

    // Calculate the total number of mealNames
    const totalMealsnumbers = TotalMeal.length;

    // Send the mealNames and counts as a response
    res.json({
      totalMissedMeals,
      totalMealsnumbers,
      mealNames,
      totalneedCalories: TDEE,
      totalMissedCalories,
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching medNames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//--------------------------------------

//------------------ADD MEAL TO DATABASE(nutritionModel) BY AN ADMIN----------------------------
// Controller function to save JSON data to the Food model
const createFood = async (req, res) => {
  try {
    // Extract data from the request body
    const {
      id,
      name,
      description,
      ingredients,
      ingredients_raw,
      steps,
      servings,
      serving_size,
      tags,
    } = req.body;

    // Create a new Food document
    const newFood = new Food({
      id,
      name,
      description,
      ingredients,
      ingredients_raw,
      steps,
      servings,
      serving_size,
      tags,
    });

    // Save the Food document to the database
    await newFood.save();

    res
      .status(201)
      .json({ success: true, message: "Food created successfully" });
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Function to fetch nutrition data from CalorieNinjas API for a given meal name
async function fetchNutritionData(mealName) {
  try {
    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(
        mealName
      )}`,
      {
        headers: {
          "X-Api-Key": "3MOYSBPdjWgwkoXu2whVZA==jYe3PJ3ZlRudRRVE", // Replace 'YOUR_API_KEY' with your actual API key
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return null;
  }
}

// Function to recommend meals based on user preferences with nutrition data for each meal
const recommendMeals = async (req, res) => {
  try {
    const { preferences } = req.body;
    const preferencesArray = [];

    // Check if preferences is an array
    if (Array.isArray(preferences)) {
      // If preferences is already an array, push its items into preferencesArray
      preferencesArray.push(...preferences);
    } else {
      // If preferences is not an array (e.g., a single string), push it directly into preferencesArray
      preferencesArray.push(preferences);
    }

    console.log("preferenceArray : ", preferencesArray);

    // Calculate Total Daily Calories for our user based on his goal
    const user = await User.findById(req.user.id);
    const TDEE = caloriesGoalCalculate(user);
    const protienNeeded = parseInt(user.weight * 1.8);
    let lmt = 7;
    if (preferences.length > 1) {
      lmt = lmt - 2;
    }

    const allPreferencesMeals = await Food.find({ tags: { $all: preferences } })
      .limit(lmt)
      .exec();

    let recommendedMeals = allPreferencesMeals;
    // Use a Set to track unique food items
    const uniqueMeals = new Set(
      allPreferencesMeals.map((meal) => meal._id.toString())
    );

    let limitt = 7 - allPreferencesMeals.length;

    if (limitt === 0) limitt = 1;

    /* for (const preference of preferencesArray) {
          const meals = await Food.find({ tags: preference }).limit(limitt).exec();
          recommendedMeals = recommendedMeals.concat(meals);
      }*/
    for (const preference of preferencesArray) {
      const meals = await Food.find({ tags: preference }).limit(limitt).exec();
      for (const meal of meals) {
        if (!uniqueMeals.has(meal._id.toString())) {
          uniqueMeals.add(meal._id.toString());
          recommendedMeals.push(meal);
        }
      }
    }

    // Fetch nutrition data for each recommended meal
    const mealsWithNutrition = [];
    for (const meal of recommendedMeals) {
      const nutritionData = await fetchNutritionData(meal.name);
      if (nutritionData && nutritionData.items.length > 0) {
        const aggregatedMacros = {
          calories: 0,
          fat: 0,
          protein: 0,
          carbohydrates: 0,
          fiber: 0,
          sugar: 0,
          servePer: 0,
        };

        for (const item of nutritionData.items) {
          aggregatedMacros.calories += parseInt(item.calories);
          aggregatedMacros.fat += parseInt(item.fat_total_g);
          aggregatedMacros.protein += parseInt(item.protein_g);
          aggregatedMacros.carbohydrates += parseInt(
            item.carbohydrates_total_g
          );
          aggregatedMacros.fiber += parseInt(item.fiber_g);
          aggregatedMacros.sugar += parseInt(item.sugar_g);
          aggregatedMacros.servePer += parseInt(item.serving_size_g);
        }

        // Push the aggregated macros to mealsWithNutrition array
        const mealWithNutrition = {
          ...meal._doc,
          macros: aggregatedMacros,
        };
        mealsWithNutrition.push(mealWithNutrition);
      } else {
        // If nutrition data is not available, include the meal without macros
        mealsWithNutrition.push({ ...meal._doc, macros: {} });
      }
    }

    res.status(200).json({
      success: true,
      caloriesForYourGoal: TDEE,
      protienNeed: protienNeeded,
      result: mealsWithNutrition.length,
      data: mealsWithNutrition,
    });
  } catch (error) {
    console.error("Error recommending meals:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  handleNewMeal,
  updateMeal,
  deleteMeal,
  getMeals,
  recommendMeals,
  createFood,
  getMealNames,
};
