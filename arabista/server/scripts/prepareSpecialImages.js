const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sharp = require('sharp');
const { uploadImage } = require('../src/services/storageService');

const SPECIAL_IMAGES = [
  {
    key: 'hero-ritual',
    folder: 'banners',
    // Specialty pour-over / cold drip coffee ritual
    unsplashId: 'photo-1514432324607-a09d9b4aefdd',
    fallbackId: 'photo-1495474472287-4d71bcdd2085',
  },
  {
    key: 'chef-arabito',
    folder: 'gallery',
    // Artisan chef / culinary master in kitchen
    unsplashId: 'photo-1577219491135-ce391730fb2c',
    fallbackId: 'photo-1600565193348-f74bd3c7ccdf',
  },
  {
    key: 'story-sanctuary',
    folder: 'gallery',
    // Atmospheric café sanctuary interior with warm ambience
    unsplashId: 'photo-1554118811-1e0d58224f24',
    fallbackId: 'photo-1501339847302-ac426a4a7cbb',
  },
];

const downloadBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return downloadBuffer(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
};

const fetchUnsplashWebp = async (item) => {
  const tryIds = [item.unsplashId, item.fallbackId].filter(Boolean);
  for (const id of tryIds) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
    try {
      console.log(`Downloading ${item.key} from Unsplash ID ${id}...`);
      const rawBuf = await downloadBuffer(url);
      const webpBuf = await sharp(rawBuf)
        .webp({ quality: 85 })
        .toBuffer();
      return webpBuf;
    } catch (err) {
      console.warn(`Failed for ${id}: ${err.message}. Trying fallback...`);
    }
  }
  throw new Error(`Could not download image for ${item.key}`);
};

async function main() {
  console.log('--- PREPARING & UPLOADING 3 DEDICATED WEBP IMAGES TO SUPABASE ---');
  const results = {};

  for (const item of SPECIAL_IMAGES) {
    try {
      const buffer = await fetchUnsplashWebp(item);
      const filename = `${item.key}.webp`;
      const localPath = path.resolve(__dirname, `../seed-images/${item.folder}/${filename}`);
      fs.writeFileSync(localPath, buffer);
      console.log(`Saved locally to ${localPath}`);

      const uploadResult = await uploadImage(
        {
          buffer,
          originalname: filename,
          mimetype: 'image/webp',
        },
        item.folder
      );

      results[item.key] = uploadResult.url;
      console.log(`[SUCCESS] Uploaded ${item.key} -> ${uploadResult.url}`);
    } catch (err) {
      console.error(`[ERROR] Processing ${item.key}:`, err.message);
    }
  }

  const resultFilePath = path.resolve(__dirname, 'uploaded_special_urls.json');
  fs.writeFileSync(resultFilePath, JSON.stringify(results, null, 2));
  console.log('Finished. Saved URLs to:', resultFilePath);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
