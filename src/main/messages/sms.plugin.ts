import Elysia from "elysia";
import { smsValidation } from "./sms.valid";
import xss from "xss";
import { smsController } from "./sms.controller";

export const bulkSMSPlugin = new Elysia({ name: "Bulk sms API", prefix: "/sms" })
    .post("/post", async ({ body }) => {
        return await smsController.post(body);
    }, {
        // validate the body
        body: smsValidation.post,
        // sanitize data
        beforeHandle({ body }) {
            body.message = xss(body.message);
            body.singlePhone = xss(body.singlePhone);
        }
    })
    .get("/total", async () => {
        return await smsController.get();
    })