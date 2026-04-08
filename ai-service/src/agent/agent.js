import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, END, START, MemorySaver } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// Import the tools (this now connects to the backend MongoDB wrapper via Axios)
import { tools } from "./tools.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.2,
});

// Bind tools to LLM
const llmWithTools = llm.bindTools(tools);

/**
 * State Definition
 */
const agentState = {
  messages: {
    // Reducer function: appends new messages to existing memory array
    value: (x, y) => x.concat(y),
    default: () => [],
  },
  recommendedSpeciality: {
    value: (x, y) => y !== undefined ? y : x,
    default: () => null,
  }
};

/**
 * Node: Chatbot
 */
async function chatbotNode(state) {
  const { messages } = state;

  const systemPrompt = new SystemMessage(
    `You are an expert AI medical triage assistant for DocPulse. 
Your primary goal is to gather detailed medical information from the user BEFORE making any recommendations.
STRICT RULES:
1. ALWAYS ask at least 2 to 3 clarifying follow-up questions (e.g., severity on a scale of 1-10, exactly when it started, any other associated symptoms like fever or nausea).
2. NEVER call the 'recommend_doctor_speciality' tool on your first response. You MUST engage in a back-and-forth conversation first.
3. Only CALL the 'recommend_doctor_speciality' tool once you accurately understand their symptoms after asking follow-ups.
4. IMPORTANT: After the tool returns the list of real doctors, you MUST respond with a clean, final summary that includes:
   - A brief summary of their described problem.
   - Basic diagnosis / First Aid advice that is safe to do at home.
   - The list of doctors that the tool returned to you.
5. Keep your tone empathetic and professional.`
  );

  // Invoke the LLM with the full history (system prompt + everything stored in the state)
  const response = await llmWithTools.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
}

/**
 * Conditional Router
 */
function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // Output is a tool call -> Route to tools
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  
  // Output is standard text reply -> End execution
  return END;
}

/**
 * **LANGGRAPH IN-MEMORY CHECKPOINTER**
 */
const memory = new MemorySaver();

const workflow = new StateGraph({ channels: agentState })
  .addNode("agent", chatbotNode)
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  // **NEW**: After the tool fetches doctors from MongoDB, return to the agent so it can generate a final diagnosis and first-aid summary!
  .addEdge("tools", "agent"); 

// Compile with the checkpointer!
const app = workflow.compile({ checkpointer: memory });

/**
 * Export Function called by socket.js
 */
async function processSymptom(newMessages, threadId) {
  try {
    const formattedMessages = newMessages.map(msg =>
      msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    const config = { configurable: { thread_id: threadId } };
    const resultState = await app.invoke({ messages: formattedMessages }, config);
    
    const messages = resultState.messages;
    
    // Because the agent naturally responds AFTER the tool now, the absolute last message is the exact natural language response we want!
    const lastMessage = messages[messages.length - 1];
    let finalMessage = lastMessage.content;

    // We can still optionally extract the speciality and doctors for the frontend structural UI, if needed
    let finalSpeciality = null;
    let returnedDoctors = null;

    // Scan backwards to find the last AI message that executed a tool call
    const lastToolCallAI = messages.slice().reverse().find(m => m._getType() === 'ai' && m.tool_calls && m.tool_calls.length > 0);
    
    if (lastToolCallAI) {
      finalSpeciality = lastToolCallAI.tool_calls[0].args.speciality;
      const toolOutputMsg = messages.find(m => m._getType() === 'tool' && m.tool_call_id === lastToolCallAI.tool_calls[0].id);
      
      if (toolOutputMsg) {
        try {
          returnedDoctors = JSON.parse(toolOutputMsg.content);
        } catch (e) {
          // ignore
        }
      }
    }

    return {
      message: finalMessage,
      speciality: finalSpeciality,
      doctors: returnedDoctors
    };
  } catch (error) {
    console.error("LangGraph processing error:", error);
    throw error;
  }
}

export { processSymptom };
