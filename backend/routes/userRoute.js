import express from "express";
import {
  registerUser,
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
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import passport from "passport";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.get("/verify", authUser, verifyUser);
userRouter.post("/verify-otp", verifyOTP);

userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile,
);

userRouter.post("/book-appointment", authUser, bookAppointment);

userRouter.get("/appointments", authUser, listAppointment);

userRouter.post("/cancel-appointment", authUser, cancelAppointment);

userRouter.post("/payment-razorpay", authUser, paymentRazorpay);

userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

userRouter.get("/google", (req, res, next) => {
  const origin = req.query.origin || "user";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state: origin,
  })(req, res, next);
});

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleAuth,
);

//consultation related routes
userRouter.post("/book-consultation", authUser, bookConsultation);
userRouter.post("/payment-consultation", authUser, paymentConsultation);
userRouter.get("/consultations", authUser, listConsultations);
userRouter.post("/cancel-consultation", authUser, cancelConsultation);
userRouter.get('/chat/:chatRoomId', getChatMessages)
userRouter.get("/consultation/:chatRoomId", getConsultationByRoom);

export default userRouter;
