const express = require("express");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function emptyState() {
  return { shopName: "Dönerbude", deadline: "", orders: [] };
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) return emptyState();
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return emptyState(); }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

app.get("/api/state", (req, res) => res.json(readData()));

app.get("/api/share", async (req, res) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  const url = `${proto}://${host}/`;
  try {
    const qr = await QRCode.toDataURL(url, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: "M"
    });
    res.json({ url, qr });
  } catch (err) {
    res.status(500).json({ error: "QR-Code konnte nicht erzeugt werden." });
  }
});

app.post("/api/order", (req, res) => {
  const { name, item, bread, meat, sauce, extras, quantity, note, price, total } = req.body;
  if (!name || !item) return res.status(400).json({ error: "Name und Gericht sind Pflicht." });

  const data = readData();
  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    name: String(name).trim().slice(0, 60),
    item: String(item).trim().slice(0, 80),
    bread: String(bread || "").trim().slice(0, 80),
    meat: String(meat || "").trim().slice(0, 80),
    sauce: String(sauce || "").trim().slice(0, 80),
    extras: Array.isArray(extras) ? extras.map(String).slice(0, 20) : [],
    quantity: Math.min(10, Math.max(1, Number(quantity) || 1)),
    price: Number(price) || 0,

total: Number(total) || 0,
    note: String(note || "").trim().slice(0, 200),
    createdAt: new Date().toISOString()
  };
  data.orders.push(order);
  writeData(data);
  res.json(order);
});

app.delete("/api/order/:id", (req, res) => {
  const data = readData();
  data.orders = data.orders.filter(o => o.id !== req.params.id);
  writeData(data);
  res.json({ ok: true });
});

app.post("/api/settings", (req, res) => {
  const data = readData();
  if (typeof req.body.shopName === "string") {
    data.shopName = req.body.shopName.trim().slice(0, 100) || "Dönerbude";
  }
  if (typeof req.body.deadline === "string") data.deadline = req.body.deadline;
  writeData(data);
  res.json(data);
});

app.post("/api/reset", (req, res) => {
  const data = readData();
  data.orders = [];
  writeData(data);
  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Döner-Runde läuft auf http://localhost:${PORT}`);
});
