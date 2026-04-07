const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= REGISTER (STUDENT ONLY) =================
router.post("/register", (req, res) => {
  const { sap_id, name, email, password } = req.body;

  const sql = `
    INSERT INTO users (sap_id, name, email, password, role)
    VALUES (?, ?, ?, ?, 'student')
  `;

  db.query(sql, [sap_id, name, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "User already exists" });
    }
    res.json({ message: "Student registered successfully" });
  });
});


// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT * FROM users 
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(result[0]); // includes role
  });
});

module.exports = router;