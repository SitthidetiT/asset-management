require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT * FROM locations LIMIT 5`.then(console.log).finally(() => process.exit());
