const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL || 'libsql://knot-and-bloom-ashi24.aws-ap-south-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkzNjgwNzAsImlkIjoiMDFhMDllYTItMTkwMS03OTU0LTg1ZTUtZThjYThlYmFmZjgxIiwia2lkIjoiNmlGQk5pX2tOZVhtZE5WTU5RU1gza1FPMHlWVGZRMVowRjlnSE92RmNVdyIsInJpZCI6IjI5OTE1NTNhLWQ5Y2ItNDUzNS1hMGI4LTk1NjkwN2I3MzM0NiJ9.EmtFxPjF_iYStWhrVcjA6mMwzxFvPe6EO_7TFujuP1D_qVrBbh5N8vBRImUmRRYg9BIMg3KkLnolxN_UkNJdAg';

  const db = createClient({ url, authToken });

  console.log('Adding column gmailSenderEmail if missing...');
  try {
    await db.execute(`ALTER TABLE StoreSettings ADD COLUMN gmailSenderEmail TEXT DEFAULT 'ashishkanhaiya7765@gmail.com';`);
  } catch (e) {
    // Column may already exist
  }

  console.log('Updating Turso StoreSettings...');
  await db.execute(`
    UPDATE StoreSettings
    SET storeName = 'Romi & Knot',
        upiDisplayName = 'Romi & Knot Handmade',
        upiId = 'romiandknot@upi',
        supportEmail = 'hello@romiandknot.com',
        gmailSenderEmail = 'ashishkanhaiya7765@gmail.com'
    WHERE id = 'default';
  `);

  console.log('✅ Successfully updated live Turso Cloud database StoreSettings table!');
}

main().catch((err) => {
  console.error('❌ Failed to update Turso:', err);
  process.exit(1);
});
