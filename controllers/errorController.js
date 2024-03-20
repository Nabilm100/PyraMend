const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
   
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message,400);
}

const handleMongoErrorDB = err => {
   
    const message = `Duplicated id : ${err.keyValue.name}`
    return new AppError(message,400);
}

const handleValidationErrorDB = err => {
    const errorMessages = Object.values(err.errors).map(error => error.message).join(' , ');
    const message = `${errorMessages}`;
    return new AppError(message,400);
}

const handleJwtError = () => new AppError("Invalid token ! Please login again" , 401)

const handleExpiredTokenError = () => new AppError("Your token expired ! please login again " , 401)





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
        else if (err.name === "JsonWebTokenError"){
            err = handleJwtError()
        }
        else if( err.name === "TokenExpiredError"){
            err = handleExpiredTokenError()
        }
        sendErrorProd(err,res);
        
    }

   
};

