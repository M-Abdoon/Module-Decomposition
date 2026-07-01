import express from "express";

const app = express();
const port = 3001;

app.use(express.text({ type: "application/x-www-form-urlencoded" }));

class RequestHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.user = null;
    this.entries = [];
  }

  extractCredentials() {
    this.user = this.req.get("X-Username");
    return this;
  }

  processPayload() {
    const raw = this.req.body;
    if (!raw || !raw.trim()) {
      return this;
    }

    try {
      const content = JSON.parse(raw);
      if (!Array.isArray(content)) throw new Error("not array");
      if (!content.every(el => typeof el === "string")) throw new Error("not strings");
      this.entries = content;
    } catch (e) {
      this.res.status(400).json({ error: "Invalid input format" });
    }
    return this;
  }

  buildReply() {
    const status = this.user ? `Logged in: ${this.user}` : "Anonymous";
    const count = this.entries.length;
    const itemType = count === 1 ? "item" : "items";
    const details = count > 0 ? `[${this.entries.map(e => `"${e}"`).join(", ")}]` : "[]";
    
    return `Status: ${status}\nQuery: ${count} ${itemType}\nData: ${details}`;
  }

  send() {
    this.res.send(this.buildReply());
  }
}

app.post("/", (req, res) => {
  const handler = new RequestHandler(req, res);
  handler.extractCredentials().processPayload().send();
});

app.listen(port, () => {
  console.log(`Server active on port ${port}`);
});