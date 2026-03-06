import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const knowledge = JSON.parse(
  fs.readFileSync("./knowledge/knowledge.json", "utf-8")
);

// ONLY ONE FUNCTION
async function getGHLKnowledge() {
  try {

    const locationId = "tob1bWz89F7E839GM3el";

    const response = await fetch(
      `https://services.leadconnectorhq.com/knowledge-bases/location/${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching GHL knowledge:", error);
    return null;
  }
}

app.post("/chat", async (req, res) => {
  try {

    const userMessage = req.body.message.toLowerCase();

    const match = knowledge.find((item) =>
      userMessage.includes(item.question.toLowerCase())
    );

    const localContext = match ? match.answer : "";

    const ghlKnowledge = await getGHLKnowledge();
    const ghlContext = JSON.stringify(ghlKnowledge);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Answer using the knowledge base."
        },
        {
          role: "user",
          content: `
Local Knowledge:
${localContext}

GHL Knowledge:
${ghlContext}

Question:
${userMessage}
`
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Server error occurred while processing the request."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});