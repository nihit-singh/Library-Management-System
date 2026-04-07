import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import "./auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      user.role === "admin"
        ? navigate("/dashboard")
        : navigate("/books");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await authService.login({ email, password });

    if (res.message) {
      alert(res.message);
      return;
    }

    localStorage.setItem("user", JSON.stringify(res));

    res.role === "admin"
      ? navigate("/dashboard")
      : navigate("/books");
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>LMS</h2>
        <p className="subtitle">Login to continue</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p className="link">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;