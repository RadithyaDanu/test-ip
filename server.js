require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let ipLogsCollection;

// connect ke MongoDB dan simpan referensinya
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("iplogger"); // bisa ganti nama DB sesuai keinginan
    ipLogsCollection = db.collection("logs");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
  }
}
connectDB();

app.use(express.static(path.join(__dirname, 'public')));

// Route buat ngambil dan log IP
app.get('/get-ip', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const timestamp = new Date();

  // Simpan ke database
  try {
    await ipLogsCollection.insertOne({ ip, userAgent, timestamp });
    res.json({ ip });
  } catch (err) {
    console.error("❌ Error logging IP:", err);
    res.status(500).json({ error: "Gagal menyimpan IP" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
