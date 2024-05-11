const Medicine = require("../models/medicineModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require('../utils/catchAsync');
//---------------------


// Controller function to add medicine details
const handleNewMedicine = async (req, res) => {
  const { medName, Dose, pillsDuration, NotificationHour, howLong  } = req.body;
  
  if (!medName || !Dose || !pillsDuration || !NotificationHour  || !howLong)
    return res
      .status(400)
      .json({
        message:
          "medicine name, dose, pillsDuration , notificationHour and for howLong values are required.",
      });

  
  try {
    //create and store the new medcine
    const result = await Medicine.create({
      medName: medName,
      Dose: Dose,
      pillsDuration: pillsDuration,
      NotificationHour: NotificationHour,
      howLong: howLong,
      userId: req.user._id,
    });

    console.log(result);

    res.status(201).json({
      status: 'Success',
      message : `The ${medName} Medicine has been added successfully`,
      data : req.body
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//----------------------------------
// Function to delete expired medicines
async function deleteExpiredMedicines() {
  try {
    const expiredMedicines = await Medicine.find({}).exec();

    expiredMedicines.forEach(async (medicine) => {
      if (medicine.isExpired()) {
        await Medicine.findByIdAndDelete(medicine._id).exec();
        console.log(`Medicine '${medicine.medName}' expired and deleted.`);
      }
    });
  } catch (error) {
    console.error("Error deleting expired medicines:", error);
  }
}


 // Middleware to delete expired medicines before processing medicines requests
const deleteExpiredMedicinesMiddleware = async (req, res, next) => {
  await deleteExpiredMedicines(); 
  next(); 
};


//------------------



//update medicine data
const updateMedicine = async (req, res) => {
  const { medName, Dose, pillsDuration, NotificationHour, howLong, taken } = req.body;
  try {
    // Check if the medicine exists
    const existingMedicine = await Medicine.findOne({ medName, userId: req.user._id });
    

    if (!existingMedicine || existingMedicine.userId.toString() !== req.user._id.toString())
      return res.status(400).json({ message: "This medicine isn't stored." });


      

    // Update the medicine fields if provided in the request body
    if (Dose) existingMedicine.Dose = Dose;
    if (pillsDuration) existingMedicine.pillsDuration = pillsDuration;
    if(NotificationHour) existingMedicine.NotificationHour = NotificationHour;
    if(howLong) existingMedicine.howLong = howLong;
    if(taken) existingMedicine.taken = taken

    // Save the updated medicine
    await existingMedicine.save();

    return res.json({ success: `${medName} is updated successfully` });
  } catch (error) {
    console.error("Error updating medicine:", error);
    return res.status(500).json({ error: "Could not update medicine" });
  }
};




//Delete medicine from db
const deleteMedicine = async (req, res) => {
  const { medName } = req.body;
  //to check if the medName to be deleted is already in the db
  const existingMedicine = await Medicine.findOne({ medName, userId:req.user._id });
  console.log(existingMedicine);
  if (!existingMedicine || existingMedicine.userId.toString() !== req.user._id.toString())
    return res.status(400).json({ message: "This medicine isn't stored." });
  const deletedMedicine = await Medicine.deleteOne({ medName });
  console.log(deletedMedicine);
  if (deletedMedicine) {
    return res.json({ success: `${medName} is deleted successfully` });
  } else {
    return res.json({ fail: "Could not delete medicine" });
  }
};


//get medicines of user 
const getMedicines = async (req, res, next) => {
  try{
   
    const medicines = await Medicine.find({userId:req.user._id})

    if (medicines.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'You have not added any medicines yet.'
      });
    }
   
    res.status(201).json({
      status: 'success',
      result: medicines.length,
     data: medicines
     
  });

  }catch(err){
    return next(new AppError('There is error with sending the list of medicines !',500))
    

  }
}



//--------------------------------
/*
const getMedNames = async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
   // const currentHour = now.toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});


    

    // Fetch medicines for the logged-in user where taken is false and NotificationHour has passed
    const medicines = await Medicine.find({
      userId: req.user._id,
      taken: false,
     // NotificationHour: { $lt: currentHour }
      
    });
    

    // Extract medNames from the filtered medicines
    const medNames = medicines.map(medicine => medicine.medName);

    
    

    // Send the medNames as a response
   res.json({ medNames });
  } catch (error) {
    // Handle errors
    console.error("Error fetching medNames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
*/


const getMedNames = async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Fetch medicines for the logged-in user where taken is false
    const medicines = await Medicine.find({
      userId: req.user._id,
      taken: false
    });

    // Filter medicines where the NotificationHour has passed
    const filteredMedicines = [];
    medicines.forEach(medicine => {
      // Check if NotificationHour is defined
      if (medicine.NotificationHour) {
        // Extract the hour part from the notification hour string and convert it to an integer
        const notificationHour = parseInt(medicine.NotificationHour.split(':')[0]);
        if (notificationHour < currentHour) {
          console.log('notifyHour ',notificationHour)
          console.log('currentHour ',currentHour)
          filteredMedicines.push(medicine);
        }
      }
    });

    // Extract medNames from the filtered medicines
    const medNames = filteredMedicines.map(medicine => medicine.medName);

    const TotalMed = await Medicine.find({
      userId: req.user._id,
      
    });

    const totalMissedMedicines = medNames.length;
    
    // Calculate the total number of medNames
    const totalMednumbers = TotalMed.length;

    // Send the medNames and counts as a response
    res.json({ totalMissedMedicines, totalMednumbers, medNames });
  } catch (error) {
    // Handle errors
    console.error("Error fetching medNames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};






module.exports = { handleNewMedicine, updateMedicine, deleteMedicine, getMedicines, deleteExpiredMedicinesMiddleware, getMedNames };
