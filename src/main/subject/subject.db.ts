import { asc, count, eq, like, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { Set } from "../../types/type"
import { baseSubjectReturn, getSubjects } from "./subject.types";
import { SubjectTable } from "../../schema/academic.schema";
import { userProfilesTable } from "../../schema/core.schema";



export const subjectDatabase = {
    createSubject: async ({ set, body, userId, schoolId } : { set: Set; userId: string; schoolId: string; body: { name: string }}): Promise<baseSubjectReturn> => {
        try {
            const { name } = body;

            // 1. check if name exist
            const [isSubjectExist] = await db
                                    .select({ id: SubjectTable.id })
                                    .from(SubjectTable)
                                    .where(eq(SubjectTable.name, name));

            if(isSubjectExist) {
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
                    name,
                    createdBy: userId,
                    schoolId
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
    updateSubject: async ({ set, body, userId, schoolId } : { set: Set; userId: string; schoolId: string; body: { id: string; name: string }}): Promise<baseSubjectReturn> => {
        try {
            const { id, name } = body;

            // 1. check if class exist
            const [isSubjectExist] = await db
                                    .select({ id: SubjectTable.id })
                                    .from(SubjectTable)
                                    .where(eq(SubjectTable.id, id));

            if(!isSubjectExist) {
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
                    name,
                    schoolId,
                    updatedBy: userId
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

            const data = await db
                                .select({
                                    id: SubjectTable.id,
                                    name: SubjectTable.name,
                                    code: SubjectTable.code,
                                    schoolId: SubjectTable.schoolId,
                                    createdAt: SubjectTable.createdAt,
                                    updatedAt: SubjectTable.updatedAt,
                                    createdBy: userProfilesTable.fullName,
                                    updatedBy: userProfilesTable.fullName
                                })
                                .from(SubjectTable)
                                .leftJoin(userProfilesTable, eq(userProfilesTable.userId, SubjectTable.createdBy))
                                .where(whereClause)
                                .limit(perPage)
                                .offset(offset)
                                .orderBy(asc(SubjectTable.name));

            const [totalSubjects] = await db  
                        .select({ count: count(SubjectTable)})
                        .from(SubjectTable)
                                
            set.status = "OK";
            return {
                success: true,
                message: "subjects fetched successfully",
                data,
                total: totalSubjects.count
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                total: 0,
                data: [],
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
}