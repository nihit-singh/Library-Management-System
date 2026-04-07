import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <h3>LMS</h3>

      <div>
        <span style={{ marginRight: "10px" }}>{user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#4facfe",
    color: "white",
  },
};

export default Navbar;