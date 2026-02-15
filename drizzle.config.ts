import { defineConfig } from 'drizzle-kit';
// Normalize dialect for Drizzle
function normalizeDrizzleDialect(env: string | undefined): 'mysql' | 'postgresql' | 'sqlite' {
  if (!env) return 'mysql';
  if (env.startsWith('mysql')) return 'mysql';
  if (env.startsWith('pg') || env.startsWith('postg')) return 'postgresql';
  if (env.startsWith('sqlite')) return 'sqlite';
  return 'mysql';
}

const drizzleDialect = normalizeDrizzleDialect(process.env.DB_DIALECT);

export default defineConfig({
  out: './src/db/drizzle',
  schema: [
    './src/db/schema/*.ts',
  ],
  dialect: 'mysql',
  //dialect: drizzleDialect,
  dbCredentials: {
    url: process.env.DATABASE_URL!||"mysql://dxl:lJj4xVUo(znpLh]j@onetv.ng:3306/dxl",
  },
});
