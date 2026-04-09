const otpTemplate = (otp) => `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #5f63f2;text-decoration:none;font-weight:600">DocPulse</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing DocPulse. Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
        <h2 style="background: #5f63f2;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />DocPulse Team</p>
        <hr style="border:none;border-top:1px solid #eee" />
      </div>
    </div>
`;

const welcomeTemplate = (name) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to DocPulse, ${name}!</h2>
        <p>We are excited to have you on board. At DocPulse, we care for your health and time.</p>
        <p>Start booking your consultations easily with the best doctors.</p>
        <br />
        <p>Stay Healthy!</p>
        <p>The DocPulse Team</p>
    </div>
`;

const doctorOnboardingTemplate = (name, email, password) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello Dr. ${name},</h2>
      <p>Welcome to the DocPulse medical network! You have been successfully added as a doctor.</p>
      <p>Below are your login credentials for the doctor panel:</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
      <p>Kindly login and update your profile and availability.</p>
      <br />
      <p>Best Regards,<br />DocPulse Team</p>
    </div>
`;

const bookingConfirmationTemplate = (name, docName, date, time) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Appointment Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Your appointment with <b>Dr. ${docName}</b> has been successfully booked.</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p>We look forward to seeing you.</p>
        <br />
        <p>Regards,<br />DocPulse Team</p>
    </div>
`;

const reminderTemplate = (name, docName, date, time) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Upcoming Appointment Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder for your upcoming appointment with <b>Dr. ${docName}</b>.</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p>Please be on time for your consultation.</p>
        <br />
        <p>Regards,<br />DocPulse Team</p>
    </div>
`;

//cancel appointment template
const cancelAppointmentTemplate = (name, docName, date, time) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Appointment Cancelled</h2>
        <p>Hi ${name},</p>
        <p>Your appointment with <b>Dr. ${docName}</b> has been successfully cancelled.</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p>If this was a mistake or you wish to reschedule, you can book a new appointment anytime.</p>
        <br />
        <p>Regards,<br />DocPulse Team</p>
    </div>
`;

const completionTemplate = (name, docName, feedbackLink) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Consultation Completed</h2>
        <p>Hi ${name},</p>
        <p>We hope you had a good experience with <b>Dr. ${docName}</b>.</p>
        <p>Your feedback is important to us! Please take a moment to rate your experience and provide a summary.</p>
        <div style="margin: 30px 0;">
            <a href="${feedbackLink}" style="background-color: #000B6D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Give Feedback</a>
        </div>
        <p>Thank you for choosing DocPulse. Stay healthy!</p>
        <br />
        <p>Regards,<br />DocPulse Team</p>
    </div>
`;

export { 
  otpTemplate, 
  welcomeTemplate, 
  doctorOnboardingTemplate, 
  bookingConfirmationTemplate, 
  reminderTemplate, 
  completionTemplate, 
  cancelAppointmentTemplate
}
