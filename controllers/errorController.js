const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
   
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message,400);
}

const handleMongoErrorDB = err => {
    
    const message = `Duplicated email : ${err.keyValue.email}`
    return new AppError(message,400);
}

const handleValidationErrorDB = err => {
    const errorMessages = Object.values(err.errors).map(error => error.message).join(' , ');
    const message = `${errorMessages}`;
    return new AppError(message,400);
}

const handleJWTError = () => new AppError('Invalid token , Please log in again!',401)

const handleJWTExpireError = () => new AppError('Your token has expired , Please log in again!',401)



const sendErrorDev = (err,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error : err,
        message: err.message,
        stack : err.stack
    });
}


const sendErrorProd = (err,res) => {
 if(err.isOperational){
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });

}else{
        res.status(500).json({
            status: 'error',
            message: 'something went wrong!'

    }); 
}
}

//global error handler
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
      //  let error = {... err};
        if(err.name==='CastError') 
        {err = handleCastErrorDB(err);
        }else if(err.code === 11000){
            err = handleMongoErrorDB(err);

        }else if (err.name === 'ValidationError'){
           
            err = handleValidationErrorDB(err);
        }
        else if(err.name==='JsonWebTokenError'){
            err = handleJWTError()
        }
        else if(err.name==='TokenExpiredError'){
            err = handleJWTExpireError();
        }
        sendErrorProd(err,res);
        
    }

   
};
