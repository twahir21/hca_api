import Elysia from "elysia";
import { subjectValidators } from "./subject.valid";
import xss from "xss";
import { subjectDatabase } from "./subject.db";

export const SubjectPlugin = new Elysia ({ prefix: "/subjects"})
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
    .delete("/delete-subject", async ({ set, body }) => {
        return await subjectDatabase.deleteSubject({ set, body });
    }, {
        body: subjectValidators.deleteSubject
    })
    .get("total-subjects", async ({ set }) => {
        return await subjectDatabase.totalSubjects({ set });
    })