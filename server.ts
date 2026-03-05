import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter setup (using a test account for demo)
let transporter: nodemailer.Transporter;

async function setupEmail() {
  try {
    // For a real app, use process.env.SMTP_HOST, etc.
    // For this demo, we'll create a test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("Email transporter ready (Ethereal test account)");
  } catch (e) {
    console.error("Failed to setup email transporter:", e);
  }
}

async function startServer() {
  await setupEmail();
  const app = express();
  const PORT = 3000;

  let db: any;
  try {
    console.log("Connecting to database...");
    db = new Database("isms.db");
    
    console.log("Initializing database schema...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pending_verifications (
        email TEXT PRIMARY KEY,
        otp TEXT NOT NULL,
        full_name TEXT,
        password TEXT,
        expires_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner TEXT,
        type TEXT,
        data_classification TEXT,
        criticality TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS risks (
        id TEXT PRIMARY KEY,
        asset_id TEXT,
        threat TEXT,
        vulnerability TEXT,
        likelihood INTEGER,
        impact INTEGER,
        risk_score INTEGER,
        status TEXT,
        treatment TEXT,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      );

      CREATE TABLE IF NOT EXISTS controls (
        control_id TEXT PRIMARY KEY,
        control_name TEXT NOT NULL,
        applicable TEXT,
        implemented TEXT,
        evidence TEXT,
        owner TEXT
      );

      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT,
        owner TEXT,
        status TEXT,
        approved_date TEXT
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        severity TEXT,
        status TEXT,
        reported_by TEXT,
        date TEXT
      );

      CREATE TABLE IF NOT EXISTS audits (
        id TEXT PRIMARY KEY,
        audit_name TEXT NOT NULL,
        type TEXT,
        scheduled_date TEXT,
        status TEXT,
        auditor TEXT
      );

      CREATE TABLE IF NOT EXISTS training (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee TEXT NOT NULL,
        course TEXT,
        status TEXT,
        completion_date TEXT
      );

      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        title TEXT,
        time DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migration: Ensure 'status' column exists in 'audits' (handling legacy schema)
    try {
      const columns = db.prepare("PRAGMA table_info(audits)").all();
      const hasStatus = columns.some((c: any) => c.name === 'status');
      if (!hasStatus) {
        console.log("Migrating 'audits' table: adding 'status' column...");
        db.exec("ALTER TABLE audits ADD COLUMN status TEXT");
      }
    } catch (e) {
      console.error("Migration failed for 'audits':", e);
    }

    // Seed Data if empty
    const assetCount = db.prepare("SELECT COUNT(*) as count FROM assets").get() as { count: number };
    if (assetCount.count === 0) {
      console.log("Seeding initial data...");
      const insertAsset = db.prepare("INSERT INTO assets (id, name, owner, type, data_classification, criticality) VALUES (?, ?, ?, ?, ?, ?)");
      insertAsset.run('ASSET-001', 'Customer CRM', 'John Doe', 'Software', 'Confidential', 'High');
      insertAsset.run('ASSET-002', 'HR Portal', 'Jane Smith', 'Software', 'Restricted', 'Medium');
      insertAsset.run('ASSET-003', 'Main Server Rack', 'IT Admin', 'Hardware', 'Internal', 'Critical');

      const insertRisk = db.prepare("INSERT INTO risks (id, asset_id, threat, vulnerability, likelihood, impact, risk_score, status, treatment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      insertRisk.run('RISK-001', 'ASSET-001', 'Data Breach', 'Weak Encryption', 3, 5, 15, 'High', 'Mitigate');
      insertRisk.run('RISK-002', 'ASSET-003', 'Hardware Failure', 'Old Equipment', 2, 5, 10, 'Medium', 'Transfer');

      const insertControl = db.prepare("INSERT INTO controls (control_id, control_name, applicable, implemented, evidence, owner) VALUES (?, ?, ?, ?, ?, ?)");
      insertControl.run('A.5.1', 'Information Security Policies', 'Yes', 'Implemented', 'Policy Doc v2', 'CISO');
      insertControl.run('A.8.1', 'User Endpoint Security', 'Yes', 'Partial', 'Antivirus Logs', 'IT Manager');
      insertControl.run('A.12.1', 'Operational Procedures', 'Yes', 'Implemented', 'SOP Manual', 'Operations');

      const insertPolicy = db.prepare("INSERT INTO policies (id, name, version, owner, status, approved_date) VALUES (?, ?, ?, ?, ?, ?)");
      insertPolicy.run('POL-001', 'Access Control Policy', '1.2', 'John Doe', 'Approved', '2024-01-15');
      insertPolicy.run('POL-002', 'Data Classification Policy', '2.0', 'Jane Smith', 'Review', '2024-02-10');

      const insertIncident = db.prepare("INSERT INTO incidents (id, title, severity, status, reported_by, date) VALUES (?, ?, ?, ?, ?, ?)");
      insertIncident.run('INC-001', 'Unauthorized Access Attempt', 'Medium', 'Closed', 'System Alert', '2024-03-01');
      insertIncident.run('INC-002', 'Phishing Email Campaign', 'High', 'Open', 'User Report', '2024-03-04');

      const insertAudit = db.prepare("INSERT INTO audits (id, audit_name, type, scheduled_date, status, auditor) VALUES (?, ?, ?, ?, ?, ?)");
      insertAudit.run('AUD-001', 'Internal ISMS Audit', 'Internal', '2024-04-20', 'Scheduled', 'External Consultant');

      const insertTraining = db.prepare("INSERT INTO training (employee, course, status, completion_date) VALUES (?, ?, ?, ?)");
      insertTraining.run('Alice Wong', 'Security Awareness 2024', 'Completed', '2024-02-15');
      insertTraining.run('Bob Miller', 'GDPR Basics', 'In Progress', '');

      const insertActivity = db.prepare("INSERT INTO activities (type, title) VALUES (?, ?)");
      insertActivity.run('asset', 'New Asset: Customer CRM added');
      insertActivity.run('risk', 'Risk RISK-001 updated');
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
  }

  app.use(express.json());

  // --- Auth Routes ---
  app.post("/api/auth/send-otp", async (req, res) => {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check if user already exists
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "You are already registered with us, kindly login." });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

      // Store in pending_verifications
      db.prepare(`
        INSERT OR REPLACE INTO pending_verifications (email, otp, full_name, password, expires_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(email, otp, fullName, password, expiresAt);

      // Send Email
      if (transporter) {
        const info = await transporter.sendMail({
          from: '"ISMS Sentinel" <noreply@isms-sentinel.com>',
          to: email,
          subject: "Welcome to ISMS Sentinel - Verify Your Email",
          text: `Welcome ${fullName}!\n\nThank you for choosing ISMS Sentinel. To complete your registration, please use the following verification code:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe ISMS Sentinel Team`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
              <h2 style="color: #2563eb;">Welcome to ISMS Sentinel!</h2>
              <p>Hi <strong>${fullName}</strong>,</p>
              <p>Thank you for choosing ISMS Sentinel to manage your security compliance. We're excited to have you on board!</p>
              <p>To complete your registration, please use the following verification code:</p>
              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">Best regards,<br />The ISMS Sentinel Team</p>
            </div>
          `,
        });
        console.log("Verification email sent:", nodemailer.getTestMessageUrl(info));
        res.json({ message: "Verification code sent to your email", previewUrl: nodemailer.getTestMessageUrl(info) });
      } else {
        // Fallback if transporter is not ready
        console.log("Email transporter not ready. OTP for", email, "is:", otp);
        res.json({ message: "Verification code generated (check server logs)", otp });
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    try {
      const pending = db.prepare("SELECT * FROM pending_verifications WHERE email = ?").get(email);
      if (!pending) return res.status(400).json({ error: "No pending verification found" });
      
      if (pending.otp !== otp) return res.status(400).json({ error: "Invalid verification code" });
      
      if (new Date(pending.expires_at) < new Date()) {
        return res.status(400).json({ error: "Verification code expired" });
      }

      // Create user
      db.prepare("INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)").run(email, pending.password, pending.full_name);
      
      // Clear pending
      db.prepare("DELETE FROM pending_verifications WHERE email = ?").run(email);

      res.json({ message: "Email verified successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) return res.status(400).json({ error: "This email is not registered with us, kindly signup first." });
      
      if (user.password !== password) return res.status(400).json({ error: "Invalid password. Please try again." });

      res.json({ message: "Login successful", user: { email: user.email, fullName: user.full_name } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Generic CRUD Helper ---
  const setupCRUD = (tableName: string, idField: string = 'id') => {
    app.get(`/api/${tableName}`, (req, res) => {
      try {
        if (!db) return res.status(503).json({ error: "Database not available" });
        const data = db.prepare(`SELECT * FROM ${tableName}`).all();
        res.json(data);
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post(`/api/${tableName}`, (req, res) => {
      try {
        if (!db) return res.status(503).json({ error: "Database not available" });
        const fields = Object.keys(req.body);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(req.body);
        const sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        db.prepare(sql).run(...values);
        res.status(201).json({ message: 'Created successfully' });
      } catch (e: any) {
        res.status(400).json({ error: e.message });
      }
    });

    app.put(`/api/${tableName}/:id`, (req, res) => {
      try {
        if (!db) return res.status(503).json({ error: "Database not available" });
        const fields = Object.keys(req.body);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = [...Object.values(req.body), req.params.id];
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`;
        db.prepare(sql).run(...values);
        res.json({ message: 'Updated successfully' });
      } catch (e: any) {
        res.status(400).json({ error: e.message });
      }
    });

    app.delete(`/api/${tableName}/:id`, (req, res) => {
      try {
        if (!db) return res.status(503).json({ error: "Database not available" });
        db.prepare(`DELETE FROM ${tableName} WHERE ${idField} = ?`).run(req.params.id);
        res.json({ message: 'Deleted successfully' });
      } catch (e: any) {
        res.status(400).json({ error: e.message });
      }
    });
  };

  setupCRUD('assets');
  setupCRUD('risks');
  setupCRUD('controls', 'control_id');
  setupCRUD('policies');
  setupCRUD('incidents');
  setupCRUD('audits');
  setupCRUD('training');

  app.get("/api/activities", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not available" });
      const activities = db.prepare("SELECT * FROM activities ORDER BY id DESC LIMIT 10").all();
      res.json(activities);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not available" });
      const totalControls = db.prepare("SELECT COUNT(*) as count FROM controls").get() as { count: number };
      const implementedControls = db.prepare("SELECT COUNT(*) as count FROM controls WHERE implemented = 'Implemented'").get() as { count: number };
      const openIncidents = db.prepare("SELECT COUNT(*) as count FROM incidents WHERE status = 'Open'").get() as { count: number };
      
      const complianceScore = totalControls.count > 0 ? Math.round((implementedControls.count / totalControls.count) * 100) : 0;

      res.json({
        riskScore: complianceScore,
        openIncidents: openIncidents.count,
        highIncidents: (db.prepare("SELECT COUNT(*) as count FROM incidents WHERE severity = 'High' AND status = 'Open'").get() as { count: number }).count,
        auditFindings: (db.prepare("SELECT COUNT(*) as count FROM audits WHERE status = 'Findings'").get() as { count: number }).count,
        pendingFindings: 0,
        soaProgress: complianceScore,
        soaControls: `${implementedControls.count}/${totalControls.count}`
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/compliance", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not available" });
      const totalControls = db.prepare("SELECT COUNT(*) as count FROM controls").get() as { count: number };
      const implementedControls = db.prepare("SELECT COUNT(*) as count FROM controls WHERE implemented = 'Implemented'").get() as { count: number };
      const totalPolicies = db.prepare("SELECT COUNT(*) as count FROM policies").get() as { count: number };
      const approvedPolicies = db.prepare("SELECT COUNT(*) as count FROM policies WHERE status = 'Approved'").get() as { count: number };
      const totalTraining = db.prepare("SELECT COUNT(*) as count FROM training").get() as { count: number };
      const completedTraining = db.prepare("SELECT COUNT(*) as count FROM training WHERE status = 'Completed'").get() as { count: number };

      res.json([
        { label: 'ISO 27001', value: totalControls.count > 0 ? Math.round((implementedControls.count / totalControls.count) * 100) : 0, color: 'bg-blue-600' },
        { label: 'Policies', value: totalPolicies.count > 0 ? Math.round((approvedPolicies.count / totalPolicies.count) * 100) : 0, color: 'bg-emerald-500' },
        { label: 'Training', value: totalTraining.count > 0 ? Math.round((completedTraining.count / totalTraining.count) * 100) : 0, color: 'bg-purple-500' },
        { label: 'DPDPA 2023', value: 45, color: 'bg-orange-500' },
      ]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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
