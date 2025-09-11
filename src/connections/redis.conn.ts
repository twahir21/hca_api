import { createClient } from "redis";

// 1. Define Redis Client connection url
export const redisClient = createClient({ 
  url: 'redis://localhost:6379',
});

// 2. Connect to Redis
redisClient.connect().catch(console.error);
