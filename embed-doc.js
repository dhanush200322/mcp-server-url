import fs from "fs";
import { pipeline } from "@xenova/transformers";

const chunks = JSON.parse(
  fs.readFileSync("./knowledge/chunks.json", "utf8")
);

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

const vectorDB = [];

for (let chunk of chunks) {

  const output = await embedder(chunk, {
    pooling: "mean",
    normalize: true,
  });

  vectorDB.push({
    text: chunk,
    embedding: Array.from(output.data),
  });

}

fs.writeFileSync(
  "./knowledge/vector-db.json",
  JSON.stringify(vectorDB, null, 2)
);

console.log("Embeddings created:", vectorDB.length);