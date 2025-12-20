import Elysia from "elysia";
import jwt from "@elysiajs/jwt";
import { Roles } from "../const/roles.const";


export const jwtPlugin = new Elysia({ name : "JWT" })
    .use(jwt({
        name: 'jwt',
        secret: process.env.JWT_AUTH_TOKEN!,
        exp: "180d"
    }))

export const linkToken = new Elysia()
    .use(jwt({
        name: 'token',
        secret: process.env.JWT_SESSION_TOKEN!,
        exp: "60m"
    }))


export const verifyJWT = new Elysia()
    .use(jwtPlugin)
    .derive({ as: 'scoped' }, async ({ jwt, headers, set }) => { 
        const token = headers["authorization"]?.split(" ")[1];

        const decoded = await jwt.verify(token);

        if (!decoded) {
            set.status = 'Unauthorized';
            return {
                success: false,
                message: "Invalid or expired token"
            }
        }


        const { userId, rolesArray, schoolId, selectedRole } = decoded as { userId: string; rolesArray: Roles[]; schoolId: string; selectedRole: Roles };

        const roleSet = new Set<Roles>(rolesArray);

        set.status = "Accepted";
        return {
            userId,
            roleSet,
            schoolId,
            selectedRole
        };
    })


export const main = new Elysia()
    .use(verifyJWT)
    // ✅ Hi is now available
    .get('/parent', ({ userId, roleSet, schoolId, selectedRole }) => { 
        if (!roleSet) return "roleSet is undefined!"
        console.log(roleSet)
        return { userId, roleSet, schoolId, selectedRole } 
    })
    .get("/isAdmin", ({ set }) => {
        set.status = "OK"
        return {
            success: true,
            message: "Yes, this is school-admin"
        }
    }, {
        beforeHandle({ roleSet, userId, set }) {
            if (!userId) {
                set.status = "Unauthorized";
                return {
                    success: false,
                    message: "No or invalid token"
                }
            }
            
            if (!roleSet.has("school-admin")) {
                set.status = "Non-Authoritative Information";
                return {
                    success: false,
                    message: "this resource is only for admins"
                }
            }
        }
    })
    .guard({
        beforeHandle({ selectedRole, set }) {
            if(selectedRole !== "super-admin") {
                set.status = "Forbidden";
                return {
                    success: false,
                    message: "Only School Admins can use this resource."
                }
            }
        }
    })
    .get("/test-role", () => {
        return {
            success: true,
            message: "passed!"
        }
    })

