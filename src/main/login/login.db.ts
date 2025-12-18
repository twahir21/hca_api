import { eq } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type";
import { loginBody, loginReturn } from "./login.types"
import { hash, isMatch } from "../../security/pswd.sec";
import { schoolTable, userProfilesTable, userRolesTable, usersTable } from "../../schema/core.schema";

export const loginDatabase = {
    login: async ({ body, set }: { body: loginBody ; set: Set }): Promise<loginReturn> => {
        try {
            // 0. check if super-admin
            const [isSuperAdmin] = await db.select()
                .from(usersTable)
                .where(eq(usersTable.username, body.username))
                .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId));
            
            if (body.username === process.env.ADMIN_USERNAME!){
                const isPasswordMatch = await isMatch({ password: body.password, hash: isSuperAdmin.users.passwordHash });
                if (!isPasswordMatch) {
                    set.status = "Bad Request";
                    return {
                        success: false,
                        message: "Invalid credentials",
                        data: { phone: "", userId: "", bulkSMS: '', email: '' }

                    }
                }
                console.log("isPassword match: ", isPasswordMatch)
                set.status = "OK";
                return {
                success: true,
                message: "Login successful",
                    data: { 
                        phone: isSuperAdmin.user_profiles?.phone ?? "", 
                        userId: isSuperAdmin.users.id,
                        bulkSMS: process.env.ADMIN_BULKSMS!,
                        email: isSuperAdmin.user_profiles?.email ?? ''
                    }                    
                }
            }

            // 1. fetch data using username
            const [data] = await db
                .select()
                .from(usersTable)
                .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId))
                .leftJoin(userRolesTable, eq(usersTable.id, userRolesTable.userId))
                .leftJoin(schoolTable, eq(schoolTable.id, userRolesTable.schoolId))
                .where(eq(usersTable.username, body.username));

            // 2. if data is not found, return error
            if (!data) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Invalid credentials",
                    data: { phone: "", userId: "", bulkSMS: '', email: '' }
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
                    data: { phone: "", userId: "", bulkSMS: '', email: '' }

                }
            }
            // 5. if match, return success
            set.status = "OK";
            return {
                success: true,
                message: "Login successful",
                data: { 
                    phone: data.user_profiles?.phone ?? "", 
                    userId: data.users.id,
                    bulkSMS: data.school?.bulkSMSName ?? "",
                    email: data.user_profiles?.email ?? ''
                }
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in login",
                data: { phone: "", userId: "", bulkSMS: '', email: '' }

            }
        }
    }
}