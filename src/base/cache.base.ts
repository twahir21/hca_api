import { redisClient } from "../connections/redis.conn";
import { cacheTime } from "../const/cache.const";

// 1. Read Cached data
export const readCache = async (key: string): Promise<{
     success: boolean, 
     data: JSON | null
    }> => {
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
        return {
            success: true,
            data: JSON.parse(cachedData)
        }
    }

    return {
        success: false,
        data: null
    }
}

// 2. Create cache
export const createCache = async (cacheKey: string, freshData: object) => {
    return await redisClient.setEx(cacheKey, cacheTime.ONE_DAY, JSON.stringify(freshData)); // 24h cache
}
// 3. Delete cache
export const deleteCache = async (key: string) => {
    return await redisClient.del(key);
}