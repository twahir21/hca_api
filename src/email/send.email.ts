import Elysia, { t } from "elysia";
import { sendEmail } from "../config/email.config";
import xss from "xss";
import { RateLimitMail } from "../security/ratelimit.sec";

type validErr = {
    success: false,
    message: string;
}

export const sendEmailPlugin = new Elysia({ prefix: "/email"})
    .use(RateLimitMail)
    .post("/send-email", async ({ body, isRateLimited }) => {
        console.log("this is runnign")
        if(!isRateLimited){
            return {
                success: false,
                message: "Too many attempts. Try again in 60 seconds."
            }
        }
        return await sendEmail({
            fromName: "New client",
            fromEmail: body.email,
            subject: body.subject,
            message: body.message
        });
    }, {
        body: t.Object({
            email: t.String({
                format: "email",
                error (): validErr {
                    return {
                        success: false,
                        message: "Invalid or empty email"
                    }
                }
            }),
            subject: t.String({
                minLength: 3,
                maxLength: 70,
                error(): validErr {
                    return {
                        success: false,
                        message: "Subject should be 3-70 characters"
                    }
                }
            }),
            message: t.String({
                minLength: 2,
                maxLength: 300,
                error(): validErr {
                    return {
                        success: false,
                        message: "Message is empty or exceeds 300 characters"
                    }
                }
            }),
        }),

        // sanitize
        beforeHandle({ body }){
            body.email = xss(body.email).trim();
            body.message = xss(body.message).trim(),
            body.subject = xss(body.subject).trim()
        }
    })