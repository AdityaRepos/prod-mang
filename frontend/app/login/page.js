"use client"; // Ensure this is a client component

import React, { useState } from "react";
import { Container, TextField, Button, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error and success messages before each attempt
    setError("");
    setSuccessMessage("");

    try {
      // Make a POST request to the backend /login route
      const response = await fetch("https://prod-mang-api.vercel.app//login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Send username and password in the body
      });

      if (response.ok) {
        const data = await response.json(); // Parse the JSON response
        const token = data.token; // Extract the token from the response

        // Save token in localStorage after login
        localStorage.setItem("token", token);

        // Show success message
        setSuccessMessage("Logged in successfully!");

        // Redirect to /products after 1.5 seconds
        setTimeout(() => {
         window.location.href = '/products';
        }, 1000);

      } else {
        // If login fails, handle the error appropriately
        const errorMessage = await response.text(); // Get error message from the response
        setError(errorMessage || "Incorrect credentials. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: "50px" }}>
        <Typography variant="h5" align="center">
          Login
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
        {successMessage && <Typography color="primary" align="center">{successMessage}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Log In
          </Button>
        </form>
        <Typography variant="body2" align="center" style={{ marginTop: 16 }}>
          Don't have an account?{" "}
          <Button color="primary" onClick={() => router.push('/signup')}>
            Sign up
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
