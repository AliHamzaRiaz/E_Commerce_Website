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
const saveBase64Image = async (base64Data, productId, pathKey = '') => {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:image/')) {
    return { converted: false, value: base64Data }; // Already a path or invalid, return as is
  }

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products');
  await fs.mkdir(uploadsDir, { recursive: true });

  // Extract file extension from base64 data
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return { converted: false, value: base64Data };
  }

  const mimeType = matches[1];
  const data = matches[2];
  let extension = 'png';
  if (mimeType === 'image/jpeg') extension = 'jpg';
  else if (mimeType === 'image/png') extension = 'png';
  else if (mimeType === 'image/gif') extension = 'gif';
  else if (mimeType === 'image/webp') extension = 'webp';

  const fileName = `${productId}-${pathKey}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, Buffer.from(data, 'base64'));

  // Return relative path for storage in DB
  return { converted: true, value: `/uploads/products/${fileName}` };
};

// Recursive function to process any value
const processValueRecursively = async (value, productId, currentPath = '') => {
  if (Array.isArray(value)) {
    const results = await Promise.all(
      value.map((item, index) => 
        processValueRecursively(item, productId, `${currentPath}[${index}]`)
      )
    );
    return {
      convertedCount: results.reduce((sum, res) => sum + res.convertedCount, 0),
      value: results.map(res => res.value)
    };
  } else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    const processedObj = {};
    let totalConverted = 0;
    for (const key of keys) {
      const result = await processValueRecursively(
        value[key], 
        productId, 
        currentPath ? `${currentPath}.${key}` : key
      );
      processedObj[key] = result.value;
      totalConverted += result.convertedCount;
    }
    return { convertedCount: totalConverted, value: processedObj };
  } else {
    const result = await saveBase64Image(value, productId, currentPath);
    return { convertedCount: result.converted ? 1 : 0, value: result.value };
  }
};

const migrateProduct = async (product) => {
  let totalConverted = 0;
  let newImage = product.image;
  let newColorImages = product.color_images;
  let newVariations = product.variations;

  // Process main image
  if (product.image) {
    const result = await saveBase64Image(product.image, product.id, 'main');
    if (result.converted) {
      totalConverted++;
      newImage = result.value;
    }
  }

  // Process color images recursively
  if (product.color_images) {
    const result = await processValueRecursively(product.color_images, product.id, 'colorImages');
    totalConverted += result.convertedCount;
    newColorImages = result.value;
  }

  // Process variations recursively (just in case)
  if (product.variations) {
    const result = await processValueRecursively(product.variations, product.id, 'variations');
    totalConverted += result.convertedCount;
    newVariations = result.value;
  }

  if (totalConverted > 0) {
    await pool.query(
      `UPDATE products SET image = $1, color_images = $2, variations = $3 WHERE id = $4`,
      [newImage, JSON.stringify(newColorImages), JSON.stringify(newVariations), product.id]
    );
    console.log(`✅ Migrated ${totalConverted} images for product ${product.id}`);
    return totalConverted;
  } else {
    console.log(`ℹ️ Product ${product.id} already has file paths, skipping`);
    return 0;
  }
};

const runMigration = async () => {
  console.log('🚀 Starting image migration...');
  let totalImagesConverted = 0;
  
  try {
    // Get all products
    const { rows: products } = await pool.query('SELECT id, image, color_images, variations FROM products');
    console.log(`📦 Found ${products.length} products to check`);

    for (const product of products) {
      const converted = await migrateProduct(product);
      totalImagesConverted += converted;
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const { rows } = await pool.query(`
      SELECT COUNT(*) 
      FROM products 
      WHERE image::text LIKE '%data:image%' 
         OR color_images::text LIKE '%data:image%'
         OR variations::text LIKE '%data:image%'
    `);
    const remaining = Number(rows[0].count);

    if (remaining === 0) {
      console.log('✅ Verification passed! No Base64 images remaining.');
    } else {
      console.warn(`⚠️ Verification failed! ${remaining} products still have Base64 images.`);
    }

    console.log(`🎉 Migration completed! Total images converted: ${totalImagesConverted}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
};

runMigration();
