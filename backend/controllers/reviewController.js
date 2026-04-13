import reviewModel from "../models/reviewModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// Add a new review
const addReview = async (req, res) => {
  try {
    const { appointmentId, rating, summary } = req.body;
    const userId = req.userId;

    // Validate appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.json({
        success: false,
        message: "Not authorized to review this appointment",
      });
    }

    if (appointmentData.isReviewed) {
      return res.json({
        success: false,
        message: "Appointment already reviewed",
      });
    }

    // Create the review
    const newReview = new reviewModel({
      appointmentId,
      docId: appointmentData.docId,
      userId,
      rating: Number(rating),
      summary,
      date: Date.now(),
    });
    await newReview.save();

    // Mark appointment as reviewed
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isReviewed: true,
    });

    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.log("Add Review Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get Top Reviews globally for Testimonials
const getTopReviews = async (req, res) => {
  try {
    // Fetch top rated reviews, limit to 10
    const reviews = await reviewModel
      .find({ rating: { $gte: 4 } })
      .sort({ rating: -1, date: -1 })
      .limit(10)
      .populate("userId", "name image");

    // Map and format the result for the frontend
    const formattedReviews = reviews.map((rev) => ({
      id: rev._id,
      name: rev.userId?.name || "Anonymous",
      role: "Patient",
      image:
        rev.userId?.image ||
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      rating: rev.rating,
      text: rev.summary,
    }));

    res.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.log("Get Top Reviews Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get Reviews for a specific doctor
const getDoctorReviews = async (req, res) => {
  try {
    const { docId } = req.params;

    const reviews = await reviewModel
      .find({ docId })
      .sort({ date: -1 })
      .limit(10)
      .populate("userId", "name image");

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }

    const formattedReviews = reviews.map((rev) => ({
      id: rev._id,
      name: rev.userId?.name || "Anonymous",
      image:
        rev.userId?.image ||
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
      rating: rev.rating,
      text: rev.summary,
      date: rev.date,
    }));

    res.json({
      success: true,
      reviews: formattedReviews,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    console.log("Get Doctor Reviews Error:", error);
    res.json({ success: false, message: error.message });
  }
};

export { addReview, getTopReviews, getDoctorReviews };
