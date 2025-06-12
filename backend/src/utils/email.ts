import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password
  },
});

export const sendInterviewReminder = async (
  to: string,
  jobTitle: string,
  company: string,
  date: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Reminder: Interview for ${jobTitle} at ${company}`,
    html: `<h3>You have an interview scheduled!</h3>
      <p>Position: <b>${jobTitle}</b><br/>
      Company: <b>${company}</b><br/>
      Date: <b>${date}</b></p>
      <p>All the best!</p>`,
  };

  return transporter.sendMail(mailOptions);
};
