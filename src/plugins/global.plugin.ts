import Elysia from "elysia";
import jwt from "@elysiajs/jwt";


export const jwtPlugin = new Elysia({ name : "JWT" })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_TOKEN!,
        exp: "7d"
    }))