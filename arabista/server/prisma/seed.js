const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Arabista database seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@arabista.in';
  const adminRawPassword = process.env.ADMIN_PASSWORD || 'Arabista@2026';
  const hashedPassword = await bcrypt.hash(adminRawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: 'Arabista Admin',
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Arabista Admin',
    },
  });

  console.log(`Admin user ensured: ${admin.email}`);

  const categoryData = [
    {
      name: 'The Pour',
      sortOrder: 1,
      subCategories: [
        'Crafted Warmth',
        'Crafted Chills',
        'Manual Brew',
        'Brew / Tonic Series',
        'Signature Latte',
        'Vietnamese Collection',
        'Indulgent Mocha',
        'Beyond Coffee',
        'Ice Tea',
        'Matcha Rituals',
        'Shakes',
        'Arabista Special',
      ],
    },
    {
      name: 'Salad',
      sortOrder: 2,
      subCategories: [
        'Signature Bowls & Greens',
      ],
    },
    {
      name: 'Food',
      sortOrder: 3,
      subCategories: [
        'Fries',
        'Nachos',
        'Croissant Sandwiches',
        'Breads & Bruschetta',
        'Rice & Spice Bowls',
        'Artisan Pizzas',
      ],
    },
    {
      name: 'Pastas',
      sortOrder: 4,
      subCategories: [
        '01 Maggie, But Make It Italian',
        '02 Veggie Main Character',
        '03 Arrabbiata Red Flag',
        '04 Garlic Girl Summer',
        '05 Chilly Got Personal',
        '06 Alfredo\'s Comfort Zone',
        '07 Pink Sauce Problems',
        '08 Pesto Your Besto',
      ],
    },
    {
      name: 'Dessert',
      sortOrder: 5,
      subCategories: [
        '01 Brownie',
        '02 Cheesecake',
        '03 Choco - Caramel Chemistry',
        '04 Little Miss Chocolate',
        '05 Tiramisu After Dark',
        '06 Nutella In A Flaky Relationship',
      ],
    },
  ];

  const subCategoryMap = new Map();

  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  for (const cat of categoryData) {
    const categorySlug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        sortOrder: cat.sortOrder,
        slug: categorySlug,
      },
      create: {
        name: cat.name,
        slug: categorySlug,
        sortOrder: cat.sortOrder,
      },
    });

    console.log(`Category seeded: ${category.name} (${category.slug})`);

    for (let i = 0; i < cat.subCategories.length; i++) {
      const subName = cat.subCategories[i];
      const subSlug = slugify(subName);
      const subCategory = await prisma.subCategory.upsert({
        where: {
          name_categoryId: {
            name: subName,
            categoryId: category.id,
          },
        },
        update: {
          sortOrder: i + 1,
          slug: subSlug,
        },
        create: {
          name: subName,
          slug: subSlug,
          sortOrder: i + 1,
          categoryId: category.id,
        },
      });

      subCategoryMap.set(`${cat.name}:${subName}`, subCategory.id);
    }
  }

  const signatureItems = [
    {
      name: 'Signature Latte',
      category: 'The Pour',
      subCategory: 'Signature Latte',
      price: 270,
      description: 'Velvety espresso harmonized with steamed whole milk and our signature slow-reduced secret syrup.',
      imageUrl: null,
      isAvailable: true,
      isSignature: true,
      sortOrder: 1,
    },
    {
      name: 'Arabista Special',
      category: 'The Pour',
      subCategory: 'Arabista Special',
      price: 320,
      description: 'Our crowned house brew pulled over crushed ice with subtle roasted cardamom and sweetened condensed milk.',
      imageUrl: null,
      isAvailable: true,
      isSignature: true,
      sortOrder: 2,
    },
    {
      name: 'Biscoff Dream',
      category: 'The Pour',
      subCategory: 'Crafted Chills',
      price: 300,
      description: 'Creamy double ristretto blended with pure Lotus Biscoff spread, chilled milk, and speculoos crumble.',
      imageUrl: null,
      isAvailable: true,
      isSignature: true,
      sortOrder: 3,
    },
    {
      name: 'Artisan Pizzas',
      category: 'Food',
      subCategory: 'Artisan Pizzas',
      price: 650,
      description: '48-hour fermented sourdough crust, San Marzano pomodoro, fresh fior di latte, and torn basil.',
      imageUrl: null,
      isAvailable: true,
      isSignature: true,
      sortOrder: 4,
    },
  ];

  for (const item of signatureItems) {
    const subCategoryId = subCategoryMap.get(`${item.category}:${item.subCategory}`);

    if (subCategoryId) {
      const existing = await prisma.menuItem.findFirst({
        where: {
          name: item.name,
          subCategoryId,
        },
      });

      if (existing) {
        await prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            description: item.description,
            price: item.price,
            isSignature: item.isSignature,
            isAvailable: item.isAvailable,
            sortOrder: item.sortOrder,
          },
        });
      } else {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
            isAvailable: item.isAvailable,
            isSignature: item.isSignature,
            sortOrder: item.sortOrder,
            subCategoryId,
          },
        });
      }
      console.log(`Signature item seeded: ${item.name} (₹${item.price})`);
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
