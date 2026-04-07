const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all users
router.get("/", (req, res) => {
  db.query("SELECT sap_id, name, email, role FROM users", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// DELETE user
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE sap_id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
});

module.exports = router;