const User = require('../models/userModel');
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require ('crypto');
const { promisify} = require('util')
const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn : process.env.JWT_EXPIRES_IN})
}
/*
exports.signUp = catchAsync(async(req,res,next) =>{
    const newUser = await User.create(req.body);
    const token = signToken(newUser.id)

   sendingMail({
        from: "no-reply@example.com",
        to: `${email}`,
        subject: "Account Verification Link",
        text: `Hello, ${userName} Please verify your email by
              clicking this link :
              ${req.protocol}://${req.get('host')}/api/users/verify-email/${newUser.id}/${token} `,
      });


    res.status(201).json({
        status: 'success',
        token,
        data:{
            user: newUser
        }
    });

})
*/


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  };
  
  exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
  
    const verificationToken = newUser.createVerificationToken();
    await newUser.save({ validateBeforeSave: false });
  
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/users/verify-email/${verificationToken}`;
  
    const message = `Hello, ${newUser.name} Please verify your email by clicking this link: ${verificationUrl}`;
  
    await sendEmail({
      email: newUser.email,
      subject: 'Account Verification Link',
      message
    });
  
    res.status(201).json({
      status: 'success',
      message: 'Verification email sent to your email address. Please verify your email to complete the registration.'
    });
  });
  
  exports.verifyEmail = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
  
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
  
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
  
    createSendToken(user, 200, res);
  });



exports.login = catchAsync(async(req,res,next) =>{
  const {email,password} = req.body;

  if(!email || !password){
    return next(new AppError('please provide email and password',400))

  }
  const user = await User.findOne({email}).select('+password');

  if(! user || ! await bcrypt.compare(password, user.password) ){
    return next(new AppError('Incorrect email or password',401));
  }

 // if (!user.isVerified) {return next(new AppError('Your email is not verified. Please verify your email to log in.', 401));}

   
 const token = signToken(user.id);
    res.status(201).json({
        status: 'success',
        token,
        data:user
       
    });

})

exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);

    if(!token){
        return next(new AppError('you are not logged in ! log in to access',401));
    }
//verification token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


    //check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belong to this token is no longer exist',401))

    }
    
//check if user changed pass after the token has issued

if(freshUser.changedPassAfter(decoded.iat)){
    return next(new AppError('The password has changed ! please login again !',401))
}

req.user = freshUser

    next();

}) 



exports.getAllUsers = catchAsync(async(req,res,next) =>{
    const users = await User.find();
      res.status(201).json({
          status: 'success',
          results:users.length,
          data : users
         
      });
  
  }) 
  

  exports.restrictTo = (... roles) => {
    return (req,res,next) => {

        if(!roles.includes(req.user.role)){
            return next(new AppError(`You don't have permission for this action`,403))
        }

    next();
}

  }

  







// Controller function for handling forgot password requests
exports.forgotPassword = catchAsync (async (req, res, next) => {
  const { email } = req.body;
 // let user;
 const user = await User.findOne({ email });
  try {
    // Find the user by email
    // user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and save a reset token
    const resetToken = user.passwordReset();
   
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;

  

    const message = `Forgot your password? submit a patch request with your new password and password confirm to : ${resetUrl}`;

   
    await sendEmail({
        email : email,
        subject: "your password reset is available for 10 mins",
        message

    })

    // Respond with success message
    return res.status(200).json({ message: 'Reset token successfully sent' });
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires  = undefined
    await user.save({validateBeforeSave : false});
    return next(new AppError('There is error with sending email try again later!',500))
  }
});


 


exports.resetPassword = catchAsync (async (req,res,next) => {
//get user based on token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

const user = await User.findOne({passwordResetToken : hashedToken , passwordResetExpires:{$gt:Date.now()}});

//if the token hasn't expired and there is user then reset the password
if(!user){
    return next(new AppError('Token is Invalid or has Expired',400))
}

// Check if password and confirmPassword match
if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  ;

user.password = req.body.password;
user.confirmPassword = req.body.confirmPassword;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

//update the passwordChangedAt property
user.passwordChangedAt = Date.now();




//log the user in and send JWT 
const token = signToken(user.id);
    res.status(201).json({
        status: 'success',
        token,
        data:user
       
    });


});


exports.updatePassword = catchAsync(async (req,res,next) => {
    //get user from collection

const user = await User.findById(req.user.id).select('+password');


    //check if password posted is correct
if(! await bcrypt.compare(req.body.passwordCurrent, user.password)){
    return next(new AppError('Incorrect Password',400))
}

  //if so update password
user.password = req.body.password;
user.confirmPassword = req.body.confirmPassword
await user.save();





    //log user in , send JWT
    const token = signToken(user.id);
    res.status(201).json({
        status: 'success',
        token,
        data:user
       
    });

})



exports.updateData = catchAsync(async (req, res, next) => {
    // Get user ID from request
    const userId = req.user.id;

    // Define an array of allowed fields to be updated
    const allowedFields = ['age', 'height', 'weight', 'activityLevel', 'email', 'goal','name'];

    // Extract only allowed fields from request body
    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    try {
        // Update user data using findByIdAndUpdate
        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true, // Return the updated document
            runValidators: true // Run validators to ensure updated data meets schema requirements
        });

       

        // Respond with success message and updated user data
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        // Handle any errors
        return next(error);
    }
});







