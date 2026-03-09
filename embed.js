import fs from "fs";
import path from "path";

// Load knowledge base
export function loadKnowledge() {
  try {

    const filePath = path.join("./knowledge", "knowledge.json");

    const data = fs.readFileSync(filePath, "utf8");

    const knowledge = JSON.parse(data);

    console.log("✅ Knowledge base loaded");

    return knowledge;

  } catch (error) {

    console.error("❌ Error loading knowledge base:", error);

    return [];
  }
}


// Find answer from knowledge base
export function searchKnowledge(question, knowledge) {

  const q = question.toLowerCase();

  for (const item of knowledge) {

    if (q.includes(item.question.toLowerCase())) {
      return item.answer;
    }

  }

  return null;
}