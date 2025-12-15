import { and, asc, count, eq, like, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type"
import { baseSchoolReturn, getSchools, schoolBody, updateSchoolBody } from "./schools.types";
import { schoolTable, userProfilesTable, userSchoolsTable, usersTable } from "../../schema/core.schema";


export const schoolDatabase = {
    createSchool: async ({ body, set }: { set: Set; body: schoolBody }): Promise<baseSchoolReturn> => {
        try {
            // 0. Check if school exists
            const [isExist] = await db.select({
                code: schoolTable.code
            }).from(schoolTable)
            .where(eq(schoolTable.code, body.code))
            

            if(isExist){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "School is already registered"
                }
            }
            await db.transaction(async tx => {
                // 1. Calculate expiry date (2 months free trial)
                const now = new Date();
                const expireDate = new Date();
                expireDate.setMonth(now.getMonth() + 2);

                // 2. Save the school
                const [schoolId] = await tx.insert(schoolTable).values({
                    name: body.name,
                    address: body.address,
                    email: body.email,
                    code: body.code,
                    phone: body.phone,
                    expiredAt: expireDate
                }).returning({
                    id: schoolTable.id
                });

                // 3. if user exists proceed with these
                const [isUserExist] = await db.select({
                    userId: userProfilesTable.userId
                }).from(userProfilesTable)
                .where(
                    and(
                        eq(userProfilesTable.email, body.email),
                        eq(userProfilesTable.phone, body.phone)
                    )
                )

                if(isUserExist) {
                    // update the school state to be active
                    await tx.update(schoolTable).set({
                        status: "approved"
                    }).where(eq(schoolTable.id, schoolId.id));

                    // Save the user's school (for counting how many school this user has)
                    await tx.insert(userSchoolsTable).values({
                        userId: isUserExist.userId,
                        schoolId: schoolId.id
                    })
                }

            })
            set.status = "OK";
            return {
                success: true,
                message: "School created Successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in creating a school",
                
            }
        }
    },
    getSchools: async ({ set, query }: { set: Set; query: Record<string, string> }): Promise<getSchools> => {
        try {
            // 1. initiate pagination variables
            const page = parseInt(query.page) || 1;
            const perPage = parseInt(query.limit) || 5;
            const offset = (page - 1) * perPage;

            // 2. define where for searching ...
            const whereClause = query.search
            ? or(
                // school name
                like(schoolTable.name, `%${query.search}%`),
                eq(schoolTable.name, query.search)

                // owner's info (email/phone)
                // address
                // ID
                )
            : undefined;

            const [totalSchools] = await db.select({ count: count(schoolTable) })
                .from(schoolTable);

            const data = await db.select()
                .from(schoolTable)
                .where(whereClause)
                .orderBy(asc(schoolTable.name))
                .limit(perPage)
                .offset(offset);
        
            set.status = "OK";
            return {
                success: true,
                message: "Schools fetched successfully!",
                data,
                total: totalSchools.count
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                total: 0,
                data: [],
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in getting schools"
            }
        }
    },
    updateSchool: async ({ set, body }: { set: Set; body: updateSchoolBody }): Promise<baseSchoolReturn> => {
        try {
            // 0. Check if id exists
            const [isExist] = await db.select({
                code: schoolTable.code
            }).from(schoolTable)
            .where(eq(schoolTable.id, body.schoolId));

            if (!isExist){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "School is not found!"
                }
            }
            const { name, email, address, code, phone, schoolId } = body;
            await db.update(schoolTable).set({
                name, email, address, code, phone
            }).where(eq(schoolTable.id, schoolId));

            set.status = "OK";
            return {
                success: false,
                message: "School updated successfully!"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                        error.message : 
                        "Something went wrong in updating the school"
            }
        }
    },
    deleteSchool: async ({ set, schoolId } : { set: Set; schoolId: string }): Promise<baseSchoolReturn> => {
        try {
            // 0. Check if id exists
            const [isExist] = await db.select({
                code: schoolTable.code
            }).from(schoolTable)
            .where(eq(schoolTable.id, schoolId));

            if (!isExist){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "School is not found!"
                }
            }
            await db.delete(schoolTable)
                .where(eq(schoolTable.id, schoolId));

            set.status = "OK";
            return {
                success: true,
                message: "School deleted successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                        error.message :
                        "Something went wrong in deleting the shcool"
            } 
        }
    },
    getUserSchools: async ({ set, body }: { set: Set;  body: { userId: string }}): Promise<baseSchoolReturn & { schoolCount: number }> => {
        try {
            // verify userId
            const [isIdValid] = await db.select({
                id: usersTable.id
            }).from(usersTable)
            .where(eq(usersTable.id, body.userId));

            if(!isIdValid) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "User not found",
                    schoolCount: 0
                }
            }
            const [schoolCount] = await db.select({
                count: count(userSchoolsTable.schoolId)
            })
                .from(userSchoolsTable)
                .where(eq(userSchoolsTable.userId, body.userId))
            set.status = "OK";
            return {
                success: true,
                message: "User schools fetched successfully!",
                schoolCount: schoolCount.count
            }
        } catch (error) {   
            set.status = "Internal Server Error";
            return {
                success: false,
                schoolCount: 0,
                message: error instanceof Error ?
                            error.message  :
                            "Something went wrong in getting user schools"
            }
        }
    }
}