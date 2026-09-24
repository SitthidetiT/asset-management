require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT * FROM categories WHERE code = 'MEA'`.then(console.log).finally(() => process.exit());
