const User = require('../models/userModel');
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const senddEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require ('crypto');
const { promisify} = require('util')
const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn : process.env.JWT_EXPIRES_IN})
}

exports.signUp = catchAsync(async(req,res,next) =>{
    const newUser = await User.create(req.body);
    const token = signToken(newUser.id)

    res.status(201).json({
        status: 'success',
        token,
        data:{
            user: newUser
        }
    });

})



exports.login = catchAsync(async(req,res,next) =>{
  const {email,password} = req.body;

  if(!email || !password){
    return next(new AppError('please provide email and password',400))

  }
  const user = await User.findOne({email}).select('+password');

  if(! user || ! await bcrypt.compare(password, user.password) ){
    return next(new AppError('Incorrect email or password',401));
  }

   
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

  /*exports.forgotPassword = catchAsync(async(req,res,next) =>{
//get user posted based on certain email
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email address',404))
    }

    //generate reset token
   const resetToken = user.passwordReset()
  await user.save({validateBeforeSave : false});

   

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;

  

    const message = `Forgot your password? submit a patch request with your new password and password confirm to : ${resetUrl}`;

   
try{
    await senddEmail({
        email : user.email,
        subject: "your password reset is available for 10 mins",
        message

    })

res.status(200).json({
    status: 'success',
    message: 'Token sent to email'})

}catch(err){
    user.passwordResetToken = undefined
    user.passwordResetExpires  = undefined
    await user.save({validateBeforeSave : false});
    console.log(err)
    return next(new AppError('There is error with sending email try again later!',500))
}




 



    next();

  });*/







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

   
    await senddEmail({
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





