import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Chatbot started. Ask your question:");

async function askQuestion(question) {

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

  console.log("\nBot:", data.reply);
}

rl.on("line", async (input) => {
  await askQuestion(input);
});