const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
  medName: {
    type: String,
    required: true,
  },
  Dose: {
    type: Number,
    required: true,
    integer: true,
  },
  pillsDuration: {
    type: String,
    enum: ["BeforeEating", "AfterEating","InMiddle","Completed"],
    required: true,
  },
  NotificationHour: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // Regular expression to match time in HH:MM format
        return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(value);
      },
      message: "Invalid time format. Time should be in HH:MM format.",
    },
  },
  howLong: {
    type: Number, 
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  taken: {
    type: Boolean,
    default: false,
  },
});


// Add a method to check if the medicine has expired
medicineSchema.methods.isExpired = function() {
  const expirationDate = new Date(this.createdAt);
  expirationDate.setDate(expirationDate.getDate() + this.howLong);
  return expirationDate < Date.now();
};

/*
medicineSchema.statics.resetTakenValue = function() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const timeUntilMidnight = midnight - now;
  setTimeout(() => {
    this.updateMany({}, { $set: { taken: false } }, function(err, res) {
      if (err) {
        console.error("Error resetting taken value:", err);
      } else {
        console.log("Taken values reset successfully at midnight.");
      }
      // Schedule the next reset for the following midnight
      medicineSchema.statics.resetTakenValue();
    });
  }, timeUntilMidnight);
};
*/




medicineSchema.statics.resetTakenValue = function() {
  const Medicine = this; // Access the Medicine model using 'this'

  const now = new Date();
  let targetTime = new Date(now);
  targetTime.setHours(1); // Setting the target hour to 10 (10:00 PM)
  targetTime.setMinutes(15); // Setting the target minutes to 36
  //targetTime.setHours(23, 5, 0, 0);

  // If the current time is after the target time, schedule the function for the next day
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilTargetTime = targetTime - now; // Calculating the time difference

  setTimeout(() => {
    Medicine.updateMany({}, { $set: { taken: false } }, function(err, res) {
      if (err) {
        console.error("Error resetting taken value:", err);
      } else {
        console.log("Taken values reset successfully at 00:00 AM.");
      }
      // Schedule the next reset for 10:36 PM
      Medicine.resetTakenValue(); // Call the function recursively for the next day
    });
  }, timeUntilTargetTime);
};



// Create a method to update 'taken' field to false every 5 minutes
/*medicineSchema.statics.resetTakenValue = async function () {
  
  try {
    // Update 'taken' field to false for all documents where 'taken' is true
    const result = await this.updateMany({ taken: true }, { $set: { taken: false } });
    console.log(`${result.nModified} documents updated`);
  } catch (error) {
    console.error("Error updating 'taken' field:", error);
  }
};

const Medicine = mongoose.model('Medicine', medicineSchema);

// Schedule the function to run every 5 minutes
setInterval(async () => {
  await Medicine.resetTakenValue();
}, 24 * 60 * 60 * 1000); // 5 minutes in milliseconds

module.exports = Medicine; */

// Schedule the update to run every 5 minutes
/*
setInterval(async () => {
  const Medicine = this;
  await Medicine.resetTakenValue();
}, 1 * 60 * 1000); // 5 minutes in milliseconds



module.exports = mongoose.model("Medicine", medicineSchema);*/

module.exports = mongoose.model("Medicine", medicineSchema);
