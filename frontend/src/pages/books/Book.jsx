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

    // 🔥 FIX: handle missing user
    if (!user || !user.user_id) {
      console.error("User not found in localStorage");
      
      const booksData = await bookService.getBooks();

      const formatted = booksData.map((b) => ({
        id: b.book_id,
        title: b.title,
        author: b.author,
        category: b.category,
        available: b.available_quantity,
        borrowed: false,
      }));

      setBooks(formatted);
      setLoading(false);
      return;
    }

    const booksData = await bookService.getBooks();

    let transactionData = [];
    try {
  transactionData = await transactionService.getUserTransactions(user.user_id);
} catch (err) {
  console.error("Transaction API error:", err); // 👈 ADD THIS
  transactionData = [];
}

    const borrowedIds = Array.isArray(transactionData)
  ? transactionData.map(t => t.book_id)
  : [];

    const formatted = booksData.map((b) => ({
      id: b.book_id,
      title: b.title,
      author: b.author,
      category: b.category,
      available: b.available_quantity,
      borrowed: borrowedIds.includes(b.book_id),
    }));

    setBooks(formatted);
    setLoading(false);

  } catch (err) {
    console.error("Error loading books:", err);
    setLoading(false);
  }
};

  // ================= LOAD ON START =================
  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchData();
}, []);
console.log("Books state:", books);

  // ================= FILTER =================
  const filteredBooks = books.filter((book) => {
    const matchSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "All" || book.category === category;

    return matchSearch && matchCategory;
  });

  // ================= BORROW =================
  const handleBorrow = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await transactionService.borrowBook({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);

    await fetchData(); // refresh without reload
  };

  // ================= RETURN =================
  const handleReturn = async (bookId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await transactionService.returnBook({
      user_id: user.user_id,
      book_id: bookId,
    });

    alert(res.message);

    await fetchData(); // refresh without reload
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

              {book.borrowed ? (
                <button onClick={() => handleReturn(book.id)}>
                  Return
                </button>
              ) : (
                <button
                  disabled={book.available === 0}
                  onClick={() => handleBorrow(book.id)}
                >
                  {book.available > 0 ? "Borrow" : "Unavailable"}
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