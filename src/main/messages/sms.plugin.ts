import Elysia from "elysia";
import { smsValidation } from "./sms.valid";
import xss from "xss";
import { smsController } from "./sms.controller";
import { verifyJWT } from "../../plugins/global.plugin";

export const bulkSMSPlugin = new Elysia({ name: "Bulk sms API", prefix: "/sms" })
    .use(verifyJWT)
    .guard({
        beforeHandle({ role, userId, set }) {
            if (!userId) {
                set.status = "Unauthorized";
                return {
                    success: false,
                    message: "No or invalid token"
                }
            }

            // role checking ...
            if (role !== 'admin' && role !== 'teacher'){
                set.status = "Non-Authoritative Information";
                return {
                    success: false,
                    message: "This resource is allowed to Techers and Admins only"
                }
            }
        }
    })
    .get("get-total-sms", async ({ set }) => {
        return await smsController.get({ set });
    })
    .get("/get-recent-sms", async ({ set, query }) => {
        return await smsController.getRecentSMS({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "" });
    })
    .get("/sms-analytics", async ({ set }) => {
        return await smsController.smsAnalytics({ set });
    })
    .post("/sendSMS", async ({ body, set }) => {
        return await smsController.sendSMS({ body, set });
    }, {
        // validate
        body: smsValidation.sendSMS,
        // sanitize
        beforeHandle({ body }) {
            body.message = xss(body.message).trim();
        }
    })
    .get("/get-groups", async ({ set, query }) => {
        return await smsController.getGroups({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "" });
    }, {
        beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim();
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })
    .get("/get-contacts", async ({ query, set }) => {
        // simulate delay
        // await new Promise((resolve) => setTimeout(resolve, 3000));
        // metrics for performance of the route
    //    return trackPerformance(
    //         async () => await smsController.fetchContacts({ currentPage: query.page, limit: query.limit, search: query.search,set }), { 
    //             route: "/contacts/get",
    //             method: "GET",
    //             statusCode: set.status,
    //             timestamp: Date.now()
    //         }
    //     );
        return await smsController.fetchContacts({ currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "", set });
    }, {
        beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim();
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })
    .post("send-via-excel", async ({ body, set }) => {
        // fields of file is ["Name", "Phone Number"]
        return await smsController.sendViaExcel({ file: body.file, set });
    }, {
        // validate
        body: smsValidation.verifyExcel,
        // sanitize
        beforeHandle({ body }) {
            if (body.file.size > 10 * 1024 * 1024) {
                return {
                    success: false,
                    message: "File size is too big",
                    details: "File size should be less than 10MB"
                }
            }
        }

    })
    .post("/add-contact", async ({ body, set }) => {
        return await smsController.addingContact(body, set);
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
    .post("/create-group", async ({ body, set }) => {
        return await smsController.createGroup({ body, set });
    }, {
        body: smsValidation.createGroup,
        // sanitize
        beforeHandle({ body }){
            body.groupName = xss(body.groupName).toLowerCase().trim()
        }
    })
    .put("/update-contact", async ({ body, set }) => { 
        return await smsController.updateContact({ body, set });
    }, {
        body: smsValidation.contactUpdate,
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

    // ==============================
    // === Admin Only ===
    // ==============================
    .guard({
        beforeHandle({ role, set }) {
            if (role !== 'admin') {
                set.status = "Non-Authoritative Information";
                return {
                    success: false,
                    message: "This resource is only for Admins."
                }
            }
        }
    })
    .delete("/delete-contact", async ({ set, body }) => { 
        return await smsController.deleteContacts({ set, body })
    }, {
        body: smsValidation.deleteContact
    })
    .post("/massive-contacts-upload", async ({ body, set }) => { 
        return await smsController.massiveContactsUpload({ body, set });
    }, {
        body: smsValidation.massiveContact,
        // sanitize
        beforeHandle({ body }){ 
            body.map(c => {
                c.name = xss(c.name).toLowerCase().trim(),
                c.phone = xss(c.phone).trim()
                // make sure phone is valid tz
                if(!c.phone.startsWith("255")){
                    return {
                        success: false,
                        message: "Only Tanzania 255 country code is allowed"
                    }
                }
            })
        }
    })

    .delete("/delete-group", async ({ body, set }) => {
        return await smsController.deleteGroup({ body, set })
    }, {
        body: smsValidation.deleteGroup,
        //sanitize
        beforeHandle({ body }) {
            body.id = xss(body.id).trim();
        }
    })
    .put("/edit-group", async ({ body, set }) => { 
        return await smsController.editGroup({ body, set });
    },
     {
        body: smsValidation.editGroup,
        // sanitize
        beforeHandle({ body }){
            body.groupName = xss(body.groupName).toLowerCase().trim();
        }
    })

