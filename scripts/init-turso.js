const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL || 'libsql://knot-and-bloom-ashi24.aws-ap-south-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkzNjgwNzAsImlkIjoiMDFhMDllYTItMTkwMS03OTU0LTg1ZTUtZThjYThlYmFmZjgxIiwia2lkIjoiNmlGQk5pX2tOZVhtZE5WTU5RU1gza1FPMHlWVGZRMVowRjlnSE92RmNVdyIsInJpZCI6IjI5OTE1NTNhLWQ5Y2ItNDUzNS1hMGI4LTk1NjkwN2I3MzM0NiJ9.EmtFxPjF_iYStWhrVcjA6mMwzxFvPe6EO_7TFujuP1D_qVrBbh5N8vBRImUmRRYg9BIMg3KkLnolxN_UkNJdAg';

  console.log(`Connecting to Turso Cloud DB at ${url}...`);
  const db = createClient({ url, authToken });

  const statements = [
    `CREATE TABLE IF NOT EXISTS Admin (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT 'Store Admin',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS AdminSession (
      id TEXT PRIMARY KEY,
      adminId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adminId) REFERENCES Admin(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS Customer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      passwordHash TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      otpCode TEXT,
      otpExpiresAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS CustomerSession (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      shortDescription TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      sku TEXT UNIQUE NOT NULL,
      stock INTEGER NOT NULL DEFAULT 10,
      lowStockThreshold INTEGER NOT NULL DEFAULT 3,
      categoryId TEXT NOT NULL,
      subcategory TEXT,
      material TEXT,
      dimensions TEXT,
      weight TEXT,
      color TEXT,
      tags TEXT,
      featured BOOLEAN NOT NULL DEFAULT 0,
      bestseller BOOLEAN NOT NULL DEFAULT 0,
      trending BOOLEAN NOT NULL DEFAULT 0,
      giftPick BOOLEAN NOT NULL DEFAULT 0,
      newArrival BOOLEAN NOT NULL DEFAULT 1,
      customizable BOOLEAN NOT NULL DEFAULT 0,
      salesCount INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 5.0,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      seoTitle TEXT,
      seoDescription TEXT,
      thumbnail TEXT NOT NULL,
      published BOOLEAN NOT NULL DEFAULT 1,
      deletedAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES Category(id)
    );`,

    `CREATE TABLE IF NOT EXISTS ProductImage (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      url TEXT NOT NULL,
      altText TEXT,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS ProductVariant (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      colorHex TEXT,
      imageUrl TEXT,
      priceAdjust REAL NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS Product3DAsset (
      id TEXT PRIMARY KEY,
      productId TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'glb',
      fileSize INTEGER,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS CustomizationOption (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      label TEXT NOT NULL,
      type TEXT NOT NULL,
      placeholder TEXT,
      optionsJson TEXT,
      additionalFee REAL NOT NULL DEFAULT 0,
      required BOOLEAN NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS Cart (
      id TEXT PRIMARY KEY,
      sessionId TEXT UNIQUE NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS CartItem (
      id TEXT PRIMARY KEY,
      cartId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      customizationDetails TEXT,
      customizationFee REAL NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );`,

    `CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE NOT NULL,
      customerId TEXT,
      customerName TEXT NOT NULL,
      customerMobile TEXT NOT NULL,
      customerEmail TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      landmark TEXT,
      subtotal REAL NOT NULL,
      deliveryFee REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending Payment',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE SET NULL
    );`,

    `CREATE TABLE IF NOT EXISTS OrderItem (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      customizationFee REAL NOT NULL DEFAULT 0,
      customizationDetails TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );`,

    `CREATE TABLE IF NOT EXISTS Payment (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      utrNumber TEXT NOT NULL,
      screenshotUrl TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PAYMENT_SUBMITTED',
      rejectionReason TEXT,
      verifiedAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS InventoryMovement (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS StoreSettings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      storeName TEXT NOT NULL DEFAULT 'Romi & Knot',
      tagline TEXT NOT NULL DEFAULT 'bespoke by nature',
      contactPhone TEXT NOT NULL DEFAULT '+91 98765 43210',
      whatsappNumber TEXT NOT NULL DEFAULT '919876543210',
      upiId TEXT NOT NULL DEFAULT 'romiandknot@upi',
      upiDisplayName TEXT NOT NULL DEFAULT 'Romi & Knot Handmade',
      upiQrUrl TEXT,
      deliveryFee REAL NOT NULL DEFAULT 49.0,
      freeDeliveryOver REAL NOT NULL DEFAULT 999.0,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS AuditLog (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'System',
      details TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS AIUsage (
      id TEXT PRIMARY KEY,
      userId TEXT,
      endpoint TEXT NOT NULL,
      tokens INTEGER NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS Review (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      customerId TEXT,
      authorName TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      title TEXT,
      comment TEXT NOT NULL,
      imageUrl TEXT,
      verified BOOLEAN NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE,
      FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE SET NULL
    );`
  ];

  for (const stmt of statements) {
    await db.execute(stmt);
  }

  // Insert default StoreSettings if missing
  await db.execute(`
    INSERT OR IGNORE INTO StoreSettings (id, storeName, tagline, contactPhone, whatsappNumber, upiId, upiDisplayName, deliveryFee, freeDeliveryOver, updatedAt)
    VALUES ('default', 'Romi & Knot', 'bespoke by nature', '+91 98765 43210', '919876543210', 'romiandknot@upi', 'Romi & Knot Handmade', 49.0, 999.0, CURRENT_TIMESTAMP);
  `);

  console.log('✅ Successfully created all 20 tables on Turso Cloud Database!');
}

main().catch((err) => {
  console.error('❌ Error initializing Turso Cloud DB:', err);
  process.exit(1);
});
