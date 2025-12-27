import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { dbLink } from './src/const/links.const';

export default defineConfig({
  out: './src/drizzle', // Where migrations will be generated
  schema: ['./src/schema/*.ts'], // Your schema files
  dialect: 'postgresql',
  dbCredentials: {
    url:
     dbLink,
  },
});

