const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Function to create the database if it doesn't exist
async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Karthikyokesh@1",
    });

    await connection.query("CREATE DATABASE IF NOT EXISTS visitor_db");
    console.log("Database 'visitor_db' ensured.");
    await connection.end();
  } catch (error) {
    console.error("Error creating database:", error);
    process.exit(1);
  }
}

// Create database connection pool (after DB is ensured)
let pool;
async function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Karthikyokesh@1",
    database: process.env.DB_NAME || "visitor_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Middleware to check DB connection
app.use(async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Database connection error" });
  }
});

// Create the visitors table if it doesn't exist
async function initializeDB() {
  try {
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id VARCHAR(36) PRIMARY KEY,
        visitorName VARCHAR(100) NOT NULL,
        mobileNumber VARCHAR(15) NOT NULL,
        apartmentNumber VARCHAR(50) NOT NULL,
        vehicleType VARCHAR(50) DEFAULT 'None',
        vehicleNumber VARCHAR(50),
        purpose VARCHAR(200) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        timeOfVisit DATETIME NOT NULL,
        entryCode VARCHAR(20) NOT NULL,
        exitTime DATETIME NULL,
        status ENUM('active', 'exited') DEFAULT 'active'
      )
    `);

    // Add indexes only if they don't already exist
    const [indexes] = await connection.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME || "visitor_db", "visitors"]
    );

    const indexNames = indexes.map(index => index.INDEX_NAME);

    if (!indexNames.includes("idx_mobile_entry")) {
      await connection.query(`
        CREATE INDEX idx_mobile_entry ON visitors (mobileNumber, entryCode)
      `);
    }

    if (!indexNames.includes("idx_status")) {
      await connection.query(`
        CREATE INDEX idx_status ON visitors (status)
      `);
    }

    console.log("Database tables initialized");
    connection.release();
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// API: Register a new visitor
app.post("/api/visitors", async (req, res) => {
  try {
    const {
      visitorName,
      mobileNumber,
      apartmentNumber,
      vehicleType,
      vehicleNumber,
      purpose,
      duration,
      timeOfVisit,
    } = req.body;

    if (!visitorName || !mobileNumber || !apartmentNumber || !purpose) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const formattedTime = moment(timeOfVisit).format("YYYY-MM-DD HH:mm:ss");
    const visitorId = uuidv4();
    const entryCode = `VC${Math.floor(100000 + Math.random() * 900000)}`;

    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO visitors 
      (id, visitorName, mobileNumber, apartmentNumber, vehicleType, vehicleNumber, purpose, duration, timeOfVisit, entryCode) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitorId,
        visitorName,
        mobileNumber,
        apartmentNumber,
        vehicleType || "None",
        vehicleNumber || "",
        purpose,
        duration,
        formattedTime,
        entryCode,
      ]
    );
    connection.release();

    res.status(201).json({ entryCode, visitorId });
  } catch (error) {
    console.error("Error creating visitor:", error);
    res.status(500).json({ message: "Failed to register visitor" });
  }
});

// API: Get all active visitors
app.get("/api/visitors", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM visitors WHERE status = 'active' ORDER BY timeOfVisit DESC"
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(" Error fetching visitors:", error);
    res.status(500).json({ message: "Failed to fetch visitors" });
  }
});

// API: Admin marks visitor as exited by ID
app.put("/api/visitors/:id/exit", async (req, res) => {
  try {
    const { id } = req.params;
    const exitTime = moment().format("YYYY-MM-DD HH:mm:ss");

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE visitors SET status = 'exited', exitTime = ? WHERE id = ?",
      [exitTime, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor exited successfully" });
  } catch (error) {
    console.error(" Error marking exit:", error);
    res.status(500).json({ message: "Failed to mark visitor exit" });
  }
});

// API: Self-checkout by mobile number and entry code
app.post("/api/visitors/exit", async (req, res) => {
  try {
    const { mobileNumber, entryCode } = req.body;

    if (!mobileNumber || !entryCode) {
      return res
        .status(400)
        .json({ message: "Mobile number and entry code required" });
    }

    const exitTime = moment().format("YYYY-MM-DD HH:mm:ss");

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "UPDATE visitors SET status = 'exited', exitTime = ? WHERE mobileNumber = ? AND entryCode = ? AND status = 'active'",
      [exitTime, mobileNumber, entryCode]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No active visitor found with provided details" });
    }

    res.json({ message: "Visitor exited successfully" });
  } catch (error) {
    console.error(" Error marking visitor exit:", error);
    res.status(500).json({ message: "Failed to mark visitor exit" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await createDatabaseIfNotExists(); // ensure DB exists
  await createPool(); // create pool using DB
  await initializeDB(); // ensure table exists
  console.log(`Server running on port ${PORT}`);
});
