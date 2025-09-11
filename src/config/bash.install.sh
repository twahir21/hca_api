rm -rf node_modules bun.lock &&
bun add @elysiajs/cookie @elysiajs/jwt @elysiajs/cors date-fns dotenv drizzle-orm resend xss redis postgres decimal.js&&
bun add -D drizzle-kit depcheck
