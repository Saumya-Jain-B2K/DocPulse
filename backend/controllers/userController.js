import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
import sendEmail from "../config/emailConfig.js";
import mongoose from "mongoose";
import consultationModel from "../models/consultationModel.js";
import {
  otpTemplate,
  welcomeTemplate,
  bookingConfirmationTemplate,
  cancelAppointmentTemplate,
  consultationBookingTemplate,
} from "../utils/emailTemplates.js";
import messageModel from "../models/messageModel.js";

// api to register user
const registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    //validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    //validating a strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generating 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.json({ success: false, message: "Account already exists" });
      } else {
        // Update existing unverified user with new OTP and password
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.otp = otp;
        existingUser.otpExpire = otpExpire;
        await existingUser.save();
      }
    } else {
      const userData = {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpire,
        isVerified: false,
      };
      const newUser = new userModel(userData);
      await newUser.save();
    }

    // Sending OTP Email
    await sendEmail(email, "Verify Your Account - DocPulse", otpTemplate(otp));

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.body.email.toLowerCase().trim();

    if (!email || !otp) {
      return res.json({ success: false, message: "Missing details" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = "";
    user.otpExpire = null;
    await user.save();

    // Send Welcome Email
    console.log(`Sending welcome email to: \${user.email}`);
    await sendEmail(
      user.email,
      "Welcome to DocPulse!",
      welcomeTemplate(user.name),
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const profile = req.user;
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const origin = req.query.state || "user";

    // 1. Check if the user is Admin
    if (email === process.env.ADMIN_EMAIL) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "2d",
      });

      res.cookie("aToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`http://localhost:5174?role=admin`);
    }

    // 2. Check if the user is a Doctor
    let doctor = await doctorModel.findOne({ email });
    if (doctor) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
        expiresIn: "2d",
      });

      res.cookie("dToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`http://localhost:5174?role=doctor`);
    }

    // 3. Handle unauthorized Admin/Doctor login attempt
    if (origin === "admin") {
      return res.redirect("http://localhost:5174?error=unauthorized");
    }

    // 4. Regular User logic
    let user = await userModel.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      // Create new user if not found
      user = await userModel.create({
        email,
        googleId,
        name:
          profile.displayName ||
          profile.name.givenName + " " + profile.name.familyName,
        image: profile.photos[0]?.value || "",
      });

      await sendEmail(
        user.email,
        "Welcome to DocPulse!",
        welcomeTemplate(user.name),
      );
    } else if (!user.googleId) {
      // Link Google account to existing email account
      user.googleId = googleId;
      if (!user.image) user.image = profile.photos[0]?.value || "";
      await user.save();
    }

    // Issue JWT token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    // Redirect back to user frontend
    res.redirect(`http://localhost:5173/login`);
  } catch (error) {
    console.log(error);
    res.redirect("http://localhost:5173/login?error=auth_failed");
  }
};

// api for user login
const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase().trim();
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "Account not verified. Please sign up again.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "2d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, token, userId: user._id });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to logout user
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to verify user auth
const verifyUser = async (req, res) => {
  try {
    res.json({ success: true, message: "Authorized" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to book appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    const userData = await userModel.findById(userId).select("-password");

    if (!docData)
      return res.json({ success: false, message: "Doctor not found" });
    if (!userData)
      return res.json({ success: false, message: "User not found" });

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    let slots_booked = docData.slots_booked || {};

    // checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ succes: false, message: "Slot is not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Send Email Notifications
    const emailSubject = "Appointment Booked - DocPulse";
    const emailHTML = bookingConfirmationTemplate(
      userData.name,
      docData.name,
      slotDate,
      slotTime,
    );

    // 1. To User
    await sendEmail(userData.email, emailSubject, emailHTML);
    // 2. To Doctor
    await sendEmail(
      docData.email,
      "New Appointment Booked",
      `You have a new appointment with \${userData.name} on \${slotDate} at \${slotTime}`,
    );
    // 3. To Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "New Appointment Alert",
      `A new appointment has been booked. Patient: \${userData.name}, Doctor: \${docData.name}`,
    );

    res.json({ success: true, message: "Appointment Booked with the Doctor" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to get user appointments for frontend my-appointment page

const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to cancel the appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // verify appointment user
    if (appointmentData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Get user & doctor details
    const userData = await userModel.findById(userId).select("-password");
    // const doctorData = await doctorModel.findById(docId).select("-password");

    // Email content
    const emailSubject = "Appointment Cancelled - DocPulse";
    const emailHTML = cancelAppointmentTemplate(
      userData.name,
      doctorData.name,
      slotDate,
      slotTime,
    );

    // 1. Send to User
    await sendEmail(userData.email, emailSubject, emailHTML);

    // 2. Send to Doctor (simple text or template)
    await sendEmail(
      doctorData.email,
      "Appointment Cancelled",
      `Appointment with ${userData.name} on ${slotDate} at ${slotTime} has been cancelled.`,
    );

    // 3. Send to Admin (optional but professional)
    await sendEmail(
      process.env.ADMIN_EMAIL,
      "Appointment Cancelled Alert",
      `Patient ${userData.name} cancelled appointment with Dr. ${doctorData.name}`,
    );

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//  api to make payment of appointment using razorpay

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment cancelled or not found",
      });
    }

    if (!appointmentData.amount) {
      return res.json({
        success: false,
        message: "Appointment amount missing",
      });
    }

    //creating options for razorpay payment
    const options = {
      amount: appointmentData.amount,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book consultation
const bookConsultation = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    //checking if the consultation slot is in the future
    const consultationDateTime = new Date(`${slotDate} ${slotTime}`);
    const now = new Date();

    if (consultationDateTime <= now) {
      return res.json({
        success: false,
        message: "Please select a future time slot",
      });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    const userData = await userModel.findById(userId).select("-password");

    if (!docData || !userData) {
      return res.json({ success: false, message: "Data not found" });
    }

    // 🔥 CHECK FIRST CONSULTATION
    const existingConsultation = await consultationModel.findOne({
      userId,
      docId,
      cancelled: false,
    });

    let amount = 0;
    let isFirstConsultation = false;

    if (!existingConsultation) {
      amount = 0; // FREE
      isFirstConsultation = true;
    } else {
      amount =
        docData.consultationFees !== null &&
        docData.consultationFees !== undefined
          ? docData.consultationFees
          : 50; // PAID
    }

    // 🔥 GENERATE CHAT ROOM ID
    const chatRoomId = new mongoose.Types.ObjectId().toString();

    const consultationData = {
      userId,
      docId,
      userData,
      docData,
      slotDate,
      slotTime,
      amount,
      isFirstConsultation,
      chatRoomId,
      date: Date.now(),
    };

    const newConsultation = new consultationModel(consultationData);
    await newConsultation.save();

    // 🔥 Send Email Notifications

    // 1. To User
    await sendEmail(
      userData.email,
      "Consultation Booked - DocPulse",
      consultationBookingTemplate(
        userData.name,
        docData.name,
        slotDate,
        slotTime,
      ),
    );

    // 2. To Doctor
    await sendEmail(
      docData.email,
      "New Consultation Booked",
      `You have a new consultation with ${userData.name} on ${slotDate} at ${slotTime}`,
    );

    res.json({
      success: true,
      message: isFirstConsultation
        ? "Free Consultation Booked"
        : "Proceed to Payment",
      consultationId: newConsultation._id,
      amount,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//razorpay payment api for consultation
const paymentConsultation = async (req, res) => {
  try {
    const { consultationId } = req.body;

    const consultationData = await consultationModel.findById(consultationId);

    if (!consultationData || consultationData.cancelled) {
      return res.json({ success: false, message: "Invalid consultation" });
    }

    const options = {
      amount: consultationData.amount * 100, // amount in paise
      currency: process.env.CURRENCY,
      receipt: consultationId,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//apis for listing consultations
const listConsultations = async (req, res) => {
  try {
    const userId = req.userId;
    const consultations = await consultationModel.find({ userId });

    res.json({ success: true, consultations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// cancel consultation
const cancelConsultation = async (req, res) => {
  try {
    const userId = req.userId;
    const { consultationId } = req.body;

    const consultationData = await consultationModel.findById(consultationId);

    if (!consultationData) {
      return res.json({ success: false, message: "Consultation not found" });
    }

    // 🔒 verify user
    if (consultationData.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    // ❌ mark cancelled
    await consultationModel.findByIdAndUpdate(consultationId, {
      cancelled: true,
    });

    const { userData, docData, slotDate, slotTime } = consultationData;

    // 📧 USER EMAIL
    await sendEmail(
      userData.email,
      "Consultation Cancelled - DocPulse",
      cancelAppointmentTemplate(
        userData.name,
        docData.name,
        slotDate,
        slotTime,
      ),
    );

    // 📧 DOCTOR EMAIL
    await sendEmail(
      docData.email,
      "Consultation Cancelled",
      `Consultation with ${userData.name} on ${slotDate} at ${slotTime} has been cancelled.`,
    );

    res.json({ success: true, message: "Consultation cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🔥 GET CHAT HISTORY
const getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const messages = await messageModel.find({ chatRoomId });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getConsultationByRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    const consultation = await consultationModel.findOne({ chatRoomId });

    res.json({ success: true, consultation });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🔥 VERIFY CONSULTATION PAYMENT
const verifyConsultationRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await consultationModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  verifyConsultationRazorpay,
  verifyOTP,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  googleAuth,
  logoutUser,
  verifyUser,
  bookConsultation,
  listConsultations,
  paymentConsultation,
  cancelConsultation,
  getChatMessages,
  getConsultationByRoom,
};
