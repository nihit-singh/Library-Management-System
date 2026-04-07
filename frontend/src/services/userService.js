import axios from "axios";
const API = "http://localhost:5000/api/users";

const getUsers = async () => {
  const res = await axios.get(API);
  return res.data;
};

const deleteUser = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};

export default { getUsers, deleteUser };