import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { dbLink } from "../const/links.const";


// 1. Load Database Driver
const queryClient = postgres(dbLink, {
    ssl: 'require'
});

// 3. Create connection via Drizzle.
export const db = drizzle(queryClient);