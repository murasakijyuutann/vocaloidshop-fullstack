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

// ✅ Decrement cart item quantity by 1
app.patch("/api/cart/:cartItemId/decrement", async (req, res) => {
  try {
    const r = await axios.patch(
      `${SPRING_API}/api/cart/${req.params.cartItemId}/decrement`
    );
    res.sendStatus(r.status);
  } catch (err) {
    console.error("Decrement cart item failed:", err.message);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Failed to decrement cart item" });
  }
});

    // ✅ Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const r = await axios.post(`${SPRING_API}/auth/login`, req.body);
    res.json(r.data);
  } catch (e) {
    res.status(401).json({ error: "Login failed" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const r = await axios.post(`${SPRING_API}/auth/register`, req.body);
    res.json(r.data);
  } catch (e) {
    res.status(400).json({ error: "Register failed" });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const r = await axios.get(`${SPRING_API}/auth/me`, {
      headers: { Authorization: token },
    });
    res.json(r.data);
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
});


app.listen(process.env.PORT, () =>
  console.log(`✅ Express proxy running on port ${process.env.PORT}`)
);
