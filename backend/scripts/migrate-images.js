const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
const backendEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

const pool = require('../utils/db');

// Copy of saveBase64Image from productRepository.js
const fs = require('fs/promises');
const saveBase64Image = async (base64Data, productId, index = 0) => {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return base64Data; // Already a path or invalid, return as is
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products');
  await fs.mkdir(uploadsDir, { recursive: true });

  // Extract file extension from base64 data
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Data;
  }

  const mimeType = matches[1];
  const data = matches[2];
  let extension = 'png';
  if (mimeType === 'image/jpeg') extension = 'jpg';
  else if (mimeType === 'image/png') extension = 'png';
  else if (mimeType === 'image/gif') extension = 'gif';
  else if (mimeType === 'image/webp') extension = 'webp';

  const fileName = `${productId}-${Date.now()}-${index}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, Buffer.from(data, 'base64'));

  // Return relative path for storage in DB
  return `/uploads/products/${fileName}`;
};

const migrateProduct = async (product) => {
  let updated = false;
  let newImage = product.image;
  let newColorImages = product.color_images;

  // Process main image
  if (product.image && product.image.startsWith('data:')) {
    newImage = await saveBase64Image(product.image, product.id, 'main');
    updated = true;
  }

  // Process color images
  if (product.color_images && typeof product.color_images === 'object') {
    const processedColorImages = {};
    let colorUpdated = false;
    for (const [color, images] of Object.entries(product.color_images)) {
      const imagesArray = Array.isArray(images) ? images : [images];
      const processedImages = [];
      for (let i = 0; i < imagesArray.length; i++) {
        const img = imagesArray[i];
        const processed = await saveBase64Image(img, product.id, `${color}-${i}`);
        if (processed !== img) colorUpdated = true;
        processedImages.push(processed);
      }
      processedColorImages[color] = processedImages;
    }
    if (colorUpdated) {
      newColorImages = processedColorImages;
      updated = true;
    }
  }

  if (updated) {
    await pool.query(
      `UPDATE products SET image = $1, color_images = $2 WHERE id = $3`,
      [newImage, JSON.stringify(newColorImages), product.id]
    );
    console.log(`✅ Migrated product ${product.id}`);
  } else {
    console.log(`ℹ️ Product ${product.id} already has file paths, skipping`);
  }
};

const runMigration = async () => {
  console.log('🚀 Starting image migration...');
  
  try {
    // Get all products
    const { rows: products } = await pool.query('SELECT id, image, color_images FROM products');
    console.log(`📦 Found ${products.length} products to check`);

    for (const product of products) {
      await migrateProduct(product);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
};

runMigration();
