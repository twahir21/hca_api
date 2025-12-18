import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { ClassTable, SubjectTable, TeachersTable, TeacherSubjectClassTable } from "../../schema/class.schema";
import { Set } from "../../types/type"
import { baseTeacherReturn, TeacherBody } from "./teachers.types";
import { usersTable } from "../../schema/users.schema";
import { hash } from "../../security/pswd.sec";

export const TeachersDatabase = {
    createTeacher: async ({ body , set, userInfo }: { set: Set, body: TeacherBody; userInfo: { username: string; password: string} }): Promise<baseTeacherReturn> => {
        try {
            // 0. Check if same teacher exists
            const isExist = await db.select()
                                .from(usersTable)
                                .where(eq(usersTable.username, userInfo.username));

            if(isExist.length > 0) {
                set.status = "Conflict";
                return {
                    success: false,
                    message: "Teacher with this name already exists"
                }
            }

            // 1. Extract and clean arrays
            const subjectNames = body.subjects.split(",").map(s => s.trim()).filter(Boolean);
            const classNames = body.class.split(",").map(c => c.trim()).filter(Boolean);
            
            // transaction ensure no partial inserts to cause errors later it rolls back if detects throw new Error
            const msg = await db.transaction(async tx => {
                // 2. Validate classes and subjects
                const ExistingSubjects = await tx.select({
                    name: SubjectTable.name
                }).from(SubjectTable)
                .where(inArray(SubjectTable.name, subjectNames))
                .then(n => n.map(s => s.name));

                const ExistingClasses = await tx.select({
                    name: ClassTable.name
                }).from(ClassTable)
                .where(inArray(ClassTable.name, classNames))
                .then(n => n.map(c => c.name));

                const validSubjects = subjectNames.filter( name => ExistingSubjects.includes(name));
                const validClasses = classNames.filter(cls => ExistingClasses.includes(cls));
                
                if (validClasses.length === 0 || validSubjects.length === 0) {
                    set.status = "Bad Request";
                    return {
                        success: false,
                        message: "Subjects and class cannot be empty"
                    }
                }

                // create the user first
                const [user] = await tx
                    .insert(usersTable)
                    .values({
                        role: "teacher",
                        username: userInfo.username,
                        password: await hash(userInfo.password),
                        phone: body.phone
                    }).returning({
                        userId: usersTable.id,
                        teacherName: usersTable.username
                    })

                // 3. Create a teacher
                const [teacher] = await tx
                    .insert(TeachersTable)
                    .values({
                        userId: user.userId,
                    })
                .returning({ id: TeachersTable.id });

                const subjectIds = await tx.select({
                    id: SubjectTable.id
                }).from(SubjectTable)
                .where(inArray(SubjectTable.name, validSubjects));

                const classIds = await tx.select({
                    id: ClassTable.id
                }).from(ClassTable)
                .where(inArray(ClassTable.name, validClasses));

                // Create all (subject × class) combinations
                const links = [];
                for (const subj of subjectIds) {
                    for (const cls of classIds) {
                        links.push({
                            teacherId: teacher.id,
                            subjectId: subj.id,
                            classId: cls.id,
                        });
                    }
                }

                // insert into juction table
                if (links.length > 0) {
                    await tx.insert(TeacherSubjectClassTable).values(links) // array is looped automatically
                    .onConflictDoNothing(); // for postgreSQL only
                }

                return `
                    ${user.teacherName} is saved successfully, with ${classIds.length} class(es) and ${subjectIds.length} subject(s)
                `
            });

            if (typeof msg === "object") { return msg };

            set.status = "OK";
            return {
                success: true,
                message: msg.trim()
            }

        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message : 
                            "Something went wrong in creating teacher"
            }
        }
    },
    getTeachers: async ({ set }: { set: Set }) => {
        try {
            // 1. Get all teachers

            set.status = "OK";
            return {
                success: true,
                message: "Teachers fetched successfully",
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in getting teachers"
            }
        }
    },
    teacherQueries: async ({ set, teacherId, subjectName, className }: { 
        set: Set, teacherId: string; subjectName: string; className: string  
    }) => {
        try {
            // 1. Get all subjects and classes of this teacher
            const teacherData = await db
                .select({
                    subjectName: SubjectTable.name,
                    className: ClassTable.name,
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                .where(eq(TeachersTable.id, teacherId));
            

            // 2. get all classes this teacher teaches maths
            const result = await db
                .select({
                    className: ClassTable.name,
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                .where(
                    and(
                        eq(TeachersTable.id, teacherId),
                        eq(SubjectTable.name, subjectName)
                    )
                );
            // 3. Subjects this teacher teaches in Form 1
            const ans = await db
                .select({
                    subjectName: SubjectTable.name
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                
                .where(
                    and(
                        eq(TeachersTable.id, teacherId),
                        eq(ClassTable.name, className)
                    )
                );

            // 4. how many subjects this teacher teachs
            const totalSubjects = teacherData.map(t => t.className).length;

            // 5. how many classes this teacher teachs
            const totalClasses = teacherData.map(t => t.subjectName).length;
            set.status = "OK";
            return {
                success: true,
                message: "Teachers fetched successfully",
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in getting teacher queries"
            }
        }
    },
    subjectQueries: async ({ set, subjectName, className }: { set : Set, subjectName: string, className: string }) => {
        try {
            // 1. which teachers teachs maths and their classes
            const teachersTeachs = await db
                .select({
                    teacherName: usersTable.username,
                    className: ClassTable.name
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                .innerJoin(usersTable, eq(TeachersTable.userId, usersTable.id))
                .where(eq(SubjectTable.name, subjectName));
            
            // 2. which classes maths is taught (same above query)

            // 3. who teaches math in form 1
            const teacherTeachClass = await db
                .select({
                    teacherName: usersTable.username,
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                .innerJoin(usersTable, eq(TeachersTable.userId, usersTable.id))
                .where(
                    and(
                        eq(SubjectTable.name, subjectName),
                        eq(ClassTable.name, className)
                    )        
                );
            // 4. count total teachers teachs math in school (count query 1)
            
                
                
        } catch (error) {
            set.status = "Internal Server Error"
            return {
                success: false,
                message: error instanceof Error ?
                            error.message : 
                            "Something went wrong in subject queries"
            }
        }
    },
    classQueries: async ({ set, className }: { set: Set, className: string }) => {
        try {
            // 1. what subjects are taught in form 1 and who teaches form 1
            await db
                .select({
                    subjectName: SubjectTable.name,
                    teachersName: usersTable.username
                })
                .from(TeacherSubjectClassTable)
                .innerJoin(TeachersTable, eq(TeacherSubjectClassTable.teacherId, TeachersTable.id))
                .innerJoin(SubjectTable, eq(TeacherSubjectClassTable.subjectId, SubjectTable.id))
                .innerJoin(ClassTable, eq(TeacherSubjectClassTable.classId, ClassTable.id))
                .innerJoin(usersTable, eq(TeachersTable.userId, usersTable.id))
                .where(eq(ClassTable.name, className));

            // 2. how many subjects and how many teachers teachs form 1

        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in class queries"
            }
        }
    },
    analyticsQueries: async ({ set }: { set: Set }) => {
        try {
            // 1. how may classes each teacher handle
            // 2. how many subjects each teacher teachs
            // 3. how many teachers per subject
            // 4. which teacher teaches most subjects
            // 5. which subject is taught by most teachers
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ?
                            error.message :
                            "Something went wrong in querying analytics"
            }
        }
    },
    advancedAnalytics: async ({ set }: { set: Set }) => {
    // Are there subjects with no assigned teacher? → Left-join subjects → teacher_subject_class_table → check null.

    // Are there classes with missing subjects? → Left-join classes → teacher_subject_class_table → check null.

    // List all teachers without any assignments yet.

    // List all subjects taught by more than one teacher in the same class.

    // Which classes have multiple teachers teaching the same subject?

    // Does every subject have at least one teacher?
    }
}