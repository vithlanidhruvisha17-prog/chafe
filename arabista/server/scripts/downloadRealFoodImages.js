const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const downloadBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
};

const makeUnsplashUrl = (id, width = 800) => {
  return `https://images.unsplash.com/${id}?w=${width}&auto=format&fit=crop&q=80`;
};

// Curated authentic real food & beverage photo IDs from Unsplash
const REAL_FOOD_ASSETS = {
  categories: [
    { slug: 'the-pour', id: 'photo-1509042239860-f550ce710b93' }, // Latte art in ceramic cup
    { slug: 'food', id: 'photo-1513104890138-7c749659a591' },     // Woodfired sourdough pizza
    { slug: 'pastas', id: 'photo-1621996346565-e3d5d6281744' },   // Fresh Italian pasta
    { slug: 'dessert', id: 'photo-1571877227200-a0d98ea607e9' },  // Gourmet plated dessert
    { slug: 'salad', id: 'photo-1512621776951-a57141f2eefd' },    // Crisp colorful salad bowl
  ],
  subcategories: [
    // The Pour
    { slug: 'crafted-warmth', id: 'photo-1514432324607-a09d9b4aefdd' }, // Flat white / cappuccino
    { slug: 'crafted-chills', id: 'photo-1517256064527-09c73fc73e38' }, // Iced cold brew
    { slug: 'manual-brew', id: 'photo-1511920170033-f8396924c348' },    // Barista V60 pour over
    { slug: 'brew-tonic-series', id: 'photo-1517701550927-30cf4ba1dba5' }, // Sparkling coffee tonic
    { slug: 'signature-latte', id: 'photo-1495474472287-4d71bcdd2085' }, // Signature latte
    { slug: 'vietnamese-collection', id: 'photo-1572442388796-11668a67e53d' }, // Vietnamese drip iced coffee
    { slug: 'indulgent-mocha', id: 'photo-1578314675249-a6910f80cc4e' }, // Dark chocolate mocha
    { slug: 'beyond-coffee', id: 'photo-1576092768241-dec231879fc3' },   // Spiced golden drink
    { slug: 'ice-tea', id: 'photo-1556679343-c7306c1976bc' },             // Mint lemon iced tea
    { slug: 'matcha-rituals', id: 'photo-1536256263959-770b48d82b0a' },  // Green matcha latte
    { slug: 'shakes', id: 'photo-1572490122747-3968b75cc699' },          // Belgian chocolate shake
    { slug: 'arabista-special', id: 'photo-1521017432531-fbd92d768814' }, // Cardamom cold coffee
    // Salad
    { slug: 'signature-bowls-greens', id: 'photo-1540420773420-3366772f4999' }, // Green bowl
    // Food
    { slug: 'fries', id: 'photo-1576107232684-1279f3908594' },           // Truffle golden fries
    { slug: 'nachos', id: 'photo-1513456852971-30c0b8199d4d' },          // Loaded nachos
    { slug: 'croissant-sandwiches', id: 'photo-1555396273-367ea4eb4db5' }, // French croissant
    { slug: 'breads-bruschetta', id: 'photo-1506280754576-f6fa8a873550' }, // Heirloom bruschetta
    { slug: 'rice-spice-bowls', id: 'photo-1546069901-ba9599a7e63c' },   // Spiced grain bowl
    { slug: 'artisan-pizzas', id: 'photo-1565299624946-b28f40a0ae38' },  // Neapolitan pizza
    // Pastas
    { slug: '01-maggie-but-make-it-italian', id: 'photo-1551183053-bf91a1d81141' }, // Italian fusion pasta
    { slug: '02-veggie-main-character', id: 'photo-1621996346565-e3d5d6281744' },     // Roasted vegetable pasta
    { slug: '03-arrabbiata-red-flag', id: 'photo-1563379091339-03b21ab4a4f8' },       // Spicy red arrabbiata
    { slug: '04-garlic-girl-summer', id: 'photo-1589302168068-964664d93dc0' },        // Aglio e olio garlic
    { slug: '05-chilly-got-personal', id: 'photo-1608897013039-887f21d8c804' },       // Paprika chili rigatoni
    { slug: '06-alfredo-s-comfort-zone', id: 'photo-1645112411341-6c4fd023714a' },    // Creamy alfredo fettuccine
    { slug: '07-pink-sauce-problems', id: 'photo-1608219992759-8d74ed8d76eb' },       // Pink cream sauce pasta
    { slug: '08-pesto-your-besto', id: 'photo-1556761223-4c4282c73f77' },          // Genovese basil pesto
    // Dessert
    { slug: '01-brownie', id: 'photo-1606313564200-e75d5e30476c' },                   // Fudgy chocolate brownie
    { slug: '02-cheesecake', id: 'photo-1533134242443-d4fd215305ad' },                // Basque burnt cheesecake
    { slug: '03-choco-caramel-chemistry', id: 'photo-1587314168485-3236d6710814' },   // Caramel chocolate lava
    { slug: '04-little-miss-chocolate', id: 'photo-1578985545062-69928b1d9587' },     // Triple chocolate tart
    { slug: '05-tiramisu-after-dark', id: 'photo-1571877227200-a0d98ea607e9' },       // Espresso cocoa tiramisu
    { slug: '06-nutella-in-a-flaky-relationship', id: 'photo-1509440159596-0249088772ff' }, // Nutella croissant pastry
  ],
  items: [
    { slug: 'signature-latte', id: 'photo-1509042239860-f550ce710b93' }, // Rosette latte
    { slug: 'arabista-special', id: 'photo-1517256064527-09c73fc73e38' }, // Iced cold brew cardamom
    { slug: 'biscoff-dream', id: 'photo-1572490122747-3968b75cc699' },    // Caramel biscuit frappe
    { slug: 'artisan-pizzas', id: 'photo-1513104890138-7c749659a591' },   // Sourdough pizza
  ],
  banners: [
    { filename: 'monsoon-pour-over-series.webp', id: 'photo-1447933601403-0c6688de566e', width: 1400, height: 600 }, // Pour over extraction
    { filename: 'the-pasta-lab-sourdough.webp', id: 'photo-1555396273-367ea4eb4db5', width: 1400, height: 600 },    // Sourdough kitchen counter
    { filename: 'cardamom-infused-brews.webp', id: 'photo-1461023058943-07fcbe16d735', width: 1400, height: 600 },   // Chilled brew over ice
  ],
  gallery: [
    { filename: 'espresso-bar-and-drip-station.webp', id: 'photo-1501339847302-ac426a4a7cbb', width: 900, height: 700 }, // Espresso machine
    { filename: 'sanctuary-seating-nook.webp', id: 'photo-1554118811-1e0d58224f24', width: 900, height: 700 },        // Cozy café booth
    { filename: 'sourdough-artisan-pizza-oven.webp', id: 'photo-1559925393-8be0ec4767c8', width: 900, height: 700 },  // Woodfired oven
    { filename: 'manual-brew-pour-over-corner.webp', id: 'photo-1525610553991-2bede1a236e2', width: 900, height: 700 }, // Pour over bar shelf
    { filename: 'courtyard-alfresco-ambience.webp', id: 'photo-1442512595331-e89e73853f31', width: 900, height: 700 },  // Morning café light
    { filename: 'italian-pasta-lab-counter.webp', id: 'photo-1556761223-4c4282c73f77', width: 900, height: 700 },    // Fresh pasta herbs
  ],
};

async function processSection(items, folder, defaultWidth, defaultHeight) {
  const dir = path.resolve(__dirname, `../seed-images/${folder}`);
  ensureDir(dir);

  console.log(`\nDownloading and converting ${items.length} real food images for '${folder}' into .webp...`);

  for (const item of items) {
    const filename = item.filename || `${item.slug}.webp`;
    const destPath = path.join(dir, filename);
    const targetWidth = item.width || defaultWidth;
    const targetHeight = item.height || defaultHeight;
    const url = makeUnsplashUrl(item.id, targetWidth);

    try {
      const buffer = await downloadBuffer(url);
      await sharp(buffer)
        .resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log(`  [Done] ${folder}/${filename}`);
    } catch (err) {
      console.error(`  [Error] Failed to process ${filename}:`, err.message);
    }
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('       DOWNLOADING REAL FOOD IMAGES AS .WEBP');
  console.log('======================================================');

  // Categories (800x600)
  await processSection(REAL_FOOD_ASSETS.categories, 'categories', 800, 600);

  // Subcategories (800x600)
  await processSection(REAL_FOOD_ASSETS.subcategories, 'subcategories', 800, 600);

  // Menu items (600x600)
  await processSection(REAL_FOOD_ASSETS.items, 'items', 600, 600);

  // Banners (1400x600)
  await processSection(REAL_FOOD_ASSETS.banners, 'banners', 1400, 600);

  // Gallery (900x700)
  await processSection(REAL_FOOD_ASSETS.gallery, 'gallery', 900, 700);

  console.log('\n======================================================');
  console.log('  All real food images saved as high quality .webp!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error downloading real food images:', err);
  process.exit(1);
});
