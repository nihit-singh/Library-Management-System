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
    INSERT INTO records (user_id, book_id, borrow_date, due_date, status)
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
    UPDATE records 
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
//     SELECT * FROM records
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
      t.record_id,
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

    FROM records t
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

  // 🔥 CHECK EXISTING ACTIVE RECORD
  const checkSql = `
    SELECT * FROM records
    WHERE user_id = ? 
    AND book_id = ?
    AND status IN ('pending_borrow', 'borrowed', 'pending_return')
  `;

  db.query(checkSql, [user_id, book_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.json({
        message: "You already have an active request or borrowed this book",
      });
    }

    // ✅ INSERT ONLY IF SAFE
    const insertSql = `
      INSERT INTO records (user_id, book_id, status)
      VALUES (?, ?, 'pending_borrow')
    `;

    db.query(insertSql, [user_id, book_id], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({ message: "Borrow request sent" });
    });
  });
});

// ================= REQUEST RETURN =================
router.post("/request-return", (req, res) => {
  const { user_id, book_id } = req.body;

  const checkSql = `
    SELECT * FROM records
    WHERE user_id = ? 
    AND book_id = ?
    AND status = 'pending_return'
  `;

  db.query(checkSql, [user_id, book_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.json({ message: "Return already requested" });
    }

    const sql = `
      UPDATE records
      SET status = 'pending_return'
      WHERE user_id = ? AND book_id = ? AND status = 'borrowed'
    `;

    db.query(sql, [user_id, book_id], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({ message: "Return request sent" });
    });
  });
});


// ================= APPROVE / REJECT =================

router.post("/approve", (req, res) => {
  const { id, type, book_id } = req.body;

  console.log("APPROVE HIT:", req.body); // debug

  if (type === "pending_borrow") {

    db.query(
      "SELECT user_id FROM records WHERE record_id = ?",
      [id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        // 🔥 FIX: check if record exists
        if (!result || result.length === 0) {
          return res.status(404).json({ message: "Record not found" });
        }

        const user_id = result[0].user_id;

        // 🔥 delete only if exists (safe)
        db.query(
          "DELETE FROM records WHERE user_id = ? AND book_id = ? AND status = 'borrowed'",
          [user_id, book_id],
          (err2) => {
            if (err2) return res.status(500).json(err2);

            // 🔥 update main record
            db.query(
              `UPDATE records
               SET status='borrowed',
                   borrow_date=NOW(),
                   due_date=DATE_ADD(NOW(), INTERVAL 7 DAY)
               WHERE record_id=?`,
              [id],
              (err3, result3) => {
                if (err3) return res.status(500).json(err3);

                // 🔥 IMPORTANT: check affected rows
                if (result3.affectedRows === 0) {
                  return res.json({ message: "Already processed" });
                }

                // 🔥 update book quantity
                db.query(
                  "UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id=?",
                  [book_id],
                  (err4) => {
                    if (err4) return res.status(500).json(err4);

                    res.json({ message: "Borrow Approved" });
                  }
                );
              }
            );
          }
        );
      }
    );

  } else if (type === "pending_return") {

    db.query(
      `UPDATE records
       SET status='returned', return_date=NOW()
       WHERE record_id=?`,
      [id],
      (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
          return res.json({ message: "Already processed" });
        }

        db.query(
          "UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id=?",
          [book_id],
          (err2) => {
            if (err2) return res.status(500).json(err2);

            res.json({ message: "Return Approved" });
          }
        );
      }
    );
  }
});


router.post("/reject", (req, res) => {
  const { id } = req.body;

  db.query(
    "UPDATE records SET status = 'rejected' WHERE record_id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Rejected" });
    }
  );
});

// ================= GET ALL REQUESTS =================
router.get("/requests", (req, res) => {
  const sql = `
    SELECT 
      t.*, 
      u.name AS user_name, 
      b.title AS book_title
    FROM records t
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
    SELECT * FROM records
    WHERE user_id = ?
    AND status IN ('borrowed', 'pending_borrow', 'pending_return')
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;