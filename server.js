const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const bearerToken = process.env.TWITTER_BEARER_TOKEN;
const apiKey = process.env.TWITTER_API_KEY;
// Add any other env vars you're using

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the $SOLBEAR GPT API" });
});

// 🔥 Moved this after `app` is defined
app.get("/openapi.json", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi.json"));
});

app.post("/gpt", (req, res) => {
  const { message } = req.body;
  res.json({ response: `SOLBEAR heard: ${message}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
