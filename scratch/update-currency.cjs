const { Client } = require("../../makhana-backend/node_modules/pg");

async function main() {
  const client = new Client("postgres://postgres:Arvind%402000@localhost:5432/makhana");
  await client.connect();

  console.log("Connected to PostgreSQL");

  // Find constraints on store_settings
  const res = await client.query(`
    SELECT conname, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'store_settings'
  `);
  console.log("Constraints:", res.rows);

  for (const row of res.rows) {
    if (row.def.includes("USD")) {
      console.log(`Dropping constraint: ${row.conname}`);
      await client.query(`ALTER TABLE store_settings DROP CONSTRAINT ${row.conname}`);
    }
  }

  // Add constraint allowing INR and USD
  console.log("Adding new constraint to allow INR and USD");
  await client.query(`ALTER TABLE store_settings ADD CONSTRAINT store_settings_currency_check CHECK (currency IN ('USD', 'INR'))`);

  // Update store_settings currency to INR
  console.log("Updating currency to INR");
  await client.query(`UPDATE store_settings SET currency = 'INR' WHERE id = 1`);

  const updated = await client.query(`SELECT * FROM store_settings WHERE id = 1`);
  console.log("Updated store_settings:", updated.rows[0]);

  await client.end();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
