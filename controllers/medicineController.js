const Medicine = require("../models/medicineModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require('../utils/catchAsync');


// Controller function to add medicine details
const handleNewMedicine = async (req, res) => {
  const { medName, Dose, Date, pillsDuration } = req.body;
  // console.log(req.user._id);
  if (!medName || !Dose || !Date || !pillsDuration)
    return res
      .status(400)
      .json({
        message:
          "medicine name, dose, pillsDuration and the date are required.",
      });

  // check for duplicate medicine names in the db
 // const duplicate = await Medicine.findOne({ medName: medName });
  //console.log(duplicate);
 // if (duplicate) return res.json({ duplicate: `${medName} already exsists  ` }); 
  //console.log(req.user);
  try {
    //create and store the new medcine
    const result = await Medicine.create({
      medName: medName,
      Dose: Dose,
      Date: Date,
      pillsDuration: pillsDuration,
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



//update medicine data
const updateMedicine = async (req, res) => {
  const { medName, Dose, Date, pillsDuration } = req.body;
  try {
    // Check if the medicine exists
    const existingMedicine = await Medicine.findOne({ medName, userId: req.user._id });
    

    if (!existingMedicine || existingMedicine.userId.toString() !== req.user._id.toString())
      return res.status(400).json({ message: "This medicine isn't stored." });


      

    // Update the medicine fields if provided in the request body
    if (Dose) existingMedicine.Dose = Dose;
    if (Date) existingMedicine.Date = Date;
    if (pillsDuration) existingMedicine.pillsDuration = pillsDuration;

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




module.exports = { handleNewMedicine, updateMedicine, deleteMedicine, getMedicines };
