import { and, asc, count, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { Set } from "../../types/type";
import { rolesTable, userProfilesTable, userRolesTable } from "../../schema/core.schema";
import { db } from "../../connections/drizzle.conn";
import { staffData } from "./staff.types";
import { Return } from "../../func/otp.func";

export const staffDatabase = {
    getStaffs: async ({ set, query, schoolId, userId }: { set: Set; userId: string; schoolId: string; query: Record<string, string> }): Promise<Return & staffData> => {
        try {
            // 1. initiate pagination variables
            const page = parseInt(query.page) || 1;
            const perPage = parseInt(query.limit) || 5;
            const offset = (page - 1) * perPage; 

            // 2. define where for searching ...
            const whereClause = query.search
            ? or(
                like(userProfilesTable.fullName, `%${query.search}%`),
                eq(userProfilesTable.fullName, query.search)

                // owner's info (email/phone)
                // address
                // ID
                )
            : undefined;

            const [totalUsers] = await db.select({ count: count(userProfilesTable) })
                    .from(userProfilesTable)
                    .where(
                        and(
                            ne(userProfilesTable.userId, userId),
                            ne(userProfilesTable.fullName, process.env.ADMIN_FULLNAME!)
                        )
                    )

        const userProfile = await db.select()
            .from(userProfilesTable)
            .leftJoin(userRolesTable, eq(userRolesTable.userId, userProfilesTable.userId))
            .leftJoin(rolesTable, eq(rolesTable.id, userRolesTable.roleId))
            .where(
                and(
                    eq(userRolesTable.schoolId, schoolId),
                    ne(userRolesTable.userId, userId), // neglect this user Profile
                    whereClause
                )
            )
            .orderBy(asc(userProfilesTable.fullName))
            .limit(perPage)
            .offset(offset)
            .then(u => u.map(p => p.user_profiles))

            const userIds = userProfile.map(p => p.userId);
                
            const rolesByUser = await db 
                .select({ userId: userRolesTable.userId, role: rolesTable.role, }) 
                .from(userRolesTable) 
                .innerJoin(rolesTable, eq(rolesTable.id, userRolesTable.roleId)) 
                .where(inArray(userRolesTable.userId, userIds)); 
                
            const data = userProfile.map(profile => ({ ...profile, roles: rolesByUser .filter(r => r.userId === profile.userId) .map(r => r.role), }));

            
            set.status = "OK";
            return {
                success: true,
                message: "Schools fetched successfully!",
                data,
                total: totalUsers.count
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
}