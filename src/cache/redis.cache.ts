import { redis } from "bun";
import { cacheTime } from "../const/cache.const";

export const cacheSave = ({ name, value }: { name: string; value: Object }) => {
  redis.set(name, JSON.stringify(value), "EX", cacheTime.ONE_WEEK); // 7 days expiration
};

export const cacheGet = async (name: string) => {
  const value = await redis.get(name);
  if (!value) return null;
  return JSON.parse(value);
};

export const cacheDelete = (name: string) => {
  redis.del(name);
};

export const cacheExists = async (name: string) => {
  const exists = await redis.exists(name);

  if (exists) return true;
  return false;
}