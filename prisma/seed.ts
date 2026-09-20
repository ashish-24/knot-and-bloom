import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Knot & Bloom database with Crochet & Resin products...');

  // 1. Initial Admin setup
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminKnotBloom#2026';
  const passwordHash = await bcrypt.hash(initialPassword, 10);

  await prisma.admin.upsert({
    where: { email: 'admin@knotandbloom.com' },
    update: { passwordHash },
    create: {
      email: 'admin@knotandbloom.com',
      name: 'Knot & Bloom Founder',
      passwordHash,
    },
  });

  // 2. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Knot & Bloom',
      tagline: 'Romi.ka handcraft With love',
      contactPhone: '+91 98765 43210',
      whatsappNumber: '919876543210',
      upiId: 'knotandbloom@upi',
      upiDisplayName: 'Knot & Bloom Handmade',
      deliveryFee: 49.0,
      freeDeliveryOver: 999.0,
    },
  });

  // 3. Categories (Including Crochet Collection!)
  const categoriesData = [
    {
      name: 'Handmade Crochet Collection',
      slug: 'crochet-collection',
      description: 'Soft cotton yarn scrunchies, amigurumi heart keychains, crochet bows, and handcrafted dresses.',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Keychains & Charms',
      slug: 'keychains-charms',
      description: 'Personalized resin, acrylic, and handcrafted keyrings built with love.',
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Handmade Home Decor',
      slug: 'home-decor',
      description: 'Artisanal decorative plaques, botanical desk pieces, and accent craft.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Curated Gift Hampers',
      slug: 'gift-hampers',
      description: 'Thoughtfully wrapped gift bundles for birthdays, couples, and celebrations.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = created.id;
  }

  // 4. Products Data with Crochet items inspired by uploaded photos
  const productsSeed = [
    {
      name: 'Handmade Crochet Scrunchie',
      slug: 'handmade-crochet-scrunchie',
      shortDescription: 'Ultra-soft cotton yarn ruffly scrunchie with gentle elastic hold for hair or wrist.',
      description: 'Handcrafted with 100% premium milk cotton yarn. Features a plush textured ruffle design that is soft on hair, prevents breakage, and provides a stylish bohemian accent for wrists.',
      price: 149,
      originalPrice: 199,
      discount: 25,
      sku: 'KB-CR-001',
      stock: 35,
      lowStockThreshold: 5,
      categorySlug: 'crochet-collection',
      material: 'Milk Cotton Yarn & Elastic Core',
      dimensions: '12cm diameter',
      color: 'Royal Purple / Lavender',
      tags: 'crochet, scrunchie, hair accessory, purple, handmade, bestseller',
      featured: true,
      bestseller: true,
      trending: true,
      giftPick: true,
      newArrival: true,
      customizable: true,
      salesCount: 142,
      rating: 5.0,
      reviewCount: 48,
      thumbnail: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
      ],
      variants: [
        { name: 'Royal Velvet Purple', colorHex: '#7E22CE', imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop', priceAdjust: 0 },
        { name: 'Blush Pink & White', colorHex: '#EC4899', imageUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop', priceAdjust: 0 },
      ],
      customizations: [
        { label: 'Color Variant Preference', type: 'select', placeholder: null, optionsJson: JSON.stringify(['Royal Velvet Purple', 'Blush Pink & White', 'Cream Cotton']), required: true, additionalFee: 0 },
      ],
    },
    {
      name: 'Handmade Crochet Heart Keychain',
      slug: 'handmade-crochet-heart-keychain',
      shortDescription: 'Plush 3D amigurumi heart keyring stuffed with organic cotton & stainless key loop.',
      description: 'Cheerful hand-stitched amigurumi heart keychain in vibrant sunshine colors. Lightweight, soft to hold, and durable.',
      price: 199,
      originalPrice: 249,
      discount: 20,
      sku: 'KB-CR-002',
      stock: 28,
      lowStockThreshold: 5,
      categorySlug: 'crochet-collection',
      material: 'Organic Cotton Yarn & Polyfill',
      dimensions: '6cm x 6cm',
      color: 'Sunshine Orange / Yellow',
      tags: 'heart, crochet, amigurumi, orange, keychain, gift',
      featured: true,
      bestseller: true,
      trending: true,
      giftPick: true,
      newArrival: true,
      customizable: true,
      salesCount: 115,
      rating: 4.9,
      reviewCount: 36,
      thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      ],
      variants: [
        { name: 'Sunshine Orange', colorHex: '#FF6B00', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop', priceAdjust: 0 },
        { name: 'Golden Yellow', colorHex: '#EAB308', imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=800&auto=format&fit=crop', priceAdjust: 0 },
      ],
      customizations: [
        { label: 'Heart Color Choice', type: 'select', placeholder: null, optionsJson: JSON.stringify(['Sunshine Orange', 'Golden Yellow', 'Coral Red']), required: true, additionalFee: 0 },
      ],
    },
    {
      name: 'Handcrafted Crochet Bow Set',
      slug: 'handcrafted-crochet-bow-set',
      shortDescription: 'Pair of textured ribbed crochet bow clips in mustard yellow & chestnut brown.',
      description: 'Elegant dual set of hand-woven bow clips. Perfect for styling hair, clipping onto tote bags, or decorating handmade gift boxes.',
      price: 179,
      originalPrice: 229,
      discount: 22,
      sku: 'KB-CR-003',
      stock: 22,
      lowStockThreshold: 4,
      categorySlug: 'crochet-collection',
      material: 'Textured Cotton Yarn & Alligator Clip',
      dimensions: '7cm width per bow',
      color: 'Mustard & Chestnut',
      tags: 'bow, crochet, hair clip, mustard, brown, set',
      featured: true,
      bestseller: false,
      trending: true,
      giftPick: true,
      newArrival: true,
      customizable: false,
      salesCount: 68,
      rating: 4.8,
      reviewCount: 22,
      thumbnail: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Crochet Rainbow Butterfly Poshak',
      slug: 'crochet-rainbow-butterfly-poshak',
      shortDescription: 'Multi-tiered vibrant crochet butterfly dress for deity idols or wall hanging decor.',
      description: 'Intricately crocheted butterfly wing design using scalloped rainbow cotton yarn (Red, Orange, Yellow, Green, White). Radiates cheerful handmade warmth.',
      price: 399,
      originalPrice: 499,
      discount: 20,
      sku: 'KB-CR-004',
      stock: 12,
      lowStockThreshold: 3,
      categorySlug: 'crochet-collection',
      material: 'Multicolor Soft Cotton Thread',
      dimensions: '22cm wingspan',
      color: 'Rainbow Scallop',
      tags: 'butterfly, poshak, crochet, rainbow, decor',
      featured: true,
      bestseller: false,
      trending: true,
      giftPick: true,
      newArrival: true,
      customizable: true,
      salesCount: 45,
      rating: 5.0,
      reviewCount: 16,
      thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      ],
    },
    {
      name: 'Personalized Couple Keychain',
      slug: 'personalized-couple-keychain',
      shortDescription: 'Dual engraved wooden & resin heart keyring set with custom initials & anniversary date.',
      description: 'Celebrate your special connection with our signature handcrafted couple keychain set.',
      price: 299,
      originalPrice: 399,
      discount: 25,
      sku: 'KB-KC-001',
      stock: 24,
      lowStockThreshold: 5,
      categorySlug: 'keychains-charms',
      material: 'Teak Wood & Botanical Resin',
      dimensions: '5cm x 4cm per half',
      color: 'Warm Amber & Natural Wood',
      tags: 'couple, keychains, personalized, heart, anniversary',
      featured: true,
      bestseller: true,
      trending: false,
      giftPick: true,
      newArrival: false,
      customizable: true,
      salesCount: 108,
      rating: 4.9,
      reviewCount: 42,
      thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
      ],
    },
  ];

  for (const item of productsSeed) {
    const { categorySlug, images, customizations, variants, ...prodData } = item;
    const categoryId = categories[categorySlug];

    const existing = await prisma.product.findUnique({ where: { slug: prodData.slug } });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          ...prodData,
          categoryId,
          images: {
            create: images.map((url, idx) => ({ url, sortOrder: idx })),
          },
          variants: variants
            ? {
                create: variants.map((v) => ({
                  name: v.name,
                  colorHex: v.colorHex,
                  imageUrl: v.imageUrl,
                  priceAdjust: v.priceAdjust || 0,
                })),
              }
            : undefined,
          customizationOpts: customizations
            ? {
                create: customizations.map((opt) => ({
                  label: opt.label,
                  type: opt.type,
                  placeholder: opt.placeholder || null,
                  optionsJson: opt.optionsJson || null,
                  required: opt.required,
                  additionalFee: opt.additionalFee || 0,
                })),
              }
            : undefined,
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId: product.id,
          change: product.stock,
          reason: 'INITIAL_SEED',
        },
      });
      console.log(`Created seeded product: ${product.name}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
