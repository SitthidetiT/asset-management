import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@localhost:5432/postgres');
sql`CREATE DATABASE assetdb`
  .then(() => {
    console.log('Database created');
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });
