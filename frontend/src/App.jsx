import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Book from "./pages/books/Book";
import ProtectedRoute from "./components/ProtectedRoute";
import ManageUsers from "./pages/dashboard/ManageUsers";
import ManageBooks from "./pages/dashboard/ManageBooks";
import Transactions from "./pages/dashboard/Transactions";



function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard/users" element={<ManageUsers />} />
<Route path="/dashboard/books" element={<ManageBooks />} />
<Route path="/dashboard/transactions" element={<Transactions />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Student */}
      <Route
        path="/books"
        element={
          <ProtectedRoute role="student">
            <Book />
          </ProtectedRoute>
        }
      />
      
    </Routes>
  );
}

export default App;