const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const prisma = require('../src/config/prisma');
const { uploadImage } = require('../src/services/storageService');
const slugify = require('../src/utils/slugify');

const SUPPORTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const getFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => SUPPORTED_EXTS.includes(path.extname(file).toLowerCase()));
};

const readFileAsUploadable = (filePath) => {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  return {
    buffer,
    originalname: filename,
    mimetype: MIME_MAP[ext] || 'application/octet-stream',
  };
};

async function main() {
  const force = process.argv.includes('--force');
  const baseDir = path.resolve(__dirname, '../seed-images');

  console.log('\n==================================================');
  console.log('           ARABISTA BULK IMAGE UPLOAD');
  console.log(`Mode: ${force ? 'Force Re-upload' : 'Safe (Skip Existing)'}`);
  console.log('==================================================\n');

  const summary = {
    categories: { uploaded: 0, skipped: 0, notMatched: [] },
    subcategories: { uploaded: 0, skipped: 0, notMatched: [] },
    items: { uploaded: 0, skipped: 0, notMatched: [] },
    banners: { uploaded: 0, skipped: 0, notMatched: [] },
    gallery: { uploaded: 0, skipped: 0, notMatched: [] },
  };

  try {
    // 1. Process Categories
    const categoryFiles = getFiles(path.join(baseDir, 'categories'));
    if (categoryFiles.length > 0) {
      console.log(`Scanning ${categoryFiles.length} category images...`);
      const allCategories = await prisma.category.findMany();

      for (const file of categoryFiles) {
        const ext = path.extname(file);
        const fileSlug = path.basename(file, ext).toLowerCase();
        const matchedCat = allCategories.find(
          (c) => (c.slug && c.slug.toLowerCase() === fileSlug) || slugify(c.name) === fileSlug
        );

        if (!matchedCat) {
          summary.categories.notMatched.push(file);
          continue;
        }

        if (matchedCat.imageUrl && !force) {
          summary.categories.skipped++;
          continue;
        }

        const fileObj = readFileAsUploadable(path.join(baseDir, 'categories', file));
        const { url } = await uploadImage(fileObj, 'categories');
        await prisma.category.update({
          where: { id: matchedCat.id },
          data: { imageUrl: url },
        });
        summary.categories.uploaded++;
        console.log(`[Category] Updated '${matchedCat.name}' -> ${url}`);
      }
    }

    // 2. Process Subcategories
    const subcategoryFiles = getFiles(path.join(baseDir, 'subcategories'));
    if (subcategoryFiles.length > 0) {
      console.log(`Scanning ${subcategoryFiles.length} subcategory images...`);
      const allSubs = await prisma.subCategory.findMany();

      for (const file of subcategoryFiles) {
        const ext = path.extname(file);
        const fileSlug = path.basename(file, ext).toLowerCase();
        const matchedSub = allSubs.find(
          (s) => (s.slug && s.slug.toLowerCase() === fileSlug) || slugify(s.name) === fileSlug
        );

        if (!matchedSub) {
          summary.subcategories.notMatched.push(file);
          continue;
        }

        if (matchedSub.imageUrl && !force) {
          summary.subcategories.skipped++;
          continue;
        }

        const fileObj = readFileAsUploadable(path.join(baseDir, 'subcategories', file));
        const { url } = await uploadImage(fileObj, 'subcategories');
        await prisma.subCategory.update({
          where: { id: matchedSub.id },
          data: { imageUrl: url },
        });
        summary.subcategories.uploaded++;
        console.log(`[Subcategory] Updated '${matchedSub.name}' -> ${url}`);
      }
    }

    // 3. Process Menu Items
    const itemFiles = getFiles(path.join(baseDir, 'items'));
    if (itemFiles.length > 0) {
      console.log(`Scanning ${itemFiles.length} menu item images...`);
      const allItems = await prisma.menuItem.findMany();

      for (const file of itemFiles) {
        const ext = path.extname(file);
        const fileSlug = path.basename(file, ext).toLowerCase();
        const matchedItem = allItems.find(
          (i) => slugify(i.name) === fileSlug || i.id === fileSlug
        );

        if (!matchedItem) {
          summary.items.notMatched.push(file);
          continue;
        }

        if (matchedItem.imageUrl && !force) {
          summary.items.skipped++;
          continue;
        }

        const fileObj = readFileAsUploadable(path.join(baseDir, 'items', file));
        const { url } = await uploadImage(fileObj, 'items');
        await prisma.menuItem.update({
          where: { id: matchedItem.id },
          data: { imageUrl: url },
        });
        summary.items.uploaded++;
        console.log(`[Item] Updated '${matchedItem.name}' -> ${url}`);
      }
    }

    // 4. Process Banners
    const bannerFiles = getFiles(path.join(baseDir, 'banners'));
    if (bannerFiles.length > 0) {
      console.log(`Scanning ${bannerFiles.length} banner images...`);
      for (const file of bannerFiles) {
        const ext = path.extname(file);
        const title = path.basename(file, ext).replace(/[-_]/g, ' ');
        const existing = await prisma.banner.findFirst({
          where: { title: { equals: title, mode: 'insensitive' } },
        });

        if (existing && !force) {
          summary.banners.skipped++;
          continue;
        }

        const fileObj = readFileAsUploadable(path.join(baseDir, 'banners', file));
        const { url } = await uploadImage(fileObj, 'banners');

        if (existing && force) {
          await prisma.banner.update({
            where: { id: existing.id },
            data: { imageUrl: url },
          });
        } else {
          await prisma.banner.create({
            data: {
              title,
              subtitle: 'Artisanal Feature',
              imageUrl: url,
              isActive: true,
              sortOrder: 0,
            },
          });
        }
        summary.banners.uploaded++;
        console.log(`[Banner] Registered '${title}' -> ${url}`);
      }
    }

    // 5. Process Gallery
    const galleryFiles = getFiles(path.join(baseDir, 'gallery'));
    if (galleryFiles.length > 0) {
      console.log(`Scanning ${galleryFiles.length} gallery images...`);
      for (const file of galleryFiles) {
        const ext = path.extname(file);
        const title = path.basename(file, ext).replace(/[-_]/g, ' ');
        const existing = await prisma.galleryImage.findFirst({
          where: { title: { equals: title, mode: 'insensitive' } },
        });

        if (existing && !force) {
          summary.gallery.skipped++;
          continue;
        }

        const fileObj = readFileAsUploadable(path.join(baseDir, 'gallery', file));
        const { url } = await uploadImage(fileObj, 'gallery');

        if (existing && force) {
          await prisma.galleryImage.update({
            where: { id: existing.id },
            data: { imageUrl: url },
          });
        } else {
          await prisma.galleryImage.create({
            data: {
              title,
              imageUrl: url,
              isActive: true,
              sortOrder: 0,
            },
          });
        }
        summary.gallery.uploaded++;
        console.log(`[Gallery] Registered '${title}' -> ${url}`);
      }
    }

    console.log('\n==================================================');
    console.log('               UPLOAD SUMMARY REPORT');
    console.log('==================================================');
    console.log(
      `Categories:    Uploaded: ${summary.categories.uploaded} | Skipped: ${summary.categories.skipped} | Unmatched: ${summary.categories.notMatched.length}`
    );
    console.log(
      `Subcategories: Uploaded: ${summary.subcategories.uploaded} | Skipped: ${summary.subcategories.skipped} | Unmatched: ${summary.subcategories.notMatched.length}`
    );
    console.log(
      `Menu Items:    Uploaded: ${summary.items.uploaded} | Skipped: ${summary.items.skipped} | Unmatched: ${summary.items.notMatched.length}`
    );
    console.log(
      `Banners:       Uploaded: ${summary.banners.uploaded} | Skipped: ${summary.banners.skipped} | Unmatched: ${summary.banners.notMatched.length}`
    );
    console.log(
      `Gallery:       Uploaded: ${summary.gallery.uploaded} | Skipped: ${summary.gallery.skipped} | Unmatched: ${summary.gallery.notMatched.length}`
    );
    console.log('==================================================');

    const totalUnmatched =
      summary.categories.notMatched.length +
      summary.subcategories.notMatched.length +
      summary.items.notMatched.length;

    if (totalUnmatched > 0) {
      console.log('\nUnmatched Files (No matching slug in DB):');
      if (summary.categories.notMatched.length > 0) {
        console.log('  Categories:', summary.categories.notMatched.join(', '));
      }
      if (summary.subcategories.notMatched.length > 0) {
        console.log('  Subcategories:', summary.subcategories.notMatched.join(', '));
      }
      if (summary.items.notMatched.length > 0) {
        console.log('  Items:', summary.items.notMatched.join(', '));
      }
    }
    console.log('\nBulk image process completed.\n');
  } catch (err) {
    console.error('Bulk image upload encountered an error:', err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
