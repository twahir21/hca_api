import { asc, count, eq, like, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type"
import { SubjectTable } from "../../schema/class.schema";
import { baseSubjectReturn, getSubjects, totalSubjects } from "./subject.types";



export const subjectDatabase = {
    createSubject: async ({ set, body } : { set: Set; body: { name: string }}): Promise<baseSubjectReturn> => {
        try {
            const { name } = body;

            // 1. check if name exist
            const isSubjectExist = await db
                                    .select()
                                    .from(SubjectTable)
                                    .where(eq(SubjectTable.name, name));

            if(isSubjectExist.length > 0) {
                set.status = "Conflict";
                return {
                    success: false,
                    message: "Subject with this name already exists"
                }
            }

            // 2. If passes then save
            await db
                .insert(SubjectTable)
                .values({
                    name
                });

            set.status = "OK"
            return {
                success: true,
                message: "Subject created successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in creating Subject"
            }
        }
    },
    updateSubject: async ({ set, body } : { set: Set; body: { id: string; name: string }}): Promise<baseSubjectReturn> => {
        try {
            const { id, name } = body;

            // 1. check if class exist
            const isSubjectExist = await db
                                    .select()
                                    .from(SubjectTable)
                                    .where(eq(SubjectTable.id, id));

            if(isSubjectExist.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "Subject not found"
                }
            }

            // 2. If passes then update
            await db
                .update(SubjectTable)
                .set({
                    name
                })
                .where(eq(SubjectTable.id, id));

            set.status = "OK"
            return {
                success: true,
                message: "Subject updated successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in updating Subject"
            }
        }
    },
    getSubjects: async ({ set, limit, currentPage, search } : { set : Set; limit: string; currentPage: string; search: string }): Promise<getSubjects> => {
        try {
            // 0. Define variables
            const page = parseInt(currentPage) || 1;
            const perPage = parseInt(limit) || 5;
            const offset = (page - 1) * perPage;

            // 1. define where clause for search
            const whereClause = search
                        ? or(
                            like(SubjectTable.name, `%${search}%`),  // partial name match
                            eq(SubjectTable.name, search),           // strict name match
                        ): undefined; 

            const subjects = await db
                                .select()
                                .from(SubjectTable)
                                .where(whereClause)
                                .limit(perPage)
                                .offset(offset)
                                .orderBy(asc(SubjectTable.name));
                                
            if (subjects.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No subject available",
                    subjects: []
                }
            }
            set.status = "OK";
            return {
                success: true,
                message: "subjects fetched successfully",
                subjects
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                subjects: [],
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in fetching subjects"
            }
        }
    },
    getAllSubjects: async ({ set }: { set : Set }): Promise<getSubjects> => {
        try {

            const allSubjects = await db
                                .select()
                                .from(SubjectTable)
                                .orderBy(asc(SubjectTable.name));
                                
            if (!allSubjects) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No subject available",
                    subjects: []
                }
            }
            set.status = "OK";
            return {
                success: true,
                message: "subjects fetched successfully",
                subjects: allSubjects
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                subjects: [],
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in fetching subjects"
            }
        }
    },
    deleteSubject: async ({ set, body } : { set: Set; body: { id: string }}): Promise<baseSubjectReturn> => {
        try {
            const { id } = body;

            // 1. check if class exist
            const isSubjectExist = await db
                                    .select()
                                    .from(SubjectTable)
                                    .where(eq(SubjectTable.id, id));

            if(isSubjectExist.length === 0) {
                set.status = "Not Found";
                return {
                    success: false,
                    message: "Subject not found"
                }
            }

            // 2. If passes then delete
            await db
                .delete(SubjectTable)
                .where(eq(SubjectTable.id, id));

            set.status = "OK"
            return {
                success: true,
                message: "Subject deleted successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in deleting Subject"
            }
        }
    },
    totalSubjects: async ({ set }: { set: Set }): Promise<totalSubjects> => {
        try {
            const total = await db.select({
                count: count()
            }).from(SubjectTable).then(t => t[0].count);

            set.status = "OK";
            return {
                success: true,
                message: "Total subjects fetched successfully",
                total
            }
        } catch (error) {
            set.status = "Internal Server Error"
            return {
                success: false,
                total: 0,
                message: error instanceof Error ? 
                            error.message : 
                            "Something went wrong in getting total subjects"
            }
        }
    }
}