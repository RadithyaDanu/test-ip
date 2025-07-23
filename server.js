// server.js
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware biar bisa dapet IP asli walaupun di belakang proxy
app.set("trust proxy", true);

app.get("/", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;

  res.send(`
    <html>
      <head>
        <title>IP Checker</title>
      </head>
      <body style="text-align: center; font-family: sans-serif; margin-top: 50px;">
        <h1>Halo 👋</h1>
        <p>IP address kamu adalah:</p>
        <h2>${ip}</h2>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server jalan di port ${port}`);
});
