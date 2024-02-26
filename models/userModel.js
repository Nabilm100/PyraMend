const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required:[true,"The name value is required"],
       
    },
    email : {
        type: String,
        required:[true,"The email value is required"],
        unique: true,
        lowercase: true,
        validate:[validator.isEmail,'please provide valid email']
       
    },
    password: {
        type: String,
        required: true,
        minlength: 8, // Minimum length of the password
       select:false,
        validate: {
          validator: function(v) {
            // Password must contain at least one uppercase letter and one digit
            return /^(?=.*[A-Z])(?=.*\d).+$/.test(v);
          },
          message: `Password must contain at least one uppercase letter and one digit!`
        }
      },
      confirmPassword: {
        type: String,
        required: true,
       validate : {
        validator : function(v){
            return v===this.password
        },
        message: 'passwords not match'
       }
      },
      age: {
        type: Number,
        required: [true,'age value is required']
    },
    height: {
      type: Number,
      required: [true,'The height value is required']
  },
  weight: {
    type: Number,
    required: [true,'The weight value is required']
},
activityLevel: {
  type: String,
  enum: ['sedentary', 'lightly active', 'moderately active', 'very active', 'extra active'],
  required: [true,'the activity level is required']
},
goal: {
  type: String,
  enum: ['lose weight', 'maintain weight', 'gain weight'],
  required: [true,'The goal value is required']
},
gender: {
  type: String,
  enum: ['male', 'female'],
  required: [true,'The gender value is required']
},
dateOfBirth: {
  type: Date

}
    
});

userSchema.pre('save',async function(next) {
  //only run this func if pass is modified
  if(!this.isModified('password')){
    return next();
  }

  this.password = await bcrypt.hash(this.password,12);
  this.confirmPassword = undefined;
  next();

})

const User = mongoose.model('User',userSchema);


module.exports = User;