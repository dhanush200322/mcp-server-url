import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import cosineSimilarity from "compute-cosine-similarity";
import { pipeline } from "@xenova/transformers";

dotenv.config();

const app = express();
app.use(express.json());

/* ---------------------------
   GROQ SETUP
----------------------------*/

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* ---------------------------
   LOAD VECTOR DATABASE
----------------------------*/

const vectorDB = JSON.parse(
  fs.readFileSync("./knowledge/vector-db.json", "utf8")
);

console.log("✅ Vector DB loaded:", vectorDB.length);

/* ---------------------------
   LOAD EMBEDDING MODEL
----------------------------*/

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

console.log("✅ Embedding model loaded");

/* ---------------------------
   VECTOR SEARCH FUNCTION
----------------------------*/

async function searchKnowledge(question) {

  const queryEmbedding = await embedder(question, {
    pooling: "mean",
    normalize: true
  });

  const queryVector = Array.from(queryEmbedding.data);

  let scores = [];

  for (let item of vectorDB) {

    const score = cosineSimilarity(queryVector, item.embedding);

    scores.push({
      text: item.text,
      score: score
    });

  }

  // sort by similarity score
  scores.sort((a, b) => b.score - a.score);

  const topChunks = scores.slice(0, 3);

  console.log("🔎 Top similarity scores:");
  topChunks.forEach((c, i) => {
    console.log(`Chunk ${i + 1}:`, c.score);
  });

  return topChunks.map(c => c.text).join("\n\n");

}

/* ---------------------------
   CHAT API
----------------------------*/

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({
        reply: "Please ask a question."
      });
    }

    console.log("\n--------------------------------");
    console.log("👤 User Question:", userMessage);

    const context = await searchKnowledge(userMessage);

    console.log("📚 Retrieved Knowledge Chunks:\n");
    console.log(context.substring(0, 300), "...");

    /* ---------------------------
       GROQ AI RESPONSE
    ----------------------------*/

    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant. Answer ONLY using the provided knowledge base. If the answer is not present, say you don't know."
        },
        {
          role: "user",
          content: `
Knowledge Base:
${context}

Question:
${userMessage}
`
        }
      ]

    });

    const reply = completion.choices[0].message.content;

    console.log("🤖 AI Answer:", reply);

    res.json({ reply });

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

  console.log(`🚀 MCP AI Server running on port ${PORT}`);

});