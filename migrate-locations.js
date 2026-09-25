require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  try {
    // Add new columns
    await sql`ALTER TABLE locations ADD COLUMN IF NOT EXISTS name_th VARCHAR(255) DEFAULT ''`;
    await sql`ALTER TABLE locations ADD COLUMN IF NOT EXISTS name_en VARCHAR(255) DEFAULT ''`;
    
    // Copy existing name to name_en and description to name_th
    await sql`UPDATE locations SET name_en = name WHERE name_en = ''`;
    // If description exists, use it for name_th, otherwise fallback to name
    await sql`UPDATE locations SET name_th = COALESCE(description, name) WHERE name_th = ''`;

    // Drop the old name column (Optional, but good for cleanliness)
    // Actually, to be safe, I'll drop it later, let's keep it for now but we won't use it.
    console.log("Migration completed!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
migrate();
