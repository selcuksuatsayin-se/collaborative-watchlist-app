const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB (movieDB)!"))
    .catch((e) => console.error("MongoDB error: " + e.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));