// index.js
import express from "express";
import routes from "./components/routes.js";

const app = express();
const port = process.env.PORT || 5000;

// Use routes
app.use(routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
