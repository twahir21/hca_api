import { asc, count, eq, like, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type"
import { ClassTable } from "../../schema/class.schema";
import { baseClassReturn, getClasses, totalClasses } from "./class.types";



export const classDatabase = {
    createClass: async ({ set, body } : { set: Set; body: { name: string }}): Promise<baseClassReturn> => {
        try {
            const { name } = body;

            // 1. check if name exist
            const isClassExist = await db
                                    .select()
                                    .from(ClassTable)
                                    .where(eq(ClassTable.name, name));

            if(isClassExist.length > 0) {
                set.status = "Conflict";
                return {
                    success: false,
                    message: "Class with this name already exists"
                }
            }

            // 2. If passes then save
            await db
                .insert(ClassTable)
                .values({
                    name
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
    updateClass: async ({ set, body } : { set: Set; body: { id: string; name: string }}): Promise<baseClassReturn> => {
        try {
            const { id, name } = body;

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

            // 2. If passes then update
            await db
                .update(ClassTable)
                .set({
                    name
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
    getClasses: async ({ set, limit, currentPage, search } : { set : Set; limit: string; currentPage: string; search: string }): Promise<getClasses> => {
        try {
            // 0. Define variables
            const page = parseInt(currentPage) || 1;
            const perPage = parseInt(limit) || 5;
            const offset = (page - 1) * perPage;

            // 1. define where clause for search
            const whereClause = search
                        ? or(
                            like(ClassTable.name, `%${search}%`),  // partial name match
                            eq(ClassTable.name, search),           // strict name match
                        ): undefined; 

            const classes = await db
                                .select()
                                .from(ClassTable)
                                .where(whereClause)
                                .limit(perPage)
                                .offset(offset)
                                .orderBy(asc(ClassTable.name));
                                
            if (classes.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No Classes available",
                    classes: []
                }
            }
            set.status = "OK";
            return {
                success: true,
                message: "Classes fetched successfully",
                classes
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                classes: [],
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in fetching Classes"
            }
        }
    },
    getAllClasses: async ({ set }: { set: Set }): Promise<getClasses> => {
        try {
            const allClasses = await db
                                .select()
                                .from(ClassTable)
                                .orderBy(asc(ClassTable.name));
                                
            if (!allClasses) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No Classes available",
                    classes: []
                }
            }
            set.status = "OK";
            return {
                success: true,
                message: "Classes fetched successfully",
                classes: allClasses
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                classes: [],
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
    },
    totalClasses: async ({ set }: { set: Set }): Promise<totalClasses> => {
        try {
            const total = await db.select({
                count: count()
            }).from(ClassTable).then(t => t[0].count);

            set.status = "OK";
            return {
                success: true,
                message: "Total Classes fetched successfully",
                total
            }
        } catch (error) {
            set.status = "Internal Server Error"
            return {
                success: false,
                total: 0,
                message: error instanceof Error ? 
                            error.message : 
                            "Something went wrong in getting total Classes"
            }
        }
    }
}