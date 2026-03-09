import fs from "fs";
import mammoth from "mammoth";

async function convertDocx() {

  const result = await mammoth.extractRawText({
    path: "./ZEA_CRM_Knowledge_Base (1).docx"
  });

  const text = result.value;

  // split by numbered headings
  const sections = text.split(/\n\d+\.\s+/);

  const knowledge = [];

  sections.forEach(section => {

    const clean = section.trim();

    if (clean.length < 100) return;

    const title = clean.split("\n")[0].toLowerCase();

    knowledge.push({
      category: title,
      question: "tell me about " + title,
      keywords: title.split(" ").slice(0,4),
      answer: clean
    });

  });

  fs.writeFileSync(
    "./knowledge/knowledge.json",
    JSON.stringify(knowledge, null, 2)
  );

  console.log("✅ Knowledge base generated from DOCX");

}

convertDocx();