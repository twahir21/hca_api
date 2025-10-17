import { RedisClient } from "bun";

// for custom redis
const client = new RedisClient("redis://username:password@localhost:6379");
// Using the default client (reads connection info from environment)
// process.env.REDIS_URL is used by default
// await redis.set("hello", "world"); these uses the default client redis://localhost:6379
// const result = await redis.get("hello");
// redis auto connect for the first call and remain open unless call .close()
