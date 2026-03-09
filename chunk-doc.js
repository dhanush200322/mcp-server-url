import fs from "fs";

const text = fs.readFileSync("./knowledge/raw.txt", "utf8");

// chunk size
const chunkSize = 800;

const chunks = [];

for (let i = 0; i < text.length; i += chunkSize) {

  chunks.push(text.substring(i, i + chunkSize));

}

fs.writeFileSync(
  "./knowledge/chunks.json",
  JSON.stringify(chunks, null, 2)
);

console.log("Chunks created:", chunks.length);