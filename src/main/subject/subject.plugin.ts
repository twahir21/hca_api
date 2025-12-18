import Elysia from "elysia";
import { subjectValidators } from "./subject.valid";
import xss from "xss";
import { subjectDatabase } from "./subject.db";
import { verifyJWT } from "../../plugins/global.plugin";

export const SubjectPlugin = new Elysia ({ prefix: "/subjects"})
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
    // === get subjects per a teacher from userId ===
    // ==============================================
    .get("/subject-per-teacher", "you found!")

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
    .post("/create-subject", async ({ set, body }) => {
        return await subjectDatabase.createSubject({ set, body });
    }, {
        body: subjectValidators.createSubject,
        beforeHandle({ body }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .put("/update-subject", async ({ set, body }) => {
        return await subjectDatabase.updateSubject({ set, body });
    }, {
        body: subjectValidators.updateSubject,
        beforeHandle({ body }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .get("/get-subjects", async ({ set, query }) => {
        return await subjectDatabase.getSubjects({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "" });
    }, {
         beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
        }
    })
    .get("/get-all-subjects", async ({ set, query }) => {
        return await subjectDatabase.getAllSubjects({ set });
    })
    .delete("/delete-subject", async ({ set, body }) => {
        return await subjectDatabase.deleteSubject({ set, body });
    }, {
        body: subjectValidators.deleteSubject
    })
    .get("total-subjects", async ({ set }) => {
        return await subjectDatabase.totalSubjects({ set });
    })