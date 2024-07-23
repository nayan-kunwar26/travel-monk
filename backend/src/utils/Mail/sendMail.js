import nodemailer from "nodemailer";

// Function to send an email
export const sendMail = (email, verificationUrl) => {
  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASS, // App-specific password generated from Google Account
    },
  });

  // Define email options
  let mailOptions = {
    from: process.env.NODEMAILER_EMAIL_USER,
    to: email,
    subject: "From Travel Monk",
    html: `<h2>Verify your email address</h2> <p>You created an account with the email address: ${email} Click on  <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Confirm Email</a> to verify the email address and unlock your full account.</p>`,
  };

  return new Promise((resolve, reject) => {
    // Send the email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      } else {
        return resolve("Email Sent Successfully: " + info.response);
      }
    });
  });
};
