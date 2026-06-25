import express from "express";
import cors from "cors";

let messages = [
  {
    message: "Hi! welcome to the app, you can send messages now.",
    sender: "Mohammed Abdoon",
    timestamp: 1,
  },
];

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "https://m-abdoon-chatapp-frontend.hosting.codeyourfuture.io",
    ],
  }),
);
app.use(express.json());

app.get("/getMessages", (req, res) => {
  // since=timestamp
  const since = parseInt(req.query.since) || 0;
  const newMessages = messages.filter((msg) => msg.timestamp > since);
  res.json(newMessages);
});

app.post("/sendMessage", (req, res) => {
  const { message, sender } = req.body;
  if (message && sender) {
    messages.push({ message, sender, timestamp: Date.now() });

    console.log("New message received:", { message, sender });
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Invalid message data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
