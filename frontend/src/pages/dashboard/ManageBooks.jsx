import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import bookService from "../../services/bookService";
import "./manageBooks.css";

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    available_quantity: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchBooks = async () => {
    const data = await bookService.getBooks();
    setBooks(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await bookService.updateBook(editingId, form);
    } else {
      await bookService.addBook(form);
    }

    setForm({ title: "", author: "", category: "", available_quantity: "" });
    setEditingId(null);
    fetchBooks();
  };

  const handleEdit = (book) => {
    setForm(book);
    setEditingId(book.book_id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    await bookService.deleteBook(id);
    fetchBooks();
  };

  return (
    <>
      <Navbar />

      <div className="books-container">
        <h2>Manage Books</h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="book-form">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={form.available_quantity}
            onChange={(e) =>
              setForm({ ...form, available_quantity: e.target.value })
            }
            required
          />

          <button type="submit">
            {editingId ? "Update Book" : "Add Book"}
          </button>
        </form>

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.map((b) => (
              <tr key={b.book_id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.category}</td>
                <td>{b.available_quantity}</td>
                <td>
                  <button onClick={() => handleEdit(b)}>Edit</button>
                  <button onClick={() => handleDelete(b.book_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ManageBooks;