# Guide
## Login info:
- **username:** a
- **passsword:** abcd

# Features

## 1. User Authentication
- **Login**: Users can log in to their accounts with their registered credentials. Successful logins will save the username in localStorage for easier access in future sessions.
- **JWT token Management**: The application checks user login status through a backend API and token is valid for 1 hour.

## 2. User Dashboard
- **Products List**: This page is publicly viewable, means anyone can see all products (view-only).
- **User Profile**: Users can login and see a little avatar on the top right.
- **Product Cards**: Every product has its own cards form. I user can click on it then there are various options user can use like favorites(dummy for now), edit and delete product.

## 3. Navigation
- **Responsive Design**: The application is designed to be responsive, providing a seamless experience on various devices, including desktops, tablets, and mobile phones.
- **Intuitive UI**: The user interface is designed for easy navigation, with clear menus and buttons to guide users through the application.

## 4. Backend Integration
- **API Connectivity**: The application communicates with a backend API for user authentication and data retrieval, ensuring data consistency and security. Majorly, this have 2 API points /products and /login.
- **Error Handling**: User-friendly error messages are displayed for any API-related issues, enhancing user experience.

## 5. Additional Features
- **Product Image**: Users can see product images(dummy image for now).
- **In Page Notifications(Snackbar)**: Users receive notifications for adding, updating or deleting products. Also, alerts like login required.

## 6. Security
- **Password Protection**: User passwords are securely hashed and stored to prevent unauthorized access.
- **Data Authentication**: Only logged in users can add product, update or delete existing product. If they try without login in they will notified that they have to login for this.
