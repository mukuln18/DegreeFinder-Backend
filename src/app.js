const express = require("express");
const cors = require("cors");
const collegeRoutes = require("./routes/college.routes");
const authRoutes = require("./routes/auth.routes");


const app = express();


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/colleges", collegeRoutes);
app.use("/api/auth", authRoutes);


module.exports = app;
