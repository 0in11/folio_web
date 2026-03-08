/**
 * List all tables in the public schema of the Supabase/Postgres database.
 * Usage: npx tsx scripts/list-tables.ts
 *
 * Requires DATABASE_URL in .env
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import pg from "pg";

async function listTables() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  try {
    await client.connect();

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("=== Tables in public schema ===\n");
    for (const row of result.rows) {
      console.log(`  ${row.table_name}`);
    }
    console.log(`\nTotal: ${result.rows.length} tables`);
  } catch (error) {
    console.error("Failed to query tables:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

listTables();
