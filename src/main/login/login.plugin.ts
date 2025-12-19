import Elysia from "elysia";
import { LoginValidators } from "./login.valid";
import xss from "xss";
import { loginController } from "./login.controller";
import { jwtPlugin } from "../../plugins/global.plugin";
import { getOTPData, isSessionExist, Return } from "../../func/otp.func";
import { redis } from "bun";
import { RateLimitLogin } from "../../security/ratelimit.sec";
import { db } from "../../connections/drizzle.conn";
import { rolesTable, schoolTable, userRolesTable, usersTable } from "../../schema/core.schema";
import { and, eq } from "drizzle-orm";
import { Roles } from "../../const/roles.const";

export const LoginPlugin = new Elysia({ name: "Login API" })
    .use(jwtPlugin)
    // rate-limit login attempts per account + IP.
    // SMS/email queue, provider failover, backoff.
    // Rate limit by IP, user, phone/email.
    // Monitoring, alerts (high OTP rates, failed logins), WAF for abusive traffic.
    // Penetration testing on invite flow and MFA.

    .use(RateLimitLogin)
    .post("/login", async ({ body, set, isRateLimited }) => {
        if(!isRateLimited){
            set.status = "Too Many Requests";
            return {
                success: false,
                message: "Too many requests, try after an hour"
            }
        }
        return await loginController.login({ body, set });
    }, {
        body: LoginValidators.login,
        beforeHandle({ body }) {
            body.username = xss(body.username).toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            body.password = xss(body.password).trim(),
            body.sessionId = xss(body.sessionId).trim()
        }
    })
    .post("/verify-OTP", async ({ body, set, jwt }): Promise<Return & {data: {authToken: string; rolesArray?: Roles[]; username?: string; defaultRole?: Roles}}> => {
        const verifyResult = await loginController.verifyOTP({ body, set });

        if (!verifyResult.success) return {
            success: false,
            message: verifyResult.message,
            data: { authToken: ""}
        }

        // issue a jwt.
        const userId = await getOTPData({ sessionId: body.sessionId });

        // get username
        const [username] = await db.select({
            name: usersTable.username
        }).from(usersTable).where(eq(usersTable.id, userId));

        // get roles in form of array
        const rolesWithDefault = await db
            .select({ role: rolesTable.role, isDefault: userRolesTable.isDefaultRole })
            .from(rolesTable)
            .leftJoin(
                userRolesTable,
                eq(rolesTable.id, userRolesTable.roleId),
            )
            .where(
                eq(userRolesTable.userId, userId),
            )

        // rolesArray = all role names
        const rolesArray = rolesWithDefault.map(r => r.role);

        // defaultRole = the role name where isDefault is true
        const defaultRole = rolesWithDefault.find(r => r.isDefault)?.role ?? undefined;

        const authToken = await jwt.sign ({ userId, rolesArray });
        
        return {
            success: true,
            message: "You have successfully logged in",
            data: {
                authToken,
                rolesArray,
                username: username.name,
                defaultRole
            }
        }
    }, {
        body: LoginValidators.verifyOTP,
        beforeHandle({ body, set }) {
            body.sessionId = xss(body.sessionId).trim(),
            body.otpInput = xss(body.otpInput).trim()
            if(!body.sessionId || !body.otpInput) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Session ID or a valid OTP is required",
                }
            }
        }

    })
    .post("/resend-OTP", async ({ body, set }) => {
        return await loginController.resendOTP({ body, set });
    }, {
        body: LoginValidators.resendOTP,
        beforeHandle({ body, set }) {
            body.sessionId = xss(body.sessionId).trim()
            if(!body.sessionId) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Session ID is required",
                }
            }
        }
    })
    // Assuming you have a Redis client and the token is in the headers
    .post('/logout', async ({ headers, set, jwt }) => {
        const token = headers['authorization']?.split(' ')[1];
        if (!token) {
            set.status = 401;
            return { message: 'No token provided' };
        }

        // 1. Decode token to get jti (use the same library you signed with)
        const payload = await jwt.verify(token); 
        if (!payload) return;
        const jti = payload.jti;

        // 2. Blacklist the token's unique ID (jti)
        // EX: Set the jti as a key in Redis with an expiry equal to the token's remaining time
        const timeRemaining = payload.exp ?? 0 - Math.floor(Date.now() / 1000); 
        await redis.set(`blacklist:${jti}`, '1', 'EX', timeRemaining);

        return { message: 'Logged out successfully' };
    });