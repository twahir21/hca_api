import { redis } from "bun";
import { cacheTime } from "../const/cache.const";

//-> redis-cli KEYS '*' used to look all available keys.
export const cacheSave = async ({ name, value, expiresIn }: { name: string; value: Object; expiresIn?: number }) => {
  await redis.set(name, JSON.stringify(value), "EX", expiresIn ?? cacheTime.ONE_WEEK); // 7 days expiration
};

export const cacheGet = async (name: string) => {
  const value = await redis.get(name);
  if (!value) return null;
  return JSON.parse(value);
};

export const cacheDelete = async (name: string) => {
  await redis.del(name);
};

export const cacheExists = async (name: string) => {
  const exists = await redis.exists(name);

  if (exists) return true;
  return false;
}