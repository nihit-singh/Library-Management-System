import axios from "axios";

const API = "http://localhost:5000/api/books";

const getBooks = async () => (await axios.get(API)).data;
const addBook = async (data) => (await axios.post(`${API}/add`, data)).data;
const updateBook = async (id, data) =>
  (await axios.put(`${API}/${id}`, data)).data;
const deleteBook = async (id) =>
  (await axios.delete(`${API}/${id}`)).data;

export default { getBooks, addBook, updateBook, deleteBook };