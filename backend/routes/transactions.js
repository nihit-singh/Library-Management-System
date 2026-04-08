const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= BORROW =================
router.post("/borrow", (req, res) => {
  const { user_id, book_id } = req.body;

  const borrowDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(borrowDate.getDate() + 7);

  const sql = `
    INSERT INTO transactions (user_id, book_id, borrow_date, due_date, status)
    VALUES (?, ?, ?, ?, 'borrowed')
  `;

  db.query(sql, [user_id, book_id, borrowDate, dueDate], (err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?",
      [book_id]
    );

    res.json({ message: "Book borrowed successfully" });
  });
});

// ================= RETURN =================
router.post("/return", (req, res) => {
  const { user_id, book_id } = req.body;

  const returnDate = new Date();

  const sql = `
    UPDATE transactions 
    SET return_date = ?, status = 'returned'
    WHERE user_id = ? AND book_id = ? AND status = 'borrowed'
  `;

  db.query(sql, [returnDate, user_id, book_id], (err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = ?",
      [book_id]
    );

    res.json({ message: "Book returned successfully" });
  });
});

// // ================= USER TRANSACTIONS =================
// router.get("/:user_id", (req, res) => {
//   const { user_id } = req.params;

//   const sql = `
//     SELECT * FROM transactions
//     WHERE user_id = ? AND status = 'borrowed'
//   `;

//   db.query(sql, [user_id], (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// });

// ================= ADMIN VIEW =================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      t.transaction_id,
      u.name AS user_name,
      b.title AS book_title,
      t.borrow_date,
      t.due_date,
      t.return_date,
      t.status,

      CASE
        WHEN t.return_date IS NULL AND CURDATE() > t.due_date
          THEN DATEDIFF(CURDATE(), t.due_date) * 10
        WHEN t.return_date > t.due_date
          THEN DATEDIFF(t.return_date, t.due_date) * 10
        ELSE 0
      END AS fine

    FROM transactions t
    JOIN users u ON t.user_id = u.user_id
    JOIN books b ON t.book_id = b.book_id

    ORDER BY t.borrow_date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("SQL ERROR:", err);
      return res.status(500).json(err);
    }

    console.log("TRANSACTIONS:", result); // 👈 DEBUG
    res.json(result);
  });
});



// ================= REQUEST BORROW =================
router.post("/request-borrow", (req, res) => {
  const { user_id, book_id } = req.body;

  const sql = `
    INSERT INTO transactions (user_id, book_id, status)
    VALUES (?, ?, 'pending_borrow')
  `;

  db.query(sql, [user_id, book_id], (err) => {
    if (err) {
      console.log("INSERT ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Borrow request sent" });
  });
});
// ================= REQUEST RETURN =================
router.post("/request-return", (req, res) => {
  const { user_id, book_id } = req.body;

  const sql = `
    UPDATE transactions
    SET status = 'pending_return'
    WHERE user_id = ? AND book_id = ? AND status = 'borrowed'
  `;

  db.query(sql, [user_id, book_id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Return request sent" });
  });
});

// ================= APPROVE / REJECT =================

router.post("/approve", (req, res) => {
  const { id, type, book_id } = req.body;

  if (type === "pending_borrow") {
    const sql = `
      UPDATE transactions
      SET status = 'borrowed',
          borrow_date = NOW(),
          due_date = DATE_ADD(NOW(), INTERVAL 7 DAY)
      WHERE transaction_id = ?
    `;

    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json(err);

      // 🔥 DECREASE BOOK COUNT
      db.query(
        "UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?",
        [book_id]
      );

      res.json({ message: "Borrow Approved" });
    });

  } else if (type === "pending_return") {
    const sql = `
      UPDATE transactions
      SET status = 'returned',
          return_date = NOW()
      WHERE transaction_id = ?
    `;

    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json(err);

      // 🔥 INCREASE BOOK COUNT
      db.query(
        "UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = ?",
        [book_id]
      );

      res.json({ message: "Return Approved" });
    });
  }
});

  router.post("/reject", (req, res) => {
  const { id } = req.body;

  const sql = `
    UPDATE transactions
    SET status = 'rejected'
    WHERE transaction_id = ?
  `;

  db.query(sql, [id]);

  res.json({ message: "Rejected" });
});

// ================= GET ALL REQUESTS =================
router.get("/requests", (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      u.name AS user_name, 
      b.title AS book_title
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.user_id
    LEFT JOIN books b ON t.book_id = b.book_id
    WHERE t.status IN ('pending_borrow', 'pending_return')
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("SQL ERROR:", err);
      return res.status(500).json(err);
    }

    console.log("REQUESTS DATA:", result); // 🔥 DEBUG
    res.json(result);
  });
});

// ================= USER TRANSACTIONS =================
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT * FROM transactions
    WHERE user_id = ? AND status = 'borrowed'
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;