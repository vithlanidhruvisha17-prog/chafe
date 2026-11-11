const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const slugify = require('../src/utils/slugify');

const escapeXml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Strict Palette Colors ONLY
const C = {
  forest: '#173D32',
  ivory: '#F6F1E7',
  sage: '#A5AF96',
  coffee: '#B78B59',
  charcoal: '#242321',
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// SVG template for Category cover
const createCategorySvg = (name, index = 1) => {
  const safeName = escapeXml(name);
  const bg = index % 2 === 0 ? C.forest : C.ivory;
  const fg = index % 2 === 0 ? C.ivory : C.forest;
  const accent = C.coffee;
  const border = C.sage;

  return `
  <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${bg}"/>
    <rect x="24" y="24" width="752" height="552" rx="20" fill="none" stroke="${border}" stroke-width="2" stroke-opacity="0.4"/>
    <path d="M 280 480 L 280 240 A 120 120 0 0 1 520 240 L 520 480 Z" fill="${index % 2 === 0 ? C.charcoal : C.sage}" fill-opacity="0.2" stroke="${accent}" stroke-width="2"/>
    <circle cx="400" cy="240" r="70" fill="none" stroke="${border}" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="400" cy="240" r="45" fill="${accent}"/>
    <text x="400" y="255" font-family="'Playfair Display', Georgia, serif" font-size="42" font-weight="bold" fill="${C.ivory}" text-anchor="middle">A</text>
    <text x="400" y="90" font-family="'Poppins', sans-serif" font-size="14" font-weight="600" letter-spacing="4" fill="${accent}" text-anchor="middle">ARABISTA CAFE &#8226; SURAT</text>
    <text x="400" y="380" font-family="'Playfair Display', Georgia, serif" font-size="38" font-weight="bold" fill="${fg}" text-anchor="middle">${safeName.toUpperCase()}</text>
    <text x="400" y="420" font-family="'Poppins', sans-serif" font-size="15" fill="${fg}" fill-opacity="0.75" text-anchor="middle">Curated Artisanal Collection</text>
    <line x1="320" y1="445" x2="480" y2="445" stroke="${accent}" stroke-width="2"/>
    <text x="400" y="530" font-family="'Poppins', sans-serif" font-size="12" letter-spacing="2" fill="${border}" text-anchor="middle">SPECIALTY RECIPES &#8226; FRESH CRAFT</text>
  </svg>`;
};

// SVG template for Sub-Category cover
const createSubCategorySvg = (name, parentName = 'Collection', index = 1) => {
  const safeName = escapeXml(name);
  const safeParent = escapeXml(parentName);
  const bg = index % 3 === 0 ? C.charcoal : index % 3 === 1 ? C.forest : C.ivory;
  const fg = bg === C.ivory ? C.forest : C.ivory;
  const accent = C.coffee;
  const border = C.sage;

  return `
  <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${bg}"/>
    <rect x="20" y="20" width="760" height="560" rx="16" fill="none" stroke="${border}" stroke-width="1.5" stroke-opacity="0.35"/>
    <path d="M 300 460 L 300 250 A 100 100 0 0 1 500 250 L 500 460 Z" fill="${C.coffee}" fill-opacity="0.15" stroke="${accent}" stroke-width="1.5"/>
    <circle cx="400" cy="240" r="50" fill="${C.forest}" stroke="${border}" stroke-width="1"/>
    <text x="400" y="252" font-family="'Playfair Display', Georgia, serif" font-size="32" font-weight="bold" fill="${C.ivory}" text-anchor="middle">${String(index).padStart(2, '0')}</text>
    <text x="400" y="80" font-family="'Poppins', sans-serif" font-size="13" font-weight="600" letter-spacing="3" fill="${accent}" text-anchor="middle">${safeParent.toUpperCase()}</text>
    <text x="400" y="370" font-family="'Playfair Display', Georgia, serif" font-size="30" font-weight="bold" fill="${fg}" text-anchor="middle">${safeName}</text>
    <text x="400" y="410" font-family="'Poppins', sans-serif" font-size="14" fill="${fg}" fill-opacity="0.75" text-anchor="middle">Made to Order &#8226; Daily Fresh</text>
    <line x1="340" y1="435" x2="460" y2="435" stroke="${accent}" stroke-width="1.5"/>
    <text x="400" y="525" font-family="'Poppins', sans-serif" font-size="11" letter-spacing="2" fill="${border}" text-anchor="middle">ARABISTA SANCTUARY</text>
  </svg>`;
};

// SVG template for Menu Item
const createItemSvg = (name, price = 250, index = 1) => {
  const safeName = escapeXml(name);
  const bg = C.ivory;
  const fg = C.forest;
  const accent = C.coffee;
  const border = C.sage;

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="${bg}"/>
    <rect x="20" y="20" width="560" height="560" rx="20" fill="none" stroke="${border}" stroke-width="1.5" stroke-opacity="0.5"/>
    <path d="M 200 430 L 200 220 A 100 100 0 0 1 400 220 L 400 430 Z" fill="${C.forest}" fill-opacity="0.08" stroke="${accent}" stroke-width="1.5"/>
    <circle cx="300" cy="210" r="55" fill="${C.forest}" stroke="${border}" stroke-width="2"/>
    <text x="300" y="222" font-family="'Playfair Display', Georgia, serif" font-size="34" font-weight="bold" fill="${C.ivory}" text-anchor="middle">AR</text>
    <text x="300" y="80" font-family="'Poppins', sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="${accent}" text-anchor="middle">HOUSE SPECIALTY</text>
    <text x="300" y="340" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="bold" fill="${fg}" text-anchor="middle">${safeName}</text>
    <text x="300" y="380" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="bold" fill="${accent}" text-anchor="middle">&#8377;${price}</text>
    <text x="300" y="470" font-family="'Poppins', sans-serif" font-size="11" letter-spacing="2" fill="${C.charcoal}" fill-opacity="0.6" text-anchor="middle">HANDCRAFTED FRESH TO ORDER</text>
  </svg>`;
};

// SVG template for Promotional Banners
const createBannerSvg = (title, subtitle, tag = 'Special Feature') => {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  const safeTag = escapeXml(tag);

  return `
  <svg width="1400" height="600" viewBox="0 0 1400 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${C.forest}"/>
        <stop offset="60%" stop-color="${C.charcoal}"/>
        <stop offset="100%" stop-color="${C.forest}"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="600" fill="url(#bannerGrad)"/>
    <circle cx="1200" cy="300" r="280" fill="none" stroke="${C.sage}" stroke-width="1.5" stroke-opacity="0.25"/>
    <circle cx="1200" cy="300" r="180" fill="${C.coffee}" fill-opacity="0.1" stroke="${C.coffee}" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M 1120 460 L 1120 220 A 80 80 0 0 1 1280 220 L 1280 460 Z" fill="none" stroke="${C.sage}" stroke-width="2" stroke-opacity="0.3"/>
    <text x="1200" y="325" font-family="'Playfair Display', Georgia, serif" font-size="80" font-weight="bold" fill="${C.ivory}" fill-opacity="0.2" text-anchor="middle">A</text>
    <rect x="80" y="110" width="220" height="34" rx="17" fill="${C.ivory}" fill-opacity="0.1" stroke="${C.sage}" stroke-width="1"/>
    <text x="190" y="132" font-family="'Poppins', sans-serif" font-size="12" font-weight="600" letter-spacing="2" fill="${C.coffee}" text-anchor="middle">${safeTag.toUpperCase()}</text>
    <text x="80" y="240" font-family="'Playfair Display', Georgia, serif" font-size="56" font-weight="bold" fill="${C.ivory}">${safeTitle}</text>
    <text x="80" y="310" font-family="'Poppins', sans-serif" font-size="20" fill="${C.ivory}" fill-opacity="0.8">${safeSubtitle}</text>
    <line x1="80" y1="360" x2="380" y2="360" stroke="${C.coffee}" stroke-width="2.5"/>
    <text x="80" y="460" font-family="'Poppins', sans-serif" font-size="13" letter-spacing="3" fill="${C.sage}">ARABISTA &#8226; SURAT, GUJARAT &#8226; ARTISANAL SPECIALTY</text>
  </svg>`;
};

// SVG template for Gallery
const createGallerySvg = (title, index = 1) => {
  const safeTitle = escapeXml(title);
  const bg = index % 2 === 0 ? C.charcoal : C.forest;
  return `
  <svg width="900" height="700" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="700" fill="${bg}"/>
    <rect x="30" y="30" width="840" height="640" rx="20" fill="none" stroke="${C.sage}" stroke-width="2" stroke-opacity="0.3"/>
    <path d="M 330 520 L 330 250 A 120 120 0 0 1 570 250 L 570 520 Z" fill="${C.coffee}" fill-opacity="0.12" stroke="${C.coffee}" stroke-width="2"/>
    <circle cx="450" cy="240" r="60" fill="${C.forest}" stroke="${C.sage}" stroke-width="1.5"/>
    <text x="450" y="258" font-family="'Playfair Display', Georgia, serif" font-size="44" font-weight="bold" fill="${C.ivory}" text-anchor="middle">A</text>
    <text x="450" y="100" font-family="'Poppins', sans-serif" font-size="13" font-weight="600" letter-spacing="4" fill="${C.coffee}" text-anchor="middle">OUR SPACE &#8226; ARABISTA SURAT</text>
    <text x="450" y="420" font-family="'Playfair Display', Georgia, serif" font-size="36" font-weight="bold" fill="${C.ivory}" text-anchor="middle">${safeTitle}</text>
    <text x="450" y="465" font-family="'Poppins', sans-serif" font-size="15" fill="${C.ivory}" fill-opacity="0.75" text-anchor="middle">Sanctuary of Handcrafted Brews &amp; Kitchen</text>
    <line x1="380" y1="495" x2="520" y2="495" stroke="${C.coffee}" stroke-width="2"/>
  </svg>`;
};

const catalog = [
  {
    name: 'The Pour',
    slug: 'the-pour',
    subCategories: [
      { name: 'Crafted Warmth', slug: 'crafted-warmth' },
      { name: 'Crafted Chills', slug: 'crafted-chills' },
      { name: 'Manual Brew', slug: 'manual-brew' },
      { name: 'Brew / Tonic Series', slug: 'brew-tonic-series' },
      { name: 'Signature Latte', slug: 'signature-latte' },
      { name: 'Vietnamese Collection', slug: 'vietnamese-collection' },
      { name: 'Indulgent Mocha', slug: 'indulgent-mocha' },
      { name: 'Beyond Coffee', slug: 'beyond-coffee' },
      { name: 'Ice Tea', slug: 'ice-tea' },
      { name: 'Matcha Rituals', slug: 'matcha-rituals' },
      { name: 'Shakes', slug: 'shakes' },
      { name: 'Arabista Special', slug: 'arabista-special' },
    ],
  },
  {
    name: 'Salad',
    slug: 'salad',
    subCategories: [
      { name: 'Signature Bowls & Greens', slug: 'signature-bowls-greens' },
    ],
  },
  {
    name: 'Food',
    slug: 'food',
    subCategories: [
      { name: 'Fries', slug: 'fries' },
      { name: 'Nachos', slug: 'nachos' },
      { name: 'Croissant Sandwiches', slug: 'croissant-sandwiches' },
      { name: 'Breads & Bruschetta', slug: 'breads-bruschetta' },
      { name: 'Rice & Spice Bowls', slug: 'rice-spice-bowls' },
      { name: 'Artisan Pizzas', slug: 'artisan-pizzas' },
    ],
  },
  {
    name: 'Pastas',
    slug: 'pastas',
    subCategories: [
      { name: '01 Maggie, But Make It Italian', slug: '01-maggie-but-make-it-italian' },
      { name: '02 Veggie Main Character', slug: '02-veggie-main-character' },
      { name: '03 Arrabbiata Red Flag', slug: '03-arrabbiata-red-flag' },
      { name: '04 Garlic Girl Summer', slug: '04-garlic-girl-summer' },
      { name: '05 Chilly Got Personal', slug: '05-chilly-got-personal' },
      { name: '06 Alfredo\'s Comfort Zone', slug: '06-alfredo-s-comfort-zone' },
      { name: '07 Pink Sauce Problems', slug: '07-pink-sauce-problems' },
      { name: '08 Pesto Your Besto', slug: '08-pesto-your-besto' },
    ],
  },
  {
    name: 'Dessert',
    slug: 'dessert',
    subCategories: [
      { name: '01 Brownie', slug: '01-brownie' },
      { name: '02 Cheesecake', slug: '02-cheesecake' },
      { name: '03 Choco - Caramel Chemistry', slug: '03-choco-caramel-chemistry' },
      { name: '04 Little Miss Chocolate', slug: '04-little-miss-chocolate' },
      { name: '05 Tiramisu After Dark', slug: '05-tiramisu-after-dark' },
      { name: '06 Nutella In A Flaky Relationship', slug: '06-nutella-in-a-flaky-relationship' },
    ],
  },
];

const items = [
  { name: 'Signature Latte', slug: 'signature-latte', price: 270 },
  { name: 'Arabista Special', slug: 'arabista-special', price: 320 },
  { name: 'Biscoff Dream', slug: 'biscoff-dream', price: 300 },
  { name: 'Artisan Pizzas', slug: 'artisan-pizzas', price: 650 },
];

const banners = [
  {
    filename: 'monsoon-pour-over-series.webp',
    title: 'Monsoon Pour-Over Series',
    subtitle: 'Single-origin washed beans extracted slowly over ice & sparkling tonic water.',
    tag: 'Crafted Chills',
  },
  {
    filename: 'the-pasta-lab-sourdough.webp',
    title: 'The Pasta Lab & Sourdough',
    subtitle: '48-hour slow cold fermentation paired with freshly simmered San Marzano sauces.',
    tag: 'Kitchen Special',
  },
  {
    filename: 'cardamom-infused-brews.webp',
    title: 'Cardamom Infused Brews',
    subtitle: 'The Arabista Special pulled chilled with roasted green cardamom & sweet milk.',
    tag: 'Arabista Ritual',
  },
];

const gallery = [
  { filename: 'espresso-bar-and-drip-station.webp', title: 'Espresso Bar & Drip Station' },
  { filename: 'sanctuary-seating-nook.webp', title: 'Sanctuary Seating Nook' },
  { filename: 'sourdough-artisan-pizza-oven.webp', title: 'Sourdough Artisan Oven' },
  { filename: 'manual-brew-pour-over-corner.webp', title: 'Manual Brew Corner' },
  { filename: 'courtyard-alfresco-ambience.webp', title: 'Courtyard Ambience' },
  { filename: 'italian-pasta-lab-counter.webp', title: 'Pasta Lab Kitchen Counter' },
];

async function generateAll() {
  const baseDir = path.resolve(__dirname, '../seed-images');
  console.log('\nGenerating all café image assets in pure .webp format...\n');

  // 1. Categories
  const catDir = path.join(baseDir, 'categories');
  ensureDir(catDir);
  let cIdx = 1;
  for (const cat of catalog) {
    const svg = createCategorySvg(cat.name, cIdx++);
    const outPath = path.join(catDir, `${cat.slug}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
    console.log(`[Category .webp] ${cat.slug}.webp`);
  }

  // 2. Subcategories
  const subDir = path.join(baseDir, 'subcategories');
  ensureDir(subDir);
  let sIdx = 1;
  for (const cat of catalog) {
    for (const sub of cat.subCategories) {
      const svg = createSubCategorySvg(sub.name, cat.name, sIdx++);
      const outPath = path.join(subDir, `${sub.slug}.webp`);
      await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
      console.log(`[Subcategory .webp] ${sub.slug}.webp`);
    }
  }

  // 3. Menu Items
  const itemDir = path.join(baseDir, 'items');
  ensureDir(itemDir);
  let iIdx = 1;
  for (const item of items) {
    const svg = createItemSvg(item.name, item.price, iIdx++);
    const outPath = path.join(itemDir, `${item.slug}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
    console.log(`[Menu Item .webp] ${item.slug}.webp`);
  }

  // 4. Banners
  const bannerDir = path.join(baseDir, 'banners');
  ensureDir(bannerDir);
  for (const b of banners) {
    const svg = createBannerSvg(b.title, b.subtitle, b.tag);
    const outPath = path.join(bannerDir, b.filename);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
    console.log(`[Banner .webp] ${b.filename}`);
  }

  // 5. Gallery
  const galleryDir = path.join(baseDir, 'gallery');
  ensureDir(galleryDir);
  let gIdx = 1;
  for (const g of gallery) {
    const svg = createGallerySvg(g.title, gIdx++);
    const outPath = path.join(galleryDir, g.filename);
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
    console.log(`[Gallery .webp] ${g.filename}`);
  }

  console.log('\nSuccess: All .webp images generated in server/seed-images/\n');
}

generateAll().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
