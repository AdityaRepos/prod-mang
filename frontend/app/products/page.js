"use client"; // Required for using hooks in this component

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Button,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Backend API URL
const API_URL = "https://prod-mang-api.vercel.app//products";

const Products = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [editedProduct, setEditedProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Additional state for login alert snackbar
  const [loginAlertSnackbarOpen, setLoginAlertSnackbarOpen] = useState(false);

  // Modify the snackbar message state for login alert
  const [loginAlertMessage, setLoginAlertMessage] = useState("You need to log in first!");

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
        // Optional: Set username or any other user info if needed
      }
    };
  
    checkUserLoggedIn();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`, // Use JWT token in the Authorization header
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
  
    fetchProducts();
  }, []);
  

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogIn = () => {
    window.location.href = '/login';
  };

  const handleAddProduct = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorited((prev) => !prev);
  };

  const handleCloseLoginAlertSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setLoginAlertSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setLoginAlertSnackbarOpen(true); // Show login alert snackbar
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, newProduct, {
        headers: {
          Authorization: `Bearer ${token}`, // Use JWT token in the Authorization header
        },
      });
      setProducts([...products, response.data]);
      setDialogOpen(false);
      setNewProduct({ name: "", description: "", price: "", quantity: "" });
      handleSnackbar("Product added successfully!");
    } catch (error) {
      console.error("Error adding product", error);
    }
  };

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditIconClick = () => {
    setEditedProduct({
      name: selectedProduct.name,
      description: selectedProduct.description,
      price: selectedProduct.price,
      quantity: selectedProduct.quantity,
    });
    setEditDialogOpen(true);
  };

  const handleEditProduct = async () => {
    if (!isLoggedIn) {
      setLoginAlertSnackbarOpen(true); // Show login alert snackbar
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/${selectedProduct.id}`, editedProduct, {
        headers: {
          Authorization: `Bearer ${token}`, // Use JWT token in the Authorization header
        },
      });
      setProducts(products.map((prod) => (prod.id === response.data.id ? response.data : prod)));
      setEditDialogOpen(false);
      handleSnackbar("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!isLoggedIn) {
      setLoginAlertSnackbarOpen(true); // Show login alert snackbar
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${selectedProduct.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use JWT token in the Authorization header
        },
      });
      setProducts(products.filter((prod) => prod.id !== selectedProduct.id));
      setDetailDialogOpen(false);
      handleSnackbar("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };


  const handleLogOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("You have been logged out.");
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Products</Typography>
          {isLoggedIn ? (
            <Avatar alt={username} src="image.jpg" /> // Display avatar when logged in
          ) : (
            <Button color="inherit" onClick={handleLogIn}>
              Log In
            </Button>
          )}
          {isLoggedIn && (
            <Button color="inherit" onClick={handleLogOut}>
              Log Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} sx={{'& .MuiDrawer-paper': {width: 250, boxSizing: 'border-box',},}}>
        <List>
          <ListItem button onClick={toggleDrawer(false)}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={toggleDrawer(false)}>
            <ListItemText primary="Products" />
          </ListItem>
        </List>
      </Drawer>

      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2} padding="20px">
        {products.map((product) => (
          <Card
            key={product.id}
            style={{ backgroundColor: "#f5f5f5", position: "relative", cursor: "pointer" }}
            onClick={() => handleCardClick(product)}
          >
            <Box position="relative">
              <CardMedia component="img" alt={product.name} height="200" image={product.image || '/notavailable.png' || '/sus.jpeg'} />
              <Typography
                variant="body2"
                color="white"
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Quantity: {product.quantity}
              </Typography>
            </Box>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{product.name}</Typography>
                <Typography variant="h6" color="textSecondary">{product.price}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: "8px" }}>
                {product.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Fab color="primary" aria-label="add" style={{ position: "fixed", bottom: "20px", left: "20px" }} onClick={handleAddProduct}>
        <AddIcon />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} message={snackbarMessage} />
      {/* Login Alert Snackbar */}
      <Snackbar
        open={loginAlertSnackbarOpen}
        autoHideDuration={1500}
        onClose={handleCloseLoginAlertSnackbar}
      >
        <Alert onClose={handleCloseLoginAlertSnackbar} severity="error" variant="filled" sx={{ width: '100%' }}>
          {loginAlertMessage}
        </Alert>
      </Snackbar>

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter details for the new product.</DialogContentText>
          <TextField autoFocus margin="dense" name="name" label="Product Name" type="text" fullWidth variant="outlined" value={newProduct.name} onChange={handleInputChange} />
          <TextField margin="dense" name="description" label="Description" type="text" fullWidth variant="outlined" value={newProduct.description} onChange={handleInputChange} />
          <TextField margin="dense" name="price" label="Price" type="text" fullWidth variant="outlined" value={newProduct.price} onChange={handleInputChange} />
          <TextField margin="dense" name="quantity" label="Quantity" type="number" fullWidth variant="outlined" value={newProduct.quantity} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct?.name}</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <CardMedia component="img" alt={selectedProduct.name} height="300" image={selectedProduct.image || '/notavailable.png' || '/sus.jpeg'} />
              <Typography variant="h6" style={{ marginTop: "20px" }}>Price: {selectedProduct.price}</Typography>
              <Typography variant="body1" color="textSecondary" style={{ marginTop: "8px" }}>Quantity: {selectedProduct.quantity}</Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: "8px" }}>{selectedProduct.description}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {/*<IconButton onClick={handleAddToFavorites} color="secondary"><FavoriteIcon /></IconButton>*/}
          <IconButton onClick={handleToggleFavorite}>
            {isFavorited ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton onClick={handleEditIconClick} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={handleDeleteProduct} color="error"><DeleteIcon /></IconButton>
          <Button onClick={handleCloseDetailDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit details for the product.</DialogContentText>
          <TextField autoFocus margin="dense" name="name" label="Product Name" type="text" fullWidth variant="outlined" value={editedProduct.name} onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })} />
          <TextField margin="dense" name="description" label="Description" type="text" fullWidth variant="outlined" value={editedProduct.description} onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })} />
          <TextField margin="dense" name="price" label="Price" type="text" fullWidth variant="outlined" value={editedProduct.price} onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })} />
          <TextField margin="dense" name="quantity" label="Quantity" type="number" fullWidth variant="outlined" value={editedProduct.quantity} onChange={(e) => setEditedProduct({ ...editedProduct, quantity: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleEditProduct} color="primary">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for actions */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
        {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Products;
