import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

let messages = [
  {
    id: 1,
    message: "Hi! welcome to the app, you can send messages now.",
    sender: "Mohammed Abdoon",
    timestamp: 1,
    likes: 0,
    dislikes: 0,
  },
];

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "http://127.0.0.1:5500",
      "https://m-abdoon-chatapp.hosting.codeyourfuture.io",
    ],
  }),
);
app.use(express.json());

app.get("/getMessages", (req, res) => {
  const since = parseInt(req.query.since) || 0;
  const newMessages = messages.filter((msg) => msg.timestamp > since);
  res.json(newMessages);
});

app.post("/sendMessage", (req, res) => {
  const { message, sender, replyTo } = req.body;
  if (message && sender) {
    const timestamp = Date.now();
	const id = 
    messages.push({
      id: randomUUID(),
      message,
      sender,
      timestamp,
      likes: 0,
      dislikes: 0,
      replyTo: replyTo || null,
    });

    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Invalid message data" });
  }
});

app.post("/reactMessage", (req, res) => {
  const { id, reaction } = req.body;
  const message = messages.get(Number(id));

  if (!message || !["like", "dislike"].includes(reaction)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid reaction request" });
  }

  if (reaction === "like") {
    message.likes += 1;
  } else {
    message.dislikes += 1;
  }

  res.status(200).json({ success: true, message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
