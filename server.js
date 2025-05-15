const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables (example placeholders)
const bearerToken = process.env.TWITTER_BEARER_TOKEN;
const apiKey = process.env.TWITTER_API_KEY;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the $SOLBEAR GPT API" });
});

// ✅ Serve openapi.json with correct MIME type
app.get("/openapi.json", (req, res) => {
  res.type("application/json");
  res.sendFile(path.join(__dirname, "openapi.json"));
});

// ✅ Basic /gpt endpoint for GPT testing
app.post("/gpt", (req, res) => {
  const { message } = req.body;
  res.json({ response: `SOLBEAR heard: ${message}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
