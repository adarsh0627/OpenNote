const express = require("express");
require("dotenv").config();
require('dotenv').config();
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();
connectDB();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
