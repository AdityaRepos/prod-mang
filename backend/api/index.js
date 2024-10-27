const express = require("express");
const { Client } = require("pg");
const bcrypt = require("bcrypt"); // Import bcrypt here
require("dotenv").config(); // Use dotenv for environment variables
const cors = require("cors"); // Import CORS middleware

const app = express();
const port = process.env.PORT || 4000;
const jwt = require("jsonwebtoken");

// Middleware to parse JSON
app.use(express.json());

// Set up database client
const client = new Client({
  user: process.env.DB_USER || "products_simpletell",
  host: process.env.DB_HOST || "84zem.h.filess.io",
  database: process.env.DB_NAME || "products_simpletell",
  password: process.env.DB_PASSWORD || "5500635389c1a5d6b4eb12b549e5dbae0785f418",
  port: process.env.DB_PORT || 5433,
});

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error("Database connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

// Use CORS middleware
app.use(cors({
  origin: 'https://prod-mang.vercel.app', // Allow your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true, // Allow credentials if needed
}));

// Basic token verify
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Authorization required.");
  }

  jwt.verify(token, process.env.JWT_SECRET || "dwA06lc2KN", (err, decoded) => {
    if (err) {
      return res.status(403).send("Invalid or expired token.");
    }

    req.user = decoded;  // Attach decoded data to the request
    next();
  });
};

// Login route to authenticate and return a JWT token
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    const result = await client.query(
      "SELECT * FROM my_schema.users WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).send("Incorrect Credentials");
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Incorrect Credentials");
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "dwA06lc2KN",
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    res.json({ token });  // Send token to the client
  } catch (error) {
    console.error("Error validating credentials", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Signup route to create new credentials
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  try {
    // Check if the user already exists
    const existingUser = await client.query(
      "SELECT * FROM my_schema.users WHERE username = $1",
      [username]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).send("Username already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await client.query(
      "INSERT INTO my_schema.users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    // Automatically log in the user by sending a success response
    res.status(201).send(`User ${username} created successfully!`);
  } catch (error) {
    console.error("Error details:", error);

    console.error("Error signing up", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Logout route to clear cached credentials
app.get("/logout", (req, res) => {
  // Redirect to a protected route with invalid credentials
  res.set("WWW-Authenticate", 'Basic realm="User Visible Realm"'); // Force a re-prompt for credentials
  res.status(401).send("You have been logged out. Please log in again."); // Optionally, inform the user
});

// Example route with JWT authentication
app.get("/hello", verifyToken, async (req, res) => {
  try {
    const result = await client.query("SELECT $1::text as message", ["Hello world!"]);
    res.send(result.rows[0].message); // Responds with "Hello world!"
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Example route to fetch all products (no auth required)
app.get("/products", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM my_schema.products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Protected routes for adding, updating, and deleting products
app.post("/products", verifyToken, async (req, res) => {
  const { name, description, price, quantity } = req.body;

  try {
    const result = await client.query(
      "INSERT INTO my_schema.products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, price, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding product", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/products/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;

  try {
    const result = await client.query(
      "UPDATE my_schema.products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *",
      [name, description, price, quantity, id]
    );
    if (result.rowCount === 0) return res.status(404).send("Product not found");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/products/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query("DELETE FROM my_schema.products WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) return res.status(404).send("Product not found");
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting product", error.stack);
    res.status(500).send("Internal Server Error");
  }
});      

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;