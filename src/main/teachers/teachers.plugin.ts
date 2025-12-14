import Elysia from "elysia";
import { TeachersValidators } from "./teachers.valid";
import xss from "xss";
import { TeachersControllers } from "./teachers.controller";
import { linkToken } from "../../plugins/global.plugin";
import { sendOTPSMS } from "../../func/nextsms.func";
import { links } from "../../const/links.const";
import { decodedBody } from "./teachers.types";
import { randomBytes } from "crypto";
import { redis } from "bun";

export const TeachersPlugin = new Elysia({ prefix: "/teachers" })
    .use(linkToken)
    .post("/create-teacher", async ({ set, body, token }) => {
        const userToken = await token.sign({ body, jti: randomBytes(32).toString("hex") });

        return await sendOTPSMS({
            phoneArray: [body.phone],
            sender: "HCA",
            message:  `You’ve been added to HCA portal. Click below to activate your account and set your password.
👇 Activate Account with link below within 1 hour.
            ${links.clientLink}/activate/?token=${userToken}`,
            set
        });
    }, {
        body: TeachersValidators.createTeacher,
        beforeHandle({ body, set }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            body.class = xss(body.class).trim();
            body.subjects = xss(body.subjects).trim();

            if(!body.phone.startsWith("255")){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Only Tanzania 255 country code is allowed"
                }
            }
        }
    })
    .post("/save-teacher", async ({ body, set, token, query }) => {
        const userToken = query.token;
        const decoded = await token.verify(userToken);

        if (!decoded) {
            return {
                success: false,
                message: "Invalid or expired token, ask Admin to resend the new link"
            }
        }  

        const decodedBody = decoded.body as decodedBody;
        console.log("decoded boyd: ", decodedBody);

        // blackList token after usage
        const jti = decoded.jti;
        console.log(decoded.exp)


    // Check Redis for the blacklisted jti
    const isBlacklisted = await redis.get(`blacklist:${jti}`); 

    if (isBlacklisted) {
        set.status = 401;
        return { 
            success: false,
            message: 'Token has been used. Ask admin for new one.' 
        };
    }
        const timeRemaining = decoded.exp ?? 1761644431  - Math.floor(Date.now() / 1000); 
        await redis.set(`blacklist:${jti}`, '1', 'EX', timeRemaining)
        
        return TeachersControllers.createTeacher({ body, set, decodedBody})
    }, {
        body: TeachersValidators.saveTeacher,
        query: TeachersValidators.teacherQuery,

        beforeHandle({ body, query }) {
            body.username = xss(body.username).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            body.password = xss(body.password).trim()
            query.token = xss(query.token).trim()
        }
    })