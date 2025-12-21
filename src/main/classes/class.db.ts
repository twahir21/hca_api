import { asc, count, eq, like, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type"
import { baseClassReturn, getClasses } from "./class.types";
import { ClassTable, levelsTables } from "../../schema/academic.schema";
import { levelType } from "../../const/levels.const";
import { userProfilesTable } from "../../schema/core.schema";



export const classDatabase = {
    createClass: async ({ set, body, schoolId, userId } : { set: Set; schoolId: string; userId: string; body: { name: string; level: levelType }}): Promise<baseClassReturn> => {
        try {
            const { name, level } = body;

            // 1. check if name exist
            const [isClassExist] = await db
                                    .select({ id: ClassTable.id })
                                    .from(ClassTable)
                                    .where(eq(ClassTable.name, name));

            if(isClassExist) {
                set.status = "Conflict";
                return {
                    success: false,
                    message: "Class with this name already exists"
                }
            }

            const [levelID] = await db.select({ id: levelsTables.id })
                .from(levelsTables).where(eq(levelsTables.levels, level))

            // 2. If passes then save
            await db
                .insert(ClassTable)
                .values({
                    name: name,
                    levelId: levelID.id,
                    schoolId: schoolId,
                    createdBy: userId
                });

            set.status = "OK"
            return {
                success: true,
                message: "Class created successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in creating Class"
            }
        }
    },
    updateClass: async ({ set, body, userId, schoolId } : { set: Set; userId: string; schoolId: string; body: { id: string; name: string; level: levelType }}): Promise<baseClassReturn> => {
        try {
            const { id, name, level } = body;

            // 1. check if class exist
            const isClassExist = await db
                                    .select()
                                    .from(ClassTable)
                                    .where(eq(ClassTable.id, id));

            if(isClassExist.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "Class not found"
                }
            }


            const [levelID] = await db.select({ id: levelsTables.id })
                .from(levelsTables).where(eq(levelsTables.levels, level))

            // 2. If passes then update
            await db
                .update(ClassTable)
                .set({
                    name,
                    levelId: levelID.id,
                    updatedBy: userId,
                    schoolId
                })
                .where(eq(ClassTable.id, id));

            set.status = "OK"
            return {
                success: true,
                message: "Class updated successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in updating Class"
            }
        }
    },
    getClasses: async ({ set, limit, currentPage, search } : { set : Set; limit: string; currentPage: string; search: string }): Promise<getClasses&{total: number}> => {
        try {
            // 0. Define variables
            const page = parseInt(currentPage) || 1;
            const perPage = parseInt(limit) || 5;
            const offset = (page - 1) * perPage;

            console.log("paginations: ", page, perPage, offset, search)

            // 1. define where clause for search
            const whereClause = search
                        ? or(
                            like(ClassTable.name, `%${search}%`),  // partial name match
                            eq(ClassTable.name, search),           // strict name match
                        ): undefined; 

            const data = await db
                                .select({
                                    id: ClassTable.id,
                                    name: ClassTable.name,
                                    schoolId: ClassTable.schoolId,
                                    createdAt: ClassTable.createdAt,
                                    updatedAt: ClassTable.updatedAt,
                                    createdBy: userProfilesTable.fullName,
                                    updatedBy: userProfilesTable.fullName,
                                    levelId: levelsTables.levels
                                })
                                .from(ClassTable)
                                .leftJoin(userProfilesTable, eq(userProfilesTable.userId, ClassTable.createdBy))
                                .leftJoin(levelsTables, eq(levelsTables.id, ClassTable.levelId))
                                .where(whereClause)
                                .limit(perPage)
                                .offset(offset)
                                .orderBy(asc(ClassTable.name));

            const [totalClasses] = await db.select({ count: count(ClassTable) })
                .from(ClassTable);
                                
            if (data.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No Classes available",
                    data: [],
                    total: 0
                }
            }
            set.status = "OK";
            return {
                success: true,
                message: "Classes fetched successfully",
                data,
                total: totalClasses.count
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                data: [],
                total: 0,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in fetching Classes"
            }
        }
    },
    deleteClass: async ({ set, body } : { set: Set; body: { id: string }}): Promise<baseClassReturn> => {
        try {
            const { id } = body;

            // 1. check if class exist
            const isClassExist = await db
                                    .select()
                                    .from(ClassTable)
                                    .where(eq(ClassTable.id, id));

            if(isClassExist.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "Class not found"
                }
            }

            // 2. If passes then delete
            await db
                .delete(ClassTable)
                .where(eq(ClassTable.id, id));

            set.status = "OK"
            return {
                success: true,
                message: "Class deleted successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in deleting Class"
            }
        }
    }
}