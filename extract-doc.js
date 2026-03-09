import mammoth from "mammoth";
import fs from "fs";

async function extract() {

  const result = await mammoth.extractRawText({
    path: "./ZEA_CRM_Knowledge_Base (1).docx"
  });

  fs.writeFileSync("./knowledge/raw.txt", result.value);

  console.log("✅ Document extracted successfully");

}

extract();