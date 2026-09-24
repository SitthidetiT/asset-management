require('dotenv').config();
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT * FROM categories LIMIT 5`.then(console.log).then(()=>sql`SELECT * FROM departments LIMIT 5`).then(console.log).finally(() => process.exit());
