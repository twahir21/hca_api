import Elysia from "elysia";
import { smsValidation } from "./sms.valid";
import xss from "xss";
import { smsController } from "./sms.controller";

export const bulkSMSPlugin = new Elysia({ name: "Bulk sms API", prefix: "/sms" })
    .post("/post", async ({ body }) => {
        return await smsController.sendWithPhone(body);
    }, {
        // validate the body
        body: smsValidation.verifyExcel,
        // sanitize data
        beforeHandle({ body }) {
            body.message = xss(body.message).trim();
            body.singlePhone = xss(body.singlePhone).trim();
        }
    })
    .get("/total", async () => {
        return await smsController.get();
    })


export const contactsPlugin = new Elysia({ name: "Contact API", prefix: "/contacts" })
    .post("/post", async ({ body }) => {
        console.log("Server validated your body : ", body);
        return await smsController.addingContact(body)
    }, {
        // validate
        body: smsValidation.contactPost,
        // sanitize
        beforeHandle({ body }){ 
            body.name = xss(body.name).toLowerCase().trim(),
            body.phone = xss(body.phone).trim()
            // make sure phone is valid tz
            if(!body.phone.startsWith("255")){
                return {
                    success: false,
                    message: "Only Tanzania 255 country code is allowed"
                }
            }
        }
    })