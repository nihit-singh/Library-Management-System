import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./dashboard.css";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>

        <div className="dashboard-grid">
          <Link to="/dashboard/users" className="card">
            Manage Users
          </Link>

          <Link to="/dashboard/books" className="card">
            Manage Books
          </Link>

          <Link to="/dashboard/transactions" className="card">
            Transactions
          </Link>

          <Link to="/dashboard/requests" className="card">
            Requests
          </Link>
        </div>
      </div>
    </>
  );
}

export default Dashboard;