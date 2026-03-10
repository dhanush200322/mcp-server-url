import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 RAG Chatbot Started");
console.log("Ask your question:\n");

function formatResponse(answer) {

  return `
────────────────────────────────

📘 Topic
${extractTopic(answer)}

🧠 Explanation
${answer}

📚 Source
Knowledge Base

────────────────────────────────
`;
}

function extractTopic(text) {

  const words = text.split(" ").slice(0,4).join(" ");
  return words;

}

async function askQuestion(question) {

  try {

    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    });

    const data = await response.json();

    const formatted = formatResponse(data.reply);

    console.log(formatted);

  } catch (error) {

    console.log("❌ Error connecting to RAG server:", error.message);

  }
}

rl.on("line", async (input) => {

  if (input.toLowerCase() === "exit") {
    console.log("👋 Chatbot stopped");
    process.exit();
  }

  await askQuestion(input);

});