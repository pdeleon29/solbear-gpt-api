const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the $SOLBEAR GPT API" });
});

// Example POST route (for actions, GPT integration, etc.)
app.post("/gpt", (req, res) => {
  const { message } = req.body;
  res.json({ response: `SOLBEAR heard: ${message}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
