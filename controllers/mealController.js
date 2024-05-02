const Meal = require("../models/mealModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Nutrition = require("../models/nutritionModel")
// Controller function to add meal details
const handleNewMeal = async (req, res) => {
  const { mealName, mealType, description, calories, Date } = req.body;
  // console.log(req.user._id);
  if (!mealName || !mealType || !description || !calories || !Date)
    return res.status(400).json({
      message: "meal name, type, calories and the date are required.",
    });

  // check for duplicate meal names in the db
  const duplicate = await Meal.findOne({ mealName: mealName, userId:req.user._id });
  //console.log(duplicate);
  if (duplicate)
    return res.json({ duplicate: `${mealName} already exsists  ` }); 
  //console.log(req.user);
  try {
    //create and store the new meal
    const result = await Meal.create({
      mealName: mealName,
      mealType: mealType,
      Date: Date,
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
  const { mealName, mealType, description, calories, Date } = req.body;
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
    if (Date) existingMeal.Date = Date;
    if(description) existingMeal.description = description
    if(calories) existingMeal.calories = calories

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

    if (meals.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "You have not added any meals yet.",
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
      totalCalories, // Include total calories in the response
      data: meals,
    });
  } catch (err) {
    return next(
      new AppError("There is error with sending the list of meals !", 500)
    );
  }
};



//------------------ADD MEAL TO DATABASE(nutritionModel) BY AN ADMIN----------------------------
const newDatabaseMeal = async (req, res) => {
    const { mealName, description, calories, protien, carbs, fat, sugar } = req.body;
   
    // check for duplicate meal names in the db
    const duplicate = await Nutrition.findOne({ mealName: mealName });
    //console.log(duplicate);
    if (duplicate)
      return res.json({ duplicate: `${mealName} already exsists  ` }); //Conflict
    //console.log(req.user);
    try {
      //create and store the new meal
      const result = await Nutrition.create({
        mealName: mealName,
        description: description,
        calories: calories,
        protien: protien,
        carbs: carbs,
        fat: fat,
        sugar: sugar
       
      });
  
     // console.log(result);
  
      res.status(201).json({
        status: "Success",
        message: `The ${mealName} Meal has been added successfully to Database`,
        data: req.body,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };






//------------------RECOMMEND MEALS----------------------------
const recommendMeals = async(req,res) => {
res.status(201).json({
    status: "Success",
    message: `This feature is still under working...`
})
}


module.exports = { handleNewMeal, updateMeal, deleteMeal, getMeals, newDatabaseMeal, recommendMeals };
