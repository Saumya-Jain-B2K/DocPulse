const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");

const validSpecialities = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist"
];

/**
 * 🛠️ LangChain Tool: Search MongoDB Doctors via API
 * Connects to the main backend API to fetch real doctors.
 */
const recommendDoctorTool = tool(
  async ({ speciality }) => {
    try {
      console.log(`[TOOLS] Hitting Main Backend to search for: ${speciality}`);
      // Internal microservice GET request to DocPulse master backend API
      const response = await axios.get("http://localhost:4000/api/doctor/list");
      
      if (!response.data || !response.data.success) {
          return "I could not retrieve the doctor list at this time.";
      }

      const allDoctors = response.data.doctors;
      
      // Filter logic: Match speciality exactly AND ensure they are marked as available
      const matchedDoctors = allDoctors.filter(doc => 
          doc.speciality === speciality && doc.available === true
      );

      if (matchedDoctors.length === 0) {
          return `I couldn't find any available doctors specializing in ${speciality} at the moment.`;
      }

      // Return limit top 3 doctors safely as a JSON string to our agent logic
      const topDoctors = matchedDoctors.slice(0, 3).map(doc => ({
         id: doc._id,
         name: doc.name,
         degree: doc.degree,
         fees: doc.fees
      }));

      return JSON.stringify(topDoctors);
    } catch (error) {
      console.error("[TOOLS] Error fetching doctors from internal API:", error.message);
      return "An error occurred while trying to find a doctor in my database.";
    }
  },
  {
    name: "recommend_doctor_speciality",
    description: "Use this tool ONLY when you have diagnosed the user's issue and are ready to recommend exactly ONE medical speciality from the list. It will verify availability and return real doctor details.",
    schema: z.object({
      speciality: z.enum(validSpecialities).describe("The medical speciality to recommend."),
    }),
  }
);

module.exports = {
  tools: [recommendDoctorTool]
};
