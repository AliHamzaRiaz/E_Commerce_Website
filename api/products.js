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
  },
  {
    id: "3",
    name: "Push-Up Bra",
    description: "Enhancing push-up bra",
    price: 49.99,
    originalPrice: 69.99,
    discount: "28% OFF",
    category: "bra",
    colors: ["black", "red", "nude"],
    sizes: ["32B", "34B", "36B", "32C", "34C", "36C"],
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20black%20push%20up%20bra%20product%20photography&image_size=square_hd",
    available: true,
    stock: 40
  },
  {
    id: "4",
    name: "Sports Bra",
    description: "High impact sports bra",
    price: 44.99,
    originalPrice: 54.99,
    discount: "18% OFF",
    category: "activewear",
    colors: ["black", "gray", "navy"],
    sizes: ["S", "M", "L", "XL"],
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=sporty%20black%20sports%20bra%20product%20photography&image_size=square_hd",
    available: true,
    stock: 60
  },
  {
    id: "5",
    name: "Satin Chemise",
    description: "Elegant satin nightwear",
    price: 59.99,
    originalPrice: 79.99,
    discount: "25% OFF",
    category: "nightwear",
    colors: ["black", "burgundy", "ivory"],
    sizes: ["XS", "S", "M", "L"],
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elegant%20black%20satin%20chemise%20nightwear%20product%20photography&image_size=square_hd",
    available: true,
    stock: 25
  },
  {
    id: "6",
    name: "Padded Bra",
    description: "Comfortable padded bra",
    price: 34.99,
    originalPrice: 49.99,
    discount: "30% OFF",
    category: "bra",
    colors: ["nude", "white", "black"],
    sizes: ["32A", "34A", "32B", "34B", "36B", "32C", "34C"],
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comfortable%20nude%20padded%20bra%20product%20photography&image_size=square_hd",
    available: true,
    stock: 45
  }
];

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(defaultProducts);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
