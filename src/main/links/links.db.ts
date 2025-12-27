import { and, eq, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { rolesTable, schoolTable, tokenInfoTable, userProfilesTable, userRolesTable, usersTable } from "../../schema/core.schema";
import { Set } from "../../types/type";
import { baseLinkReturn, initiateAccountBody, sendTokenBody } from "./links.types";
import { hash } from "../../security/pswd.sec";

export const linkDatabases = {
    saveUser: async ({ set, body, tokenId }: { set: Set; body: initiateAccountBody; tokenId: string }): Promise<baseLinkReturn> => {
        try {
            // extract info using the id
            const [infoData] = await db.select()
                    .from(tokenInfoTable)
                    .where(eq(tokenInfoTable.id, tokenId));

            if(!infoData){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "tokenId is invalid"
                }
            }

            // 0. check if user data exists
            const [isUsernameExist] = await db.select({
                username: usersTable.username,
            })
            .from(usersTable).where(eq(usersTable.username, body.username));

            const [isEmailorPhoneExists] = await db.select({
                email: userProfilesTable.email,
                phone: userProfilesTable.phone
            })
            .from(userProfilesTable)
            .where(or(
                eq(userProfilesTable.email, infoData.email),
                eq(userProfilesTable.phone, infoData.phone)
            ));

            const conflicts = {
                usernameTaken: !!isUsernameExist,
                emailTaken: isEmailorPhoneExists?.email === infoData.email,
                phoneTaken: isEmailorPhoneExists?.phone === infoData.phone,
            };

            const canRegister = !Object.values(conflicts).some(value => value === true);


            // for frontend ping username if exist for every input key (Facebook approach)
            if (!canRegister) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "User already exists"
                }
            }
            // 1. destructuring
            const { username, password, dob, fullName, address, gender } = body;
            const { role, schoolId, email, phone } = infoData;
            
            // 1. Check if role exists for this school
            const [existingRole] = await db
                .select({ id: rolesTable.id })
                .from(rolesTable)
                .where(
                    eq(rolesTable.role, role),
                )
            
            // 2. if not exists is invalid
            if(!existingRole){
                set.status = "Conflict";
                return {
                    success: false,
                    message: "Role submitted is invalid"
                }
            }
            await db.transaction(async tx => {
                // 3. save the user
                const [users] = await tx.insert(usersTable)
                    .values({
                        username,
                        passwordHash: await hash(password),
                    }).returning({
                        id: usersTable.id
                    });

                // 4. save user profile
                await tx.insert(userProfilesTable).values({
                    fullName, phone, email, address, gender, dob,
                    userId: users.id
                });

                
                // 5. save the user - role relation (also how many school user owns)
                await tx.insert(userRolesTable).values({
                    userId: users.id,
                    roleId: existingRole.id,
                    schoolId,
                    isDefaultRole: true,
                })

                // 6. update the school state to be active
                await tx.update(schoolTable).set({
                    status: "approved"
                }).where(eq(schoolTable.id, schoolId));
            });

            set.status = "OK";
            return {
                success: true,
                message: "User created successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in creating a user"
            }
        }
    },
    validateSchoolId: async (body: sendTokenBody): Promise<boolean> => {
        try {
            const [schooldata] = await db.select({
                id: schoolTable.id
            })
            .from(schoolTable)
            .where(
                and(
                    eq(schoolTable.id, body.schoolId),
                    eq(schoolTable.status, "pending")
                )
            )

            if (!schooldata) {
                return false
            }
            return true;
        } catch (error) {
            return false;
        }
    },
    validateUser: async (body: { email: string; phone: string; }): Promise<boolean> => {
        try {
            const [row] = await db
                .select({ id: userProfilesTable.id })
                .from(userProfilesTable)
                .where(
                    or(
                        eq(userProfilesTable.email, body.email),
                        eq(userProfilesTable.phone, body.phone)
                    )
                )
            if(row) return false;
            return true;
        } catch (error) {
            return false;
        }
    }
}