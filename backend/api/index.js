const express = require("express");
const { Client } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect((err) => {
  if (err) {
    console.error("Database connection error", err.stack);
  } else {
    console.log("Connected to the database");
  }
});

app.get("/hello", async (req, res) => {
  try {
    const result = await client.query("SELECT $1::text as message", ["Hello world!"]);
    res.send(result.rows[0].message);
  } catch (error) {
    console.error("Error executing query", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM my_schema.products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products", error.stack);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/products", async (req, res) => {
  console.log("Received data:", req.body);
  const { name, description, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ error: "Name, price, and quantity are required." });
  }

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

module.exports = app;
