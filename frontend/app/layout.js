// app/layout.js
import './globals.css'; // Adjust the path as necessary

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
