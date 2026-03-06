import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

async function extractPDF() {
  try {

    // Read PDF
    const pdfData = new Uint8Array(
      fs.readFileSync("./knowledge/villa-guide.pdf")
    );

    // Load PDF
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    let text = "";

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map(item => item.str);
      text += strings.join(" ") + " ";
    }

    // Convert to simple knowledge format
    const knowledge = [
      {
        question: "villa booking amount",
        answer: text
      }
    ];

    // Save to knowledge.json
    fs.writeFileSync(
      "./knowledge/knowledge.json",
      JSON.stringify(knowledge, null, 2)
    );

    console.log("✅ PDF converted to knowledge.json successfully");

  } catch (error) {
    console.error("❌ Error processing PDF:", error);
  }
}

extractPDF();