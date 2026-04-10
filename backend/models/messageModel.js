import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoomId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const messageModel =
  mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;