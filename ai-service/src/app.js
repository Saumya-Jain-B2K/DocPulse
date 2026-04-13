import express from "express";
import cors from "cors";
import { processSymptom } from "./agent/agent.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("AI Service is running on LangChain/LangGraph with Sockets");
});

// REST Endpoint to process chat (kept for backward compatibility/testing)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Invalid messages format. Expected an array." });
    }

    const aiResponse = await processSymptom(messages);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
