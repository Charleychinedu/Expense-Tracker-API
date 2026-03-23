// Required modules and configuration    
const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("../routes/v1/userRoutes")
const categoryRoutes = require("../routes/v1/categoryRoutes")
const expenseRoutes = require("../routes/v1/expenseRoutes")
const notificationRoutes = require("../routes/v1/notificationRoutes")
const cors = require("cors")
const app = express();

// load environment variables from .env file
dotenv.config();

// Middleware configuration
const corsOptions = {
  origin: 'https://greenmark.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
} // CORS options to allow requests from a specific origin and methods

app.use(express.json());
app.use(cors(corsOptions));

// Routes handlers: Just like we have a users router for version 1, we can create another router for version 2 and mount it on a different path. This allows us to maintain multiple versions of our API simultaneously, which is useful for backward compatibility and gradual feature rollouts.
app.use("/v1/users", userRoutes)
app.use("/v1/categories", categoryRoutes)
app.use("/v1/expense", expenseRoutes)
app.use("/v1/notifications", notificationRoutes)

module.exports = app;


