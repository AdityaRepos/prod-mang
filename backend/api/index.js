const express = require("express");
const { Client } = require("pg");
const bcrypt = require("bcrypt"); // Import bcrypt here
require("dotenv").config(); // Use dotenv for environment variables

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse JSON
app.use(express.json());

// Set up database client
const client = new Client({
  user: process.env.DB_USER || "products_simpletell",
  host: process.env.DB_HOST || "84zem.h.filess.io",
  database: process.env.DB_NAME || "products_simpletell",
  password: process.env.DB_PASSWORD || "5500635389c1a5d6b4eb12b549e5dbae0785f418",
  port: process.env.DB_PORT || "5433",
});

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error("Database connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

const cors = require("cors");

// Use CORS middleware
app.use(cors());

// Basic Authentication Middleware
const basicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).set("WWW-Authenticate", 'Basic realm="User Visible Realm"').send("Authorization required.");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");

  // Validate credentials against the database
  try {
    const result = await client.query(
      "SELECT * FROM my_schema.users WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(401).set("WWW-Authenticate", 'Basic realm="User Visible Realm"').send("Incorrect Credentials");
    }

    const user = result.rows[0];

    // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).set("WWW-Authenticate", 'Basic realm="User Visible Realm"').send("Incorrect Credentials");
    }

    req.user = user; // Attach user info to the request object
    next(); // Proceed to the next middleware/route handler if authentication is successful
  } catch (error) {
    console.error("Error validating credentials", error.stack);
    res.status(500).send("Internal Server Error");
  }
};

// Route for logging in (requires authentication)
app.get("/login", basicAuth, (req, res) => {
  res.send(`Hello ${req.user.username}, you have successfully logged in!`);
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

// Example route with basic authentication
app.get("/hello", async (req, res) => {
  try {
    const result = await client.query("SELECT $1::text as message", ["Hello world!"]);
    res.send(result.rows[0].message); // Responds with "Hello world!"
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Example route to fetch all products
app.get("/products", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM my_schema.products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

// Example route to add a product
app.post("/products", async (req, res) => {
    console.log("Received data:", req.body); // Log the request body
    const { name, description, price, quantity } = req.body;

    // Validate that required fields are provided
    

    try {
        const result = await client.query(
            "INSERT INTO my_schema.products (name, description, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, description, price, quantity]
        );
        res.status(201).json(result.rows[0]); // Returns the newly added product
    } catch (error) {
        console.error("Error adding product", error.stack);
        res.status(500).send("Internal Server Error");
    }
});


// Example route to delete a product
  app.delete("/products/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await client.query("DELETE FROM my_schema.products WHERE id = $1 RETURNING *", [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).send("Product not found");
      }
  
      res.status(200).json(result.rows[0]); // Returns the deleted product details
    } catch (error) {
      console.error("Error deleting product", error.stack);
      res.status(500).send("Internal Server Error");
    }
  });
  
    // Example route to update a product
    app.put("/products/:id", async (req, res) => {
        const { id } = req.params;
        const { name, description, price, quantity } = req.body;
      
        try {
          const result = await client.query(
            "UPDATE my_schema.products SET name = $1, description = $2, price = $3, quantity = $4 WHERE id = $5 RETURNING *",
            [name, description, price, quantity, id]
          );
      
          if (result.rowCount === 0) {
            return res.status(404).send("Product not found");
          }
      
          res.status(200).json(result.rows[0]); // Returns the updated product
        } catch (error) {
          console.error("Error updating product", error.stack);
          res.status(500).send("Internal Server Error");
        }
      });
      

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;