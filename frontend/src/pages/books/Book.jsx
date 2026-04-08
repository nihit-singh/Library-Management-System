import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import bookService from "../../services/bookService";
import transactionService from "../../services/transactionService";
import "./book.css";

function Book() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  const fetchData = async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      const booksData = await bookService.getBooks();

      let transactionData = [];

      if (user && user.user_id) {
        try {
          transactionData =
            await transactionService.getUserTransactions(user.user_id);
        } catch (err) {
          console.error("Transaction API error:", err);
          transactionData = [];
        }
      }

      // 🔥 HANDLE ALL STATES
      const borrowedIds = [];
      const pendingBorrowIds = [];
      const pendingReturnIds = [];

      if (Array.isArray(transactionData)) {
        transactionData.forEach((t) => {
          if (t.status === "borrowed") borrowedIds.push(t.book_id);
          if (t.status === "pending_borrow")
            pendingBorrowIds.push(t.book_id);
          if (t.status === "pending_return")
            pendingReturnIds.push(t.book_id);
        });
      }

      const formatted = booksData.map((b) => ({
        id: b.book_id,
        title: b.title,
        author: b.author,
        category: b.category,
        available: b.available_quantity,

        borrowed: borrowedIds.includes(b.book_id),
        pendingBorrow: pendingBorrowIds.includes(b.book_id),
        pendingReturn: pendingReturnIds.includes(b.book_id),
      }));

      setBooks(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Error loading books:", err);
      setLoading(false);
    }
  };

  // ================= LOAD =================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // ================= FILTER =================
  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "All" || book.category === category;

    return matchSearch && matchCategory;
  });

  // ================= REQUEST BORROW =================
  const requestBorrow = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await transactionService.requestBorrow({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);
    await fetchData();
  };

  // ================= REQUEST RETURN =================
  const requestReturn = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await transactionService.requestReturn({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);
    await fetchData();
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: "20px" }}>Loading books...</p>
      </>
    );
  }

  // ================= UI =================
  return (
    <>
      <Navbar />

      <div className="book-container">
        <h2>Books</h2>

        {/* Controls */}
        <div className="controls">
          <input
            type="text"
            placeholder="Search by title or author"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Education">Education</option>
            <option value="Programming">Programming</option>
          </select>
        </div>

        {/* Book List */}
        <div className="book-list">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <span className="category">{book.category}</span>
              <p>Available: {book.available}</p>

              {/* 🔥 BUTTON LOGIC */}
              {book.pendingBorrow ? (
                <button disabled>Request Sent</button>
              ) : book.pendingReturn ? (
                <button disabled>Return Pending</button>
              ) : book.borrowed ? (
                <button onClick={() => requestReturn(book.id)}>
                  Request Return
                </button>
              ) : (
                <button
                  disabled={book.available === 0}
                  onClick={() => requestBorrow(book.id)}
                >
                  {book.available > 0
                    ? "Request Borrow"
                    : "Unavailable"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Book;