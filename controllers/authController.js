const User = require('../models/userModel');
const apiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

  /*    exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    console.log(token);

    if(!token){
        return next(new AppError('you are not logged in ! log in to access',401));
    }

    })  */



exports.getAllUsers = catchAsync(async(req,res,next) =>{
    const users = await User.find();
      res.status(201).json({
          status: 'success',
          results:users.length,
          data : users
         
      });
  
  })


