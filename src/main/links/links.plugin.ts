import Elysia from "elysia";
import { linkValidations } from "./links.valid";
import xss from "xss";
import { linkToken } from "../../plugins/global.plugin";
import { links } from "../../const/links.const";
import { sendOTPSMS } from "../../func/nextsms.func";
import { randomBytes } from "crypto";
import { allowedRoles, Roles } from "../../const/roles.const";
import { db } from "../../connections/drizzle.conn";
import { schoolTable, tokenInfoTable } from "../../schema/core.schema";
import { eq } from "drizzle-orm";
import { redis } from "bun";
import { linkDatabases } from "./links.db";

export const linksPlugin = new Elysia({ prefix: "/links"})
    .use(linkToken)
    // u must run sms or email under bg job or queue (BullMQ)
    .post("/school-admin", async ({ body, set, token }) => {

        // 1. validate the school Id 
        const isSchoolExist = await linkDatabases.validateSchoolId(body);

        if (!isSchoolExist){
            set.status = "Bad Request";
            return {
                success: false,
                message: "No school found"
            }
        }

        // save the tokenInfo to database
        const [tokenInfoId] = await db.insert(tokenInfoTable)
            .values({
               role: "school-admin",
               email: body.email,
               phone: body.phone,
               schoolId: body.schoolId 
            }).returning({
                id: tokenInfoTable.id
            })        

        const userToken = await token.sign({ 
            tokenId: tokenInfoId.id, 
            jti: randomBytes(32).toString("hex"),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiry
        });

        // select bulk sms name
        const [sender] = await db.select({
            bulkSMSName: schoolTable.bulkSMSName 
        }).from(schoolTable)
        .where(eq(schoolTable.id, body.schoolId))

        if (!sender.bulkSMSName){
            set.status = "Bad Request";
            return {
                success: false,
                message: "For sending SMS, Sender name of school should be valid"
            }
        }

        return {
            userToken
        }
// better to use the queue like bullmq 
//         return await sendOTPSMS({
//             phoneArray: [body.phone],
//             sender: sender.bulkSMSName,
//             message:  `You’ve been added to HCA portal. Click below to activate your account and set your password.
// 👇 Activate Account with link below within 1 hour.
//             ${links.clientLink}/activate/?token=${userToken}`,
//             set
//         });
        // provide a fallback option to send via email
    }, {
        body: linkValidations.createUser,
        beforeHandle({ body, set }){
            body.schoolId = xss(body.schoolId).trim();
            body.email = xss(body.email).trim();
            body.phone = xss(body.phone).trim();

            if (!body.phone.startsWith("255")) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Phone number should start with 255"
                }
            }

        }
    })
    .post("/:role", async ({ params, set, body, token  }) => {
        // validate the role 
        const isRole = allowedRoles.has(params.role as Roles)
        
        if (!isRole) {
            set.status = "Bad Request";
            return {
                success: false,
                message: "The Role requested is invalid"
            }
        }

        const [tokenInfoId] = await db.insert(tokenInfoTable)
            .values({
               role: "school-admin",
               email: body.email,
               phone: body.phone,
               schoolId: body.schoolId 
            }).returning({
                id: tokenInfoTable.id
            });

        const userToken = await token.sign({ 
            tokenId: tokenInfoId.id, 
            jti: randomBytes(32).toString("hex"),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiry
        });


        // select bulk sms name
        const [sender] = await db.select({
            bulkSMSName: schoolTable.bulkSMSName 
        }).from(schoolTable)
        .where(eq(schoolTable.id, body.schoolId))

        if (!sender.bulkSMSName){
            set.status = "Bad Request";
            return {
                success: false,
                message: "For sending SMS, Sender name of school should be valid"
            }
        }

        return await sendOTPSMS({
            phoneArray: [body.phone],
            sender: sender.bulkSMSName,
            message:  `You’ve been added to HCA portal. Click below to activate your account and set your password.
👇 Activate Account with link below within 1 hour.
            ${links.clientLink}/activate/?token=${userToken}`,
            set
        });
    }, {
        body: linkValidations.createUser,
        beforeHandle({ body, set }){
            body.schoolId = xss(body.schoolId).trim();
            body.email = xss(body.email).trim();
            body.phone = xss(body.phone).trim();

            if (!body.phone.startsWith("255")) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Phone number should start with 255"
                }
            }

        },
        afterHandle(){
            // save the audit logs who invited whom when and schoolId
            // you can send to queue for scaling
        }
    })
    // activate-account and verify token 
    .post("/initiate-account", async ({ body, set, token, query }) => {
        const userToken = query.token;
        const decoded = await token.verify(userToken);
        if (!decoded) {
            return {
                success: false,
                message: "Invalid or expired token, ask Admin to resend the new link"
            }
        }  

        const decodedBody = decoded.tokenId as string;

        // blackList token after usage
        const jti = decoded.jti;

    // Check Redis for the blacklisted jti
    const isBlacklisted = await redis.get(`blacklist:${jti}`); 

    if (isBlacklisted) {
        set.status = 401;
        return { 
            success: false,
            message: 'Token has been used. Ask admin for new one.' 
        };
    }
        const exp = decoded.exp;
        if (!exp) {
            set.status = 400;
            return { success: false, message: "Token missing expiration" };
        }
        const timeRemaining = exp - Math.floor(Date.now() / 1000);

        if (timeRemaining <= 0) {
            return { success: false, message: "Token already expired" };
        }
        await redis.set(`blacklist:${jti}`, '1', 'EX', timeRemaining);
        
        return await linkDatabases.saveUser({ set, body, tokenId: decodedBody })
    }, {
        body: linkValidations.initiateAccount,
        query: linkValidations.linkQuery,

        beforeHandle({ body, query }) {
            body.username = xss(body.username).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            body.password = xss(body.password).trim()
            query.token = xss(query.token).trim()
        }
    })
    .get("/get-users", "get-users")
    .put("/update-user", "updated")
    .delete("/delete-user", "deleted")