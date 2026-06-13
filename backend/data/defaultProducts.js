const svgDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const productImage = ({ bg1, bg2, accent, title, subtitle }) =>
  svgDataUri(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1300" viewBox="0 0 1000 1300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1300" fill="url(#bg)"/>
  <rect width="1000" height="1300" fill="url(#glow)"/>
  <g fill="none" stroke="${accent}" stroke-width="10" opacity="0.9">
    <path d="M210,520 C280,420 365,360 500,360 C635,360 720,420 790,520" />
    <path d="M210,520 C220,640 265,735 335,805 C400,870 445,900 500,900 C555,900 600,870 665,805 C735,735 780,640 790,520" />
    <path d="M310,430 C270,390 240,350 230,300" />
    <path d="M690,430 C730,390 760,350 770,300" />
    <path d="M360,620 C390,560 435,530 500,530 C565,530 610,560 640,620" opacity="0.7"/>
    <path d="M420,760 C450,720 475,700 500,700 C525,700 550,720 580,760" opacity="0.55"/>
  </g>
  <g font-family="Inter, Arial, sans-serif" fill="white" opacity="0.95">
    <text x="80" y="1180" font-size="52" font-weight="700" letter-spacing="6">${title}</text>
    <text x="80" y="1245" font-size="26" letter-spacing="3" fill="rgba(255,255,255,0.75)">${subtitle}</text>
  </g>
</svg>`);

const defaultProducts = [
  {
    id: 1,
    name: 'Lace Elegance Bra',
    description:
      'A refined lace bra crafted for those who appreciate true elegance. Features delicate floral patterns and superior support.',
    price: 3500,
    originalPrice: 4200,
    discount: '16% Off',
    category: 'Bra',
    colors: ['Midnight Blue', 'Classic Black', 'Rose Pink'],
    sizes: ['32B', '34B', '36B', '34C', '36C'],
    available: true,
    stock: 50,
    image: productImage({
      bg1: '#0a1128',
      bg2: '#1c2541',
      accent: '#c5a059',
      title: 'LACE ELEGANCE',
      subtitle: 'BRA COLLECTION',
    }),
  },
  {
    id: 2,
    name: 'Seamless Comfort Underwear',
    description:
      'Ultra-soft, seamless underwear that provides all-day comfort and a smooth silhouette under any outfit.',
    price: 1200,
    originalPrice: 1500,
    discount: '20% Off',
    category: 'Underwear',
    colors: ['Nude', 'Classic Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    stock: 80,
    image: productImage({
      bg1: '#1c2541',
      bg2: '#0a1128',
      accent: '#e3bc9a',
      title: 'SEAMLESS',
      subtitle: 'UNDERWEAR',
    }),
  },
  {
    id: 3,
    name: 'Silk Satin Bralette',
    description: 'Luxurious silk satin bralette with adjustable straps. Perfect for lounging or layering.',
    price: 2800,
    originalPrice: 3200,
    discount: '12% Off',
    category: 'Bra',
    colors: ['Emerald Green', 'Champagne', 'Black'],
    sizes: ['S', 'M', 'L'],
    available: true,
    stock: 40,
    image: productImage({
      bg1: '#0b2f2a',
      bg2: '#0a1128',
      accent: '#c5a059',
      title: 'SILK SATIN',
      subtitle: 'BRALETTE',
    }),
  },
  {
    id: 4,
    name: 'Cotton Daily Panty Pack',
    description: 'Breathable cotton panties for everyday wear. Pack of 3 in assorted colors.',
    price: 2500,
    originalPrice: 3000,
    discount: '17% Off',
    category: 'Underwear',
    colors: ['Pastel Mix', 'Basic Mix'],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    stock: 100,
    image: productImage({
      bg1: '#2a1b3d',
      bg2: '#0a1128',
      accent: '#c5a059',
      title: 'COTTON DAILY',
      subtitle: 'PANTY PACK',
    }),
  },
  {
    id: 'demo-5',
    name: 'Contour Lift Bra',
    description:
      'Structured cups with side support for everyday lift. Dummy catalog item — edit or delete in Admin → Products.',
    price: 3900,
    originalPrice: 4500,
    discount: '13% Off',
    category: 'Bra',
    colors: ['Black', 'Taupe', 'Ivory'],
    sizes: ['32C', '34C', '36C', '34D'],
    available: true,
    stock: 35,
    image: productImage({
      bg1: '#1a0f24',
      bg2: '#3d2a1f',
      accent: '#d4af7a',
      title: 'CONTOUR LIFT',
      subtitle: 'BRA',
    }),
  },
  {
    id: 'demo-6',
    name: 'High-Waist Shaping Brief',
    description: 'Smoothing high-waist brief with soft stretch. Dummy Postgres row for shop + admin testing.',
    price: 1800,
    originalPrice: 2200,
    discount: '18% Off',
    category: 'Underwear',
    colors: ['Black', 'Nude'],
    sizes: ['S', 'M', 'L', 'XL'],
    available: true,
    stock: 60,
    image: productImage({
      bg1: '#0f1f2e',
      bg2: '#1a2d3d',
      accent: '#e8c4a8',
      title: 'HIGH-WAIST',
      subtitle: 'BRIEF',
    }),
  },
  {
    id: 'demo-7',
    name: 'Strapless Bandeau Bra',
    description: 'Stay-put bandeau for off-shoulder looks. Seeded in PostgreSQL for storefront display.',
    price: 3200,
    originalPrice: 3800,
    discount: '16% Off',
    category: 'Bra',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L'],
    available: true,
    stock: 28,
    image: productImage({
      bg1: '#152238',
      bg2: '#0a1128',
      accent: '#c5a059',
      title: 'BANDEAU',
      subtitle: 'STRAPLESS',
    }),
  },
  {
    id: 'demo-8',
    name: 'Modal Hipster 2-Pack',
    description: 'Two-pack hipster in breathable modal. Add more rows via Admin; they save to PostgreSQL.',
    price: 2100,
    originalPrice: 2600,
    discount: '19% Off',
    category: 'Underwear',
    colors: ['Blush', 'Slate', 'Black'],
    sizes: ['S', 'M', 'L'],
    available: true,
    stock: 90,
    image: productImage({
      bg1: '#2d1f28',
      bg2: '#0a1128',
      accent: '#f0d6c8',
      title: 'MODAL PACK',
      subtitle: 'HIPSTER x2',
    }),
  },
];

module.exports = { defaultProducts };
