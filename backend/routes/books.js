const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all books
router.get("/", (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ADD book
router.post("/add", (req, res) => {
  const { title, author, category, available_quantity } = req.body;

  const sql = `
    INSERT INTO books (title, author, category, available_quantity)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, author, category, available_quantity], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book added" });
  });
});

// UPDATE book
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, category, available_quantity } = req.body;

  const sql = `
    UPDATE books 
    SET title=?, author=?, category=?, available_quantity=?
    WHERE book_id=?
  `;

  db.query(sql, [title, author, category, available_quantity, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book updated" });
  });
});

// DELETE book
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM books WHERE book_id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Book deleted" });
  });
});

module.exports = router;