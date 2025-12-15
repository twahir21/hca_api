import Elysia from "elysia";
import { schoolValidators } from "./schools.valid";
import xss from "xss";
import { schoolDatabase } from "./schools.db";


export const schoolsPlugin = new Elysia({ prefix: "/schools"})
    .get("/get-schools", async ({ set, query }) => {
        console.log("Query: ", query)
       return await schoolDatabase.getSchools({ set, query })
    //  await trackPerformance(schoolDatabase.getSchools, ({ set })).then(r => r)
    }, {
        beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim();
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })

    .post("get-user-schools", async ({ body, set }) => {
        console.log("BD: ", body)
        return await schoolDatabase.getUserSchools({ set, body })
    }, {
        body: schoolValidators.getUserSchools,
        beforeHandle({ body }) {
            body.userId = xss(body.userId).trim();
        }
    }) // detailed school

    .delete("/delete-school", async ({ set, body }) => {
        return await schoolDatabase.deleteSchool({ set, schoolId: body.schoolId });
    }, {
        body: schoolValidators.deleteSchool,
        beforeHandle({ body }) {
            body.schoolId = xss(body.schoolId).trim()
        }
    })

    .post("/create-school", async ({ body, set }) => {
        return await schoolDatabase.createSchool({ body, set })
    }, {
        body: schoolValidators.createSchool,
        beforeHandle({ body, set }) {
            if(!body.phone.startsWith("255")) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Phone number must be valid Tanzania number which starts with 255"
                }
            }
            // sanitize
            body.address = xss(body.address).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            body.code = xss(body.code).toUpperCase().trim()
            body.email = xss(body.email).trim()
            body.name = xss(body.name).trim()
            body.phone = xss (body.phone).trim()
        }
    })

    .put("/update-school", async ({ body, set }) => {
        return await schoolDatabase.updateSchool({ body, set })
    }, {
        body: schoolValidators.updateSchool,
        beforeHandle({ body, set }) {
            if(!body.phone.startsWith("255")) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Phone number must be valid Tanzania number which starts with 255"
                }
            }
            // sanitize
            body.address = xss(body.address).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            body.code = xss(body.code).toUpperCase().trim()
            body.email = xss(body.email).trim()
            body.name = xss(body.name).trim()
            body.phone = xss (body.phone).trim()
            body.schoolId = xss(body.schoolId).trim()
        }
    })