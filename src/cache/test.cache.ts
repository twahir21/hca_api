// ? bun --env-file=../../.env ./test.cache.ts
import { redis } from "bun";

// Set a key
await redis.set("greeting", "Hello from Bun!");

// Get a key
const greeting = await redis.get("greeting");
console.log(greeting); // "Hello from Bun!"


// Check if a key exists
const exists = await redis.exists("greeting");
console.log(exists)

// Delete a key
await redis.del("greeting");