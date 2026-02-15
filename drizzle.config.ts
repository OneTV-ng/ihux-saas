import { defineConfig } from 'drizzle-kit';
// Normalize dialect for Drizzle


export default defineConfig({
  out: './src/db/drizzle',
  schema: [
    './src/db/schema/*.ts',
  ],
  dialect: 'mysql',
  //dialect: drizzleDialect,
  dbCredentials: {
    url: process.env.DATABASE_URL!||"mysql://dxl:lJj4xVUo(znpLh]j@localhost:3306/dxl",
  },
});
