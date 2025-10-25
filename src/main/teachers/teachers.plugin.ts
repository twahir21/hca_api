import Elysia from "elysia";
import { TeachersValidators } from "./teachers.valid";
import xss from "xss";

export const TeachersPlugin = new Elysia({ prefix: "/teachers" })
    .post("/create-teacher", async ({ body }) => {
        console.log("Body in teachers: ", body)
    }, {
        body: TeachersValidators.createTeacher,
        beforeHandle({ body, set }) {
            body.name = xss(body.name).trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
            body.class = xss(body.class).trim();
            body.subjects = xss(body.subjects).trim();

            if(!body.phone.startsWith("255")){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Only Tanzania 255 country code is allowed"
                }
            }
        }
    })