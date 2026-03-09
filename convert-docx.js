import fs from "fs";
import mammoth from "mammoth";

async function convertDocx() {

  try {

    const result = await mammoth.extractRawText({
      path: "./ZEA_CRM_Knowledge_Base (1).docx"
    });

    const text = result.value;

    const sections = text.split("\n\n");

    const knowledge = sections.map((section, index) => ({
      question: "zea crm section " + (index + 1),
      answer: section.trim()
    }));

    fs.writeFileSync(
      "./knowledge/knowledge.json",
      JSON.stringify(knowledge, null, 2)
    );

    console.log("✅ DOCX converted to knowledge.json");

  } catch (error) {

    console.error("❌ Error converting DOCX:", error);

  }

}

convertDocx();