import Elysia from "elysia";
import jwt from "@elysiajs/jwt";


export const jwtPlugin = new Elysia({ name : "JWT" })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_TOKEN!,
        exp: "180d"
    }))


export const verifyJWT = new Elysia()
    .use(jwtPlugin)
    .derive({ as: 'scoped' }, async ({ jwt, headers, set }) => { 
        
        const token = headers["authorization"]?.split(" ")[1];
        if (!token) {
            set.status = "Unauthorized";
            return {
                success: false,
                message: "No token provided",
            };
        }

        const decoded = await jwt.verify(token);
        if (!decoded) {
            set.status = "Unauthorized";
            return {
                success: false,
                message: "Invalid token",
            };
        }

        const { userId, role } = decoded as { userId: string; role: 'admin' | 'parent' | 'teacher' | 'invalid' };

        set.status = "Accepted";
        return {
            userId,
            role
        };
    })

const verifyAdmin = new Elysia()
    .use(verifyJWT)
    .onBeforeHandle(({ role, set }) => {
        if (role !== "admin") {
            set.status = "Forbidden";
            return {
                success: false,
                message: "Admin access required",
            };
        }
    });

export const main = new Elysia()
    .use(verifyJWT)
    // ✅ Hi is now available
    .get('/parent', ({ userId, role }) => userId)
