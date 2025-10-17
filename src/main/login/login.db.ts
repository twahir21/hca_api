import { eq } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { usersTable } from "../../schema/users.schema";
import { Set } from "../../types/type";
import { loginBody, loginReturn } from "./login.types"
import { hash, isMatch } from "../../security/pswd.sec";

export const loginDatabase = {
    login: async ({ body, set }: { body: loginBody ; set: Set }): Promise<loginReturn> => {
        try {
            // await db.insert(usersTable).values({ username: "admin", password: await hash("hca@2026"), phone: "255674291587" });
            // 1. fetch data using username
            const data = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.username, body.username))
                .then(r => r[0]);

            // 2. if data is not found, return error
            if (data.username.length === 0) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Invalid credentials",
                    data: { role: "invalid", username: "", phone: "", userId: "" }
                }
            }

            // 3. verify password given with that of db
            const isPasswordMatch = await isMatch({ password: body.password, hash: data.password });

            // 4. if not match, return error
            if (!isPasswordMatch) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Invalid credentials",
                    data: { role: "invalid", username: "", phone: "", userId: "" }

                }
            }
            // 5. if match, return success
            set.status = "OK";
            return {
                success: true,
                message: "Login successful",
                data: { role: data.role, username: data.username, phone: data.phone, userId: data.id }
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in login",
                data: { role: "invalid", username: "", phone: "", userId: "" }

            }
        }
    }
}