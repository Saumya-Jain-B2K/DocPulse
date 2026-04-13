import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  docData: {
    type: Object,
    required: true,
  },
  slotDate: {
    type: String,
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  isFirstConsultation: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  chatRoomId: {
    type: String,
    required: true,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Number,
    required: true,
  },
});

const consultationModel =
  mongoose.models.consultation ||
  mongoose.model("consultation", consultationSchema);

export default consultationModel;
