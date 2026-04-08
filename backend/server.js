const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ IMPORT ROUTES
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const recordRoutes = require("./routes/records");

// ✅ USE ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/records", recordRoutes);

// ✅ START SERVER (ALWAYS LAST)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);