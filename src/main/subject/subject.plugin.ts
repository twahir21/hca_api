import Elysia from "elysia";
import { subjectValidators } from "./subject.valid";
import xss from "xss";
import { subjectDatabase } from "./subject.db";
import { verifyJWT } from "../../plugins/global.plugin";

export const SubjectPlugin = new Elysia ({ prefix: "/subjects"})
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
    // ==============================================
    // === get subjects per a teacher from userId ===
    // ==============================================
    .get("/subject-per-teacher", "you found!")

    .post("/create-subject", async ({ set, body, schoolId, userId }) => {
        if (!schoolId || !userId) return { success: false, message: "JWT key information failed to be decoded"}

        return await subjectDatabase.createSubject({ set, body, userId, schoolId });
    }, {
        body: subjectValidators.createSubject,
        beforeHandle({ body }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        }
    })
    .put("/update-subject", async ({ set, body, userId, schoolId }) => {
        if (!schoolId || !userId) return { success: false, message: "JWT key information failed to be decoded"}

        return await subjectDatabase.updateSubject({ set, body, schoolId, userId });
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
    .delete("/delete-subject", async ({ set, body }) => {
        return await subjectDatabase.deleteSubject({ set, body });
    }, {
        body: subjectValidators.deleteSubject
    })