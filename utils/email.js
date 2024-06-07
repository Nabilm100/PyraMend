const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'fortnitelol402@gmail.com',
      pass: 'ibiw uevs iqqs xwkq'
    }
  });

  const mailOptions = {
    from: 'Pyramend <PyraMend@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;




/*
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
   

}; */


/*

//function to send email to the user
module.exports.sendingMail = async({from, to, subject, text}) =>{

  try {
    let mailOptions = ({
      from,
      to,
      subject,
      text
  })
  //asign createTransport method in nodemailer to a variable
  //service: to determine which email platform to use
  //auth contains the senders email and password which are all saved in the .env
  const Transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.email,
        pass: process.env.emailpassword,
      },
    });

      //return the Transporter variable which has the sendMail method to send the mail
      //which is within the mailOptions
    return await Transporter.sendMail(mailOptions) 
  } catch (error) {
    console.log(error)
  }
    
}





*/


  


//module.exports = senddEmail;