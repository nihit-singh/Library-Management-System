import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import bookService from "../../services/bookService";
import recordService from "../../services/recordService";
import "./book.css";

function Book() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(
  localStorage.getItem("search") || ""
);
const [category, setCategory] = useState(
  localStorage.getItem("category") || "All"
);
const [statusFilter, setStatusFilter] = useState(
  localStorage.getItem("statusFilter") || "All"
);
  // ================= FETCH DATA =================
  const fetchData = async (initial = false) => {
  try {
    if (initial) setLoading(true); // only first time

    const user = JSON.parse(localStorage.getItem("user"));
    const booksData = await bookService.getBooks();

    let recordData = [];

    if (user && user.user_id) {
      try {
        recordData = await recordService.getUserRecords(user.user_id);
      } catch (err) {
        console.error("Record API error:", err);
      }
    }

    // 🔥 STATE LOGIC
    const borrowedIds = [];
    const pendingBorrowIds = [];
    const pendingReturnIds = [];
    const activeBookIds = [];

    recordData.forEach((r) => {
      if (r.status === "borrowed") {
        borrowedIds.push(r.book_id);
        activeBookIds.push(r.book_id);
      }

      if (r.status === "pending_borrow") {
        pendingBorrowIds.push(r.book_id);
        activeBookIds.push(r.book_id);
      }

      if (r.status === "pending_return") {
        pendingReturnIds.push(r.book_id);
        activeBookIds.push(r.book_id);
      }
    });

    const formatted = booksData.map((b) => ({
      id: b.book_id,
      title: b.title,
      author: b.author,
      category: b.category,
      available: b.available_quantity,

      borrowed: borrowedIds.includes(b.book_id),
      pendingBorrow: pendingBorrowIds.includes(b.book_id),
      pendingReturn: pendingReturnIds.includes(b.book_id),
      active: activeBookIds.includes(b.book_id),
    }));

    setBooks(formatted);

    if (initial) setLoading(false);

  } catch (err) {
    console.error("Error loading books:", err);
    if (initial) setLoading(false);
  }
};

  // ================= LOAD =================
    // localStorage.setItem("search", search);
    // localStorage.setItem("category", category);
    // localStorage.setItem("statusFilter", statusFilter);
  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchData(true); // initial load with loader

  const interval = setInterval(() => {
    fetchData(false); // silent update
  }, 7000);

  return () => clearInterval(interval);
}, []);

  // ================= FILTER =================
  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "All" || book.category === category;

    let matchStatus = true;

    if (statusFilter === "Active") {
      matchStatus = book.active;
    }

    if (statusFilter === "Borrowed") {
      matchStatus = book.borrowed;
    }

    if (statusFilter === "Pending") {
      matchStatus =
        book.pendingBorrow || book.pendingReturn;
    }

    return matchSearch && matchCategory && matchStatus;
  });

  // ================= REQUEST BORROW =================
  const requestBorrow = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await recordService.requestBorrow({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);
    fetchData();
  };

  // ================= REQUEST RETURN =================
  const requestReturn = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await recordService.requestReturn({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);
    fetchData();
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
            value={search}
            placeholder="Search by title or author"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Education">Education</option>
            <option value="Programming">Programming</option>
          </select>

          {/* 🔥 STATUS FILTER */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Books</option>
            <option value="Active">Active</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Pending">Pending</option>
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

              {/* 🔥 STATUS TAGS */}
              {book.pendingBorrow ? (
                <span className="tag">Pending Borrow</span>
              ) : book.pendingReturn ? (
                <span className="tag">Pending Return</span>
              ) : book.borrowed ? (
                <span className="tag">Borrowed</span>
              ) : null}

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