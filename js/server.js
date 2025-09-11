import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("newsletter");
const subscribers = db.collection("subscribers");

app.post("/subscribe", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Missing data" });

    await subscribers.insertOne({ name, email, createdAt: new Date() });
    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

const start = async () => {
  await client.connect();
  app.listen(3000, () => console.log("Listening on port 3000"));
};
start();