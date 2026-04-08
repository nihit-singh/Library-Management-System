import axios from "axios";

const API = "http://localhost:5000/api/transactions";

// ================= REQUESTS =================
const getRequests = async () => {
  const res = await axios.get(`${API}/requests`);
  return res.data;
};

// ================= REQUEST BORROW =================
const requestBorrow = async (data) => {
  const res = await axios.post(`${API}/request-borrow`, data);
  return res.data;
};

// ================= REQUEST RETURN =================
const requestReturn = async (data) => {
  const res = await axios.post(`${API}/request-return`, data);
  return res.data;
};

const getAllTransactions = async () => {
  const res = await axios.get(API);
  return res.data;
};

const getUserTransactions = (userId) =>
  axios.get(`${API}/${userId}`).then(res => res.data);

// 🔹 ADMIN

const approveRequest = async (data) => {
  const res = await axios.post(`${API}/approve`, data);
  return res.data;
};

const rejectRequest = async (id) => {
  const res = await axios.post(`${API}/reject`, { id });
  return res.data;
};


export default {
  requestBorrow,
  requestReturn,
  getUserTransactions,
  getAllTransactions,
  getRequests,
  approveRequest,
  rejectRequest
};