import Elysia from "elysia";
import jwt from "@elysiajs/jwt";


export const customPlugin = new Elysia({ name : "Custom" })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_KEY!,
        exp: "7d"
    }))