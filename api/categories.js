const fallbackCategories = [
  { id: 1, name: "bra", displayName: "Bra" },
  { id: 2, name: "underwear", displayName: "Underwear" },
  { id: 3, name: "nightwear", displayName: "Nightwear" },
  { id: 4, name: "activewear", displayName: "Activewear" }
];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(fallbackCategories);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
