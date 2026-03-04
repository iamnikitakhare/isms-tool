import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("isms.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    asset TEXT,
    threat TEXT,
    score INTEGER,
    status TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    time TEXT
  );

  CREATE TABLE IF NOT EXISTS compliance (
    label TEXT PRIMARY KEY,
    value INTEGER,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    daysLeft TEXT,
    color TEXT
  );
`);

// Seed Data if empty
const riskCount = db.prepare("SELECT COUNT(*) as count FROM risks").get() as { count: number };
if (riskCount.count === 0) {
  const insertRisk = db.prepare("INSERT INTO risks (id, asset, threat, score, status, color) VALUES (?, ?, ?, ?, ?, ?)");
  insertRisk.run('R-001', 'CRM', 'Data Leak', 20, 'Critical', 'text-rose-600 bg-rose-50');
  insertRisk.run('R-002', 'HRMS', 'Access issue', 15, 'High', 'text-orange-600 bg-orange-50');
  insertRisk.run('R-003', 'Server', 'Misconfig', 12, 'Medium', 'text-amber-600 bg-amber-50');
  insertRisk.run('R-004', 'Email', 'Phishing', 8, 'Low', 'text-emerald-600 bg-emerald-50');

  const insertActivity = db.prepare("INSERT INTO activities (type, title, time) VALUES (?, ?, ?)");
  insertActivity.run('risk', 'Risk MKT-01 updated', '2 mins ago');
  insertActivity.run('policy', 'New Policy approved', '1 hour ago');
  insertActivity.run('incident', 'Incident INC-04 closed', '3 hours ago');
  insertActivity.run('audit', 'Audit scheduled', '1 day ago');
  insertActivity.run('training', 'Training completed', '2 days ago');

  const insertCompliance = db.prepare("INSERT INTO compliance (label, value, color) VALUES (?, ?, ?)");
  insertCompliance.run('ISO 27001', 72, 'bg-blue-600');
  insertCompliance.run('DPDPA 2023', 60, 'bg-emerald-500');
  insertCompliance.run('Policies Updated', 85, 'bg-purple-500');
  insertCompliance.run('Training Completed', 90, 'bg-orange-500');

  const insertAudit = db.prepare("INSERT INTO audits (title, date, daysLeft, color) VALUES (?, ?, ?, ?)");
  insertAudit.run('Internal Audit #1', '25 Apr 2024', '3 days left', 'bg-rose-500');
  insertAudit.run('Vendor Audit', '02 May 2024', '10 days left', 'bg-orange-500');
  insertAudit.run('ISMS Review', '15 May 2024', '23 days left', 'bg-blue-500');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/risks", (req, res) => {
    const risks = db.prepare("SELECT * FROM risks").all();
    res.json(risks);
  });

  app.get("/api/activities", (req, res) => {
    const activities = db.prepare("SELECT * FROM activities ORDER BY id DESC").all();
    res.json(activities);
  });

  app.get("/api/compliance", (req, res) => {
    const compliance = db.prepare("SELECT * FROM compliance").all();
    res.json(compliance);
  });

  app.get("/api/audits", (req, res) => {
    const audits = db.prepare("SELECT * FROM audits").all();
    res.json(audits);
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      riskScore: 72,
      openIncidents: 4,
      highIncidents: 2,
      auditFindings: 6,
      pendingFindings: 3,
      soaProgress: 65,
      soaControls: "26/40"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
