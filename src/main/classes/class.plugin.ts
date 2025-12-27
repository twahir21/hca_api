import Elysia from "elysia";
import { classValidators } from "./class.valid";
import xss from "xss";
import { classDatabase } from "./class.db";
import { verifyJWT } from "../../plugins/global.plugin";

export const ClassPlugin = new Elysia ({ prefix: "/classes"})
    .use(verifyJWT)
    
    // ===========================================
    // === School Admins only ===
    // ===========================================
    .guard({
        beforeHandle({ selectedRole, set }) {
            if(selectedRole !== "school-admin") {
                set.status = "Forbidden";
                return {
                    success: false,
                    message: "Only School Admins can use this resource."
                }
            }
        }
    })
    .get("/class-per-teacher", "you found!")
    .post("/create-class", async ({ set, body, schoolId, userId }) => {

        if (!schoolId || !userId) return { success: false, message: "JWT key information failed to be decoded"}

        return await classDatabase.createClass({ set, body, schoolId, userId });
    }, {
        body: classValidators.createClass,
        beforeHandle({ body, userId }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .put("/update-class", async ({ set, body, schoolId, userId }) => {
        if (!schoolId || !userId) return { success: false, message: "JWT key information failed to be decoded"}

        return await classDatabase.updateClass({ set, body, userId, schoolId });
    }, {
        body: classValidators.updateClass,
        beforeHandle({ body }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .delete("/delete-class", async ({ set, body }) => {
        return await classDatabase.deleteClass({ set, body });
    }, {
        body: classValidators.deleteClass
    })

    .get("/get-classes", async ({ set, query, schoolId }) => {
        if (!schoolId) return { success: false, message: "JWT key information failed to be decoded"}
        return await classDatabase.getClasses({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "", schoolId });
    }, {
         beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })

