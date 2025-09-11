import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/drizzle', // Where migrations will be generated
  schema: ['./src/db/*.ts'], // Your schema files
  dialect: 'postgresql',
  dbCredentials: {
    url:
        process.env.NODE_ENV = process.env.POSTGRES_URL_LOCAL!,
  },
});