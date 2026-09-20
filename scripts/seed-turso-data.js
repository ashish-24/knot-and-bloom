const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function main() {
  const url = process.env.TURSO_DATABASE_URL || 'libsql://knot-and-bloom-ashi24.aws-ap-south-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkzNjgwNzAsImlkIjoiMDFhMDllYTItMTkwMS03OTU0LTg1ZTUtZThjYThlYmFmZjgxIiwia2lkIjoiNmlGQk5pX2tOZVhtZE5WTU5RU1gza1FPMHlWVGZRMVowRjlnSE92RmNVdyIsInJpZCI6IjI5OTE1NTNhLWQ5Y2ItNDUzNS1hMGI4LTk1NjkwN2I3MzM0NiJ9.EmtFxPjF_iYStWhrVcjA6mMwzxFvPe6EO_7TFujuP1D_qVrBbh5N8vBRImUmRRYg9BIMg3KkLnolxN_UkNJdAg';

  const db = createClient({ url, authToken });

  console.log('Seeding Turso Cloud DB with initial products & admin account...');

  // 1. Admin setup
  const passwordHash = await bcrypt.hash('AdminKnotBloom#2026', 10);
  await db.execute({
    sql: `INSERT OR REPLACE INTO Admin (id, email, passwordHash, name, updatedAt)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);`,
    args: ['admin-1', 'admin@knotandbloom.com', passwordHash, 'Knot & Bloom Founder'],
  });

  // 2. Categories
  const categories = [
    {
      id: 'cat-1',
      name: 'Handmade Crochet Collection',
      slug: 'crochet-collection',
      description: 'Soft cotton yarn scrunchies, amigurumi heart keychains, crochet bows, and handcrafted dresses.',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'cat-2',
      name: 'Keychains & Charms',
      slug: 'keychains-charms',
      description: 'Personalized resin, acrylic, and handcrafted keyrings built with love.',
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'cat-3',
      name: 'Handmade Home Decor',
      slug: 'home-decor',
      description: 'Artisanal decorative plaques, botanical desk pieces, and accent craft.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'cat-4',
      name: 'Curated Gift Hampers',
      slug: 'gift-hampers',
      description: 'Thoughtfully wrapped gift bundles for birthdays, couples, and celebrations.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
    },
  ];

  for (const cat of categories) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO Category (id, name, slug, description, image, updatedAt)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      args: [cat.id, cat.name, cat.slug, cat.description, cat.image],
    });
  }

  // 3. Products
  const products = [
    {
      id: 'prod-1',
      name: 'Handmade Crochet Scrunchie',
      slug: 'handmade-crochet-scrunchie',
      shortDescription: 'Ultra-soft cotton yarn ruffly scrunchie with gentle elastic hold for hair or wrist.',
      description: 'Handcrafted with 100% premium milk cotton yarn. Features a plush textured ruffle design that is soft on hair, prevents breakage, and provides a stylish bohemian accent for wrists.',
      price: 149,
      originalPrice: 199,
      discount: 25,
      sku: 'KB-CR-001',
      stock: 35,
      categoryId: 'cat-1',
      material: 'Milk Cotton Yarn & Elastic Core',
      dimensions: '12cm diameter',
      color: 'Royal Purple / Lavender',
      tags: 'crochet, scrunchie, hair accessory, purple, handmade, bestseller',
      featured: 1,
      bestseller: 1,
      trending: 1,
      giftPick: 1,
      newArrival: 1,
      thumbnail: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'prod-2',
      name: 'Handwoven Crochet Heart Keychain',
      slug: 'handwoven-crochet-heart-keychain',
      shortDescription: 'Padded plush yarn heart keyring with custom initial charm option.',
      description: 'Charming 3D hand-stitched amigurumi heart keychain. Crafted with soft pastel yarn and fitted with a gold alloy lobster clip.',
      price: 199,
      originalPrice: 249,
      discount: 20,
      sku: 'KB-CR-002',
      stock: 25,
      categoryId: 'cat-1',
      material: 'Cotton Yarn & Gold Alloy Hardware',
      dimensions: '7cm x 6cm',
      color: 'Blush Pink / Crimson Red',
      tags: 'crochet, keychain, heart, bag charm, cute gift',
      featured: 1,
      bestseller: 1,
      trending: 1,
      giftPick: 1,
      newArrival: 1,
      thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'prod-3',
      name: 'Custom Initial Resin Keychain with Gold Flakes',
      slug: 'custom-initial-resin-keychain-gold-flakes',
      shortDescription: 'Crystal clear crystal resin letter keyring with genuine gold leafing & dried floral accents.',
      description: 'Hand-poured crystal clear epoxy resin letter keyring infused with genuine gold leafing and real hand-pressed botanical petals.',
      price: 299,
      originalPrice: 399,
      discount: 25,
      sku: 'KB-KC-001',
      stock: 50,
      categoryId: 'cat-2',
      material: 'Epoxy Resin, Gold Leaf & Dried Botanicals',
      dimensions: '4.5cm x 4cm',
      color: 'Clear Gold & Rose Petal',
      tags: 'resin, keychain, initial, customized, gold flakes',
      featured: 1,
      bestseller: 1,
      trending: 1,
      giftPick: 1,
      newArrival: 1,
      thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'prod-4',
      name: 'Botanical Resin Coaster Set of 2',
      slug: 'botanical-resin-coaster-set-of-2',
      shortDescription: 'Hand-poured hexagonal table coasters infused with real pressed wildflowers.',
      description: 'Elevate your coffee desk with our heat-resistant botanical resin coasters. Hand-poured in small batches.',
      price: 599,
      originalPrice: 799,
      discount: 25,
      sku: 'KB-HD-001',
      stock: 12,
      categoryId: 'cat-3',
      material: 'Epoxy Resin & Real Wildflowers',
      dimensions: '10cm diameter',
      color: 'Clear Wildflower Gold',
      tags: 'resin, coaster, home decor, botanical, gift set',
      featured: 1,
      bestseller: 0,
      trending: 1,
      giftPick: 1,
      newArrival: 1,
      thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    },
  ];

  for (const p of products) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO Product (
              id, name, slug, shortDescription, description, price, originalPrice, discount, sku, stock,
              categoryId, material, dimensions, color, tags, featured, bestseller, trending, giftPick, newArrival,
              thumbnail, published, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP);`,
      args: [
        p.id, p.name, p.slug, p.shortDescription, p.description, p.price, p.originalPrice, p.discount, p.sku, p.stock,
        p.categoryId, p.material, p.dimensions, p.color, p.tags, p.featured, p.bestseller, p.trending, p.giftPick, p.newArrival,
        p.thumbnail,
      ],
    });
  }

  console.log('✅ Successfully seeded Turso Cloud DB with categories & products!');
}

main().catch((err) => {
  console.error('❌ Error seeding Turso Cloud DB:', err);
  process.exit(1);
});
