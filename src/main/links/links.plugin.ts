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
import { sendEmail } from "../../config/email.config";
import { RateLimitActivation } from "../../security/ratelimit.sec";

export const linksPlugin = new Elysia({ prefix: "/links"})
    .use(linkToken)
    // u must run sms or email under bg job or queue (BullMQ)
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

    .use(RateLimitActivation)
    .post("/school-admin", async ({ body, set, token, isRateLimited }) => {
        console.log("rate limit", isRateLimited)
        if(!isRateLimited){
            set.status = "Too Many Requests";
            return {
                success: false,
                message: "Too many requests, try after an hour"
            }
        }
        // 1. validate the school Id 
        const isSchoolExist = await linkDatabases.validateSchoolId(body);

        if (!isSchoolExist){
            set.status = "Bad Request";
            return {
                success: false,
                message: "No school found"
            }
        }

        // get phone and email from schoolId
        const [contactInfo] = await db.select({
            phone: schoolTable.phone,
            email: schoolTable.email
        }).from(schoolTable).where(eq(schoolTable.id, body.schoolId));

        // save the tokenInfo to database
        const [tokenInfoId] = await db.insert(tokenInfoTable)
            .values({
               role: "school-admin",
               email: contactInfo.email,
               phone: contactInfo.phone,
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

        // better to use the queue like bullmq in VPS
        const isSent = await sendOTPSMS({
            phoneArray: [contactInfo.phone],
            sender: sender.bulkSMSName,
            message:  `You’ve been added to HCA portal. Click below to activate your account and set your password.
👇 Activate Account with link below within 1 hour.
            ${links.clientLink}/initiate-account/?token=${userToken}`,
            set
        });

        // provide a fallback option to send via email
        if (!isSent.success){
            const sendMail = await sendEmail({
                fromName: "SkuliPro",
                subject: "initiate-account",
                message: `You’ve been added to HCA portal. Click below to activate your account and set your password.                
                👇 Activate Account with link below within 1 hour.
            ${links.clientLink}/initiate-account/?token=${userToken}`,
                title: "Activate Account",
                user: [contactInfo.email]
            })

            return {
                success: sendMail.success,
                message: sendMail.success ? "The activation link has been sent via email. SMS delivery is currently unavailable." : sendMail.message
            }
        }
        return isSent;
    }, {
        body: linkValidations.createUser,
        beforeHandle({ body, set }){
            body.schoolId = xss(body.schoolId).trim();
        }
    })
    .post("/:role", async ({ params, set, body, token, isRateLimited  }) => {
        if(!isRateLimited){
            set.status = "Too Many Requests";
            return {
                success: false,
                message: "Too many requests, try after an hour"
            }
        }
        // validate the role 
        const isRole = allowedRoles.has(params.role as Roles)
        
        if (!isRole) {
            set.status = "Bad Request";
            return {
                success: false,
                message: "The Role requested is invalid"
            }
        }
        // get phone and email from schoolId
        const [contactInfo] = await db.select({
            phone: schoolTable.phone,
            email: schoolTable.email
        }).from(schoolTable).where(eq(schoolTable.id, body.schoolId));

        const [tokenInfoId] = await db.insert(tokenInfoTable)
            .values({
               role: "school-admin",
               email: contactInfo.email,
               phone: contactInfo.phone,
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
            phoneArray: [contactInfo.phone],
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
        },
        afterHandle(){
            // save the audit logs who invited whom when and schoolId
            // you can send to queue for scaling
        }
    })