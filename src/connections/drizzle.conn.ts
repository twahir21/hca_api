import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 1. Load Database URL
const DB_connection = process.env.POSTGRES_URL_LOCAL!;

// 2. Load Database Driver
const queryClient = postgres(DB_connection);

// 3. Create connection via Drizzle.
export const db = drizzle(queryClient);