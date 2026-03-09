import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

/* ---------------------------
   GROQ AI SETUP
----------------------------*/

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ---------------------------
   LOAD LOCAL KNOWLEDGE
----------------------------*/

let knowledge = [];

try {

  knowledge = JSON.parse(
    fs.readFileSync("./knowledge/knowledge.json", "utf8")
  );

  console.log("✅ Local knowledge loaded");

} catch (err) {

  console.error("❌ Error loading local knowledge:", err);

}

/* ---------------------------
   FETCH GHL KNOWLEDGE BASE
----------------------------*/

async function getGHLKnowledge() {

  try {

    const locationId = "tob1bWz89F7E839GM3el";

    const response = await fetch(
      `https://services.leadconnectorhq.com/knowledge-bases?locationId=${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {

      console.log("⚠ GHL API returned error");
      return "";

    }

    const data = await response.json();

    if (data && data.knowledgeBases) {

      const ghlText = data.knowledgeBases
        .map((kb) => kb.name + " " + kb.description)
        .join("\n");

      return ghlText;

    }

    return "";

  } catch (error) {

    console.error("❌ Error fetching GHL knowledge:", error);
    return "";

  }

}

/* ---------------------------
   CHAT API
----------------------------*/

app.post("/chat", async (req, res) => {

  try {

    const userMessage = (req.body.message || "").toLowerCase();

    if (!userMessage) {

      return res.json({
        reply: "Please ask a question."
      });

    }

    console.log("\n--------------------------------");
    console.log("👤 User Question:", userMessage);

    /* ---------------------------
       SEARCH LOCAL KNOWLEDGE
    ----------------------------*/

    const match = knowledge.find((item) =>
      userMessage.includes(item.question.toLowerCase()) ||
      item.question.toLowerCase().includes(userMessage)
    );

    if (match) {

      console.log("✅ RESPONSE FROM LOCAL KNOWLEDGE BASE");
      console.log("📄 KB Question:", match.question);
      console.log("📄 KB Answer:", match.answer);

      return res.json({
        reply: match.answer,
        source: "LOCAL_KB"
      });

    }

    console.log("⚠ No match found in Local KB → Using AI");

    /* ---------------------------
       FETCH GHL KNOWLEDGE
    ----------------------------*/

    const ghlContext = await getGHLKnowledge();

    console.log("📚 GHL Knowledge Length:", ghlContext.length);

    /* ---------------------------
       ASK GROQ AI
    ----------------------------*/

    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer ONLY using the provided knowledge base."
        },
        {
          role: "user",
          content: `
GHL Knowledge:
${ghlContext}

Question:
${userMessage}
`
        }
      ]

    });

    const reply = completion.choices[0].message.content;

    console.log("🤖 RESPONSE FROM GROQ AI");
    console.log("🤖 AI Answer:", reply);

    res.json({
      reply: reply,
      source: "AI"
    });

  } catch (error) {

    console.error("❌ Server error:", error);

    res.status(500).json({
      reply: "Server error occurred while processing the request."
    });

  }

});

/* ---------------------------
   START SERVER
----------------------------*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`🚀 MCP Server running on port ${PORT}`);

});