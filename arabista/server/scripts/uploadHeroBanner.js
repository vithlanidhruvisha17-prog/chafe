const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const { uploadImage } = require('../src/services/storageService');

async function upload() {
  const filePath = path.resolve(__dirname, '../seed-images/banners/hero-ritual.webp');
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found: ' + filePath);
  }

  const buffer = fs.readFileSync(filePath);
  const fileObj = {
    buffer,
    originalname: 'hero-ritual.webp',
    mimetype: 'image/webp',
  };

  console.log('Uploading hero-ritual.webp to Supabase Storage bucket arabista-images/banners...');
  const result = await uploadImage(fileObj, 'banners');
  console.log('UPLOAD_SUCCESS');
  console.log('URL:', result.url);
  console.log('Path:', result.path);

  // Also update uploaded_special_urls.json if it exists
  const specialUrlsPath = path.resolve(__dirname, 'uploaded_special_urls.json');
  if (fs.existsSync(specialUrlsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(specialUrlsPath, 'utf8'));
      data['hero-ritual'] = result.url;
      fs.writeFileSync(specialUrlsPath, JSON.stringify(data, null, 2));
      console.log('Updated uploaded_special_urls.json');
    } catch (e) {
      console.warn('Could not update uploaded_special_urls.json:', e.message);
    }
  }
}

upload()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Upload failed:', err.message);
    process.exit(1);
  });
