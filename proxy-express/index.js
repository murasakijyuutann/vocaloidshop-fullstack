import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SPRING_API = process.env.SPRING_API;

// Example route: forward to Spring Boot
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/products`);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch from backend" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/categories`);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch from backend" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/users`);
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to fetch from backend" });
  }
});

// ✅ Add to cart
app.post("/api/cart", async (req, res) => {
  try {
    const response = await axios.post(`${SPRING_API}/api/cart`, req.body);
    res.status(response.status).send();
  } catch (err) {
    console.error("Add to cart failed:", err.message);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// ✅ View cart by user
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_API}/api/cart/${req.params.userId}`);
    res.json(response.data);
  } catch (err) {
    console.error("View cart failed:", err.message);
    res.status(500).json({ error: "Failed to load cart" });
  }
});

// ✅ Remove cart item
app.delete("/api/cart/:cartItemId", async (req, res) => {
  try {
    await axios.delete(`${SPRING_API}/api/cart/${req.params.cartItemId}`);
    res.sendStatus(204);
  } catch (err) {
    console.error("Delete cart item failed:", err.message);
    res.status(500).json({ error: "Failed to delete cart item" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`✅ Express proxy running on port ${process.env.PORT}`)
);
