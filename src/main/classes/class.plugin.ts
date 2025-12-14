import Elysia from "elysia";
import { classValidators } from "./class.valid";
import xss from "xss";
import { classDatabase } from "./class.db";
import { verifyJWT } from "../../plugins/global.plugin";

export const ClassPlugin = new Elysia ({ prefix: "/classes"})
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
        }
    })  
    // ==============================================
    // === get classes per a teacher from userId ===
    // ==============================================
    .get("/class-per-teacher", "you found!")

    // ===========================================
    // === Admins only ===
    // ===========================================
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
    .post("/create-class", async ({ set, body }) => {
        return await classDatabase.createClass({ set, body });
    }, {
        body: classValidators.createClass,
        beforeHandle({ body }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .put("/update-class", async ({ set, body }) => {
        return await classDatabase.updateClass({ set, body });
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
    .get("total-classes", async ({ set }) => {
        return await classDatabase.totalClasses({ set });
    })
    .get("/get-classes", async ({ set, query }) => {
        return await classDatabase.getClasses({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "" });
    }, {
         beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })
    .get("/get-all-classes", async ({ set }) => {
        return await classDatabase.getAllClasses({ set });
    })

