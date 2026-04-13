import express from "express";
import {
  addReview,
  getTopReviews,
  getDoctorReviews,
} from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";

const reviewRouter = express.Router();

// Fetch Global Top Reviews (Public)
reviewRouter.get("/top", getTopReviews);

// Fetch Doctor Specific Top Reviews (Public)
reviewRouter.get("/doctor/:docId", getDoctorReviews);

// Add a New Review (Authenticated)
reviewRouter.post("/add", authUser, addReview);

export default reviewRouter;
