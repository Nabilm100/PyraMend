const fs = require('fs');
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
app.use(bodyParser.json());

process.on('uncaughtException',err => {
    console.log("uncaughtException ----> shutting down the application")
    console.log(err.name,err.message)
    
        process.exit(1);
    
  })

//--------------------
// Import the dotenv library
const dotenv = require('dotenv');
const { hasUncaughtExceptionCaptureCallback } = require('process');

// Load the environment variables from the config.env file
dotenv.config({ path: './config.env' });





//-------------------------------



//const DB = 'mongodb+srv://nabilm402:Ivt5lE3tWv5dYm5I@cluster0.w5vjqv9.mongodb.net/natours?retryWrites=true';


const DB = 'mongodb+srv://PyraMend777:yRujjvJ2gzREeCJH@cluster0.aqhpccv.mongodb.net/PyraMend'



mongoose.connect(DB, { useNewUrlParser: true, useCreateIndex:true , useFindAndModify:false, useUnifiedTopology: true }).then(con => {
    console.log(con.connections)
    console.log("DB succesfull")});



app.use((req,res,next)=>{
    console.log('hello from middleware');
    next();
})
   
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})


app.get("/",(req, res, next) => {
    return res.status(200).json({message:"Welcome to PyraMend"});
 })

app.use('/api/users',userRoute)

app.all('*',(req,res,next)=>{
 

    next(new AppError(`cannot find ${req.originalUrl} on this server`,404));
})


app.use(globalErrorHandler);


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  process.on('unhandledRejection',err => {
    console.log("unhandledRejection ----> shutting down the application")
    console.log(err)
    server.close(()=>{
        process.exit(1);
    })
  })


  
  
//t

