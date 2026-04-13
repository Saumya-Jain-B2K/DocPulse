import { Server } from "socket.io";
import { processSymptom } from "../agent/agent.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"], // specific origin instead of '*' to allow credentials
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.io Middleware for Authentication
  io.use((socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      if (!rawCookies) {
        return next(new Error("Authentication error: No cookies found."));
      }

      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies.token; // "token" is the name used in your main backend `authUser.js`

      if (!token) {
        return next(
          new Error(
            "Authentication error: Token missing. Please log in again.",
          ),
        );
      }

      // Verify JWT against DocPulse master secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user ID directly to the socket context for potential future logic
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket authentication failed:", err.message);
      next(new Error("Authentication error: Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔒 Authenticated User connected to AI Service [ID: ${socket.userId}] (Socket: ${socket.id})`,
    );

    socket.on("user_message", async (data) => {
      try {
        // If Postman passes the payload as a raw string instead of a Socket.io object, parse it
        if (typeof data === "string") {
          data = JSON.parse(data);
        }

        if (!data || !data.messages) {
          throw new Error("Invalid payload. Need 'messages' array.");
        }

        console.log(`Processing message from User ${socket.userId}...`);

        // Run LangGraph Agent, passing the `userId` as the thread_id for short-term memory
        const aiResponse = await processSymptom(data.messages, socket.userId);

        // Emit final response structure
        socket.emit("ai_response", aiResponse);
      } catch (error) {
        console.error("Socket Error processing message:", error.message);
        socket.emit("ai_error", { error: "Failed to process message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
