"use client"; // Ensure this is a client component

import React, { useState } from "react";
import { Container, TextField, Button, Typography, Paper } from "@mui/material";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const SignupPage = () => {
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
      // Make a POST request to the backend /signup route
      const response = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), // Send username and password
      });

      if (response.ok) {
        // If signup is successful, show success message
        setSuccessMessage("User created successfully! And logged In.");
        // Optionally redirect to login page
        setTimeout(() => {
            window.close();
        }, 3000);
      } else {
        // If signup fails, handle the error appropriately
        const errorMessage = await response.text(); // Get error message from the response
        setError(errorMessage || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: "50px" }}>
        <Typography variant="h5" align="center">
          Sign Up
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
            Sign Up
          </Button>
        </form>
        <Typography variant="body2" align="center" style={{ marginTop: 16 }}>
          Already have an account?{" "}
          <Button color="primary" onClick={() => router.push('/login')}>
            Log in
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
};

export default SignupPage;
