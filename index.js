require('dotenv').config()
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 5000;

// CORS configuration
const corsOptions = {
  origin: "https://new-front-up.vercel.app", // Remove the trailing slash
  methods: ["POST", "GET"],
  credentials: true,
  optionsSuccessStatus: 204 // No Content
};

// Use CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());

// Connect to MongoDB
connectToMongo();

// Define a route handler for the root path
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Use the auth routes
app.use("/api/auth", require("./routes/auth"));

// Other routes can be added similarly
// app.use("/api/notes", require("./routes/notes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
