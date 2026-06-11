const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Fallback data
const defaultProducts = [
  {
    id: "1",
    name: "Lace Bralette",
    description: "Beautiful lace bralette",
    price: 39.99,
    originalPrice: 59.99,
    discount: "33% OFF",
    category: "bra",
    colors: ["black", "nude"],
    sizes: ["S", "M", "L"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    available: true,
    stock: 50
  },
  {
    id: "2",
    name: "Silk Panties",
    description: "Luxurious silk panties",
    price: 24.99,
    originalPrice: 34.99,
    discount: "28% OFF",
    category: "underwear",
    colors: ["white", "pink"],
    sizes: ["XS", "S", "M"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    available: true,
    stock: 30
  }
];

const fallbackCategories = [
  { id: 1, name: "bra", displayName: "Bra" },
  { id: 2, name: "underwear", displayName: "Underwear" },
  { id: 3, name: "nightwear", displayName: "Nightwear" },
  { id: 4, name: "activewear", displayName: "Activewear" }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is working!' });
});

app.get('/api/products', (req, res) => {
  res.json(defaultProducts);
});

app.get('/api/categories', (req, res) => {
  res.json(fallbackCategories);
});

module.exports = app;
