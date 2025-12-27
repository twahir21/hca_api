import Elysia from "elysia";
import { verifyJWT } from "../../plugins/global.plugin";
import { staffDatabase } from "./staff.db";

export const staffPlugin = new Elysia({ prefix: "/staffs"})
    .use(verifyJWT)
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
    .get("/get-staffs", async ({ set, query, schoolId, userId }) => {

        if (!schoolId || !userId) return { success: false, message: "JWT key information failed to be decoded"}

        return await staffDatabase.getStaffs({ set, query, schoolId, userId })
    })