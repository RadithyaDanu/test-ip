const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Papa = require("papaparse");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Schema & Model langsung di sini ===
const visitorSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
const Visitor = mongoose.model("Visitor", visitorSchema);

// === Connect ke MongoDB ===
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === Homepage route: simpan IP ===
app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    await Visitor.create({ ip, userAgent });
    console.log(`Logged: ${ip} - ${userAgent}`);
  } catch (err) {
    console.error("Failed to log visitor:", err);
  }

  res.send(`
    <h1>Halo</h1>
    <p>IP address kamu adalah: <strong>${ip}</strong></p>
  `);
});

// === Logs route: lihat semua log sebagai JSON ===
app.get("/logs", async (req, res) => {
  try {
    const logs = await Visitor.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data logs" });
  }
});

// === Logs CSV route: export log sebagai CSV ===
app.get("/logs.csv", async (req, res) => {
  try {
    const logs = await Visitor.find().sort({ timestamp: -1 });

    const csv = Papa.unparse(
      logs.map((log) => ({
        IP: log.ip,
        UserAgent: log.userAgent,
        Timestamp: log.timestamp,
      }))
    );

    res.header("Content-Type", "text/csv");
    res.attachment("visitor-logs.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).send("Gagal export CSV");
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
