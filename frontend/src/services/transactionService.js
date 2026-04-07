import axios from "axios";

const API = "http://localhost:5000/api/transactions";

const borrowBook = async (data) => {
  const res = await axios.post(`${API}/borrow`, data);
  return res.data;
};

const returnBook = async (data) => {
  const res = await axios.post(`${API}/return`, data);
  return res.data;
};

const getUserTransactions = async (userId) => {
  const res = await axios.get(`${API}/${userId}`);
  return res.data;
};

const getAllTransactions = async () => {
  const res = await axios.get(API);
  return res.data;
};

export default {
  borrowBook,
  returnBook,
  getUserTransactions,
  getAllTransactions,
};