import { Elysia } from 'elysia'
import { redis } from 'bun';
import { cacheCounts, cacheTime } from '../const/cache.const';

export const RateLimitMail = new Elysia({ name: "rate-limit-mail"})
    .derive({ as: 'scoped'}, async ({ server, request, set }) => {
        const reqKey = `ip:${request.headers.get("x-forwarded-for") || server?.requestIP(request)}`;

        const key = `ratelimitmail:${reqKey}`

        const attempts = await redis.incr(key);

        if (attempts === 1) {
            // Set expiration only on first attempt
            await redis.expire(key, cacheTime.ONE_DAY)
        }
        if (attempts > cacheCounts.TEN) {
            set.status = 429;
            set.headers['Retry-After'] = cacheTime.ONE_DAY.toString()
            return { isRateLimited: false }
        }
        return { isRateLimited: true }
    })


export const RateLimitLogin = new Elysia({ name: "rate-limit-login"})
    .derive({ as: 'scoped'}, async ({ server, request, set }) => {
        const reqKey = `ip:${request.headers.get("x-forwarded-for") || server?.requestIP(request)}`;

        const key = `ratelimitlogin:${reqKey}`

        const attempts = await redis.incr(key);

        if (attempts === 1) {
            // Set expiration only on first attempt
            await redis.expire(key, cacheTime.ONE_HOUR)
        }
        if (attempts > cacheCounts.FIFTEEN) {
            set.status = 429;
            set.headers['Retry-After'] = cacheTime.ONE_HOUR.toString()
            return { isRateLimited: false }
        }
        return { isRateLimited: true }
    })

export const RateLimitActivation = new Elysia({ name: "rate-limit-activation"})
    .derive({ as: 'scoped'}, async ({ server, request, set }) => {
        const reqKey = `ip:${request.headers.get("x-forwarded-for") || server?.requestIP(request)}`;

        const key = `ratelimitactivation:${reqKey}`

        const attempts = await redis.incr(key);

        if (attempts === 1) {
            // Set expiration only on first attempt
            await redis.expire(key, cacheTime.ONE_HOUR)
        }
        if (attempts > cacheCounts.FIVE) {
            set.status = 429;
            set.headers['Retry-After'] = cacheTime.ONE_HOUR.toString()
            return { isRateLimited: false }
        }
        return { isRateLimited: true }
    })