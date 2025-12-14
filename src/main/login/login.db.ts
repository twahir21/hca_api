import { eq } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type";
import { loginBody, loginReturn } from "./login.types"
import { hash, isMatch } from "../../security/pswd.sec";
import { userProfilesTable, usersTable } from "../../schema/core.schema";

export const loginDatabase = {
    login: async ({ body, set }: { body: loginBody ; set: Set }): Promise<loginReturn> => {
        try {
            // await db.insert(usersTable).values({ username: "admin", password: await hash("hca@2026"), phone: "255674291587" });
            // 1. fetch data using username
            const [data] = await db
                .select()
                .from(usersTable)
                .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId))
                .where(eq(usersTable.username, body.username));

            console.log("Body received: ", body);
            console.log("Data extracted: ", data)

            // 2. if data is not found, return error
            if (!data) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Invalid credentials",
                    data: { phone: "", userId: "" }
                }
            }

            // 3. verify password given with that of db
            const isPasswordMatch = await isMatch({ password: body.password, hash: data.users.passwordHash });

            // 4. if not match, return error
            if (!isPasswordMatch) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Invalid credentials",
                    data: { phone: "", userId: "" }

                }
            }
            // 5. if match, return success
            set.status = "OK";
            return {
                success: true,
                message: "Login successful",
                data: { phone: data.user_profiles?.phone ?? "", userId: data.users.id }
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in login",
                data: { phone: "", userId: "" }

            }
        }
    }
}