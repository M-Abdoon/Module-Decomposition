import express from "express";

const app = express();
const port = 3002;

app.use(express.json());

const context = new Map();

app.use((req, res, next) => {
  const id = Date.now();
  context.set(id, {
    reqId: id,
    token: req.get("X-Username"),
    payload: null
  });
  req.ctxId = id;
  next();
});

app.post("/", (req, res) => {
  const ctx = context.get(req.ctxId);
  const arr = req.body || [];

  const isValid = Array.isArray(arr) && arr.every(x => typeof x === "string");
  
  if (!isValid && req.body) {
    return res.status(400).json({ msg: "Bad format" });
  }

  ctx.payload = arr;

  const summary = {
    access: ctx.token ? `user: ${ctx.token}` : "public",
    count: arr.length,
    items: arr.length ? arr : null
  };

  res.json(summary);

  context.delete(req.ctxId);
});

app.listen(port, () => {
  console.log(`Listener running: ${port}`);
});