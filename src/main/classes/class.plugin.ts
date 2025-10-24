import Elysia from "elysia";
import { classValidators } from "./class.valid";
import xss from "xss";
import { classDatabase } from "./class.db";

export const ClassPlugin = new Elysia ({ prefix: "/classes"})
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
    .get("/get-classes", async ({ set, query }) => {
        return await classDatabase.getClasses({ set, currentPage: query.page ?? "1", limit: query.limit ?? "5", search: query.search ?? "" });
    }, {
         beforeHandle({ query }) {
            query.search = xss(query.search).toLowerCase().trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            query.page = xss(query.page).trim();
            query.limit = xss(query.limit).trim();
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