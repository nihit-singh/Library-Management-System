/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import userService from "../../services/userService";
import "./manageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const data = await userService.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await userService.deleteUser(id);
    fetchUsers();
  };

  return (
    <>
      <Navbar />

      <div className="users-container">
        <h2>Manage Users</h2>

        <table>
          <thead>
            <tr>
              <th>SAP ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.sap_id}>
                <td>{u.sap_id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                {u.role === "student" && (
                  <td>
                    <button onClick={() => handleDelete(u.sap_id)}>
                      Delete
                    </button>
                  </td>
                )}
                {u.role !== "student" && <td></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ManageUsers;