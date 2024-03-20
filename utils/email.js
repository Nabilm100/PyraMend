const nodemailer = require('nodemailer');



const senddEmail = async options => {

   const transporter = nodemailer.createTransport({
        host : 'smtp.mailtrap.io',
        port : 587,
        auth: {
            user: 'fc2b568164fa73',
            pass: 'f2058210ccd42b'
        },
        
    });

   

    const mailOptions = {
        from: 'PyraMend  <hello@PyraMend.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions)
   

};


  


module.exports = senddEmail;