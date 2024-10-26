const express = require("express");
const { Client } = require("pg");
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


// Define a route to check the connection
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
