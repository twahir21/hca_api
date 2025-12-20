// 0. Run with :
//? bun --env-file=../../.env ./seed.admin.ts

import { eq } from "drizzle-orm"
import { db } from "../connections/drizzle.conn"
import { rolesTable, userProfilesTable, userRolesTable, usersTable } from "../schema/core.schema"
import { hash } from "../security/pswd.sec"
import { ROLES } from "../const/roles.const"
import { LEVELS } from "../const/levels.const"
import { levelsTables } from "../schema/academic.schema"


const superAdminSeed = async () => {
    // 0. ENSURE .ENV IS LOADED
    const { 
        ADMIN_USERNAME, 
        ADMIN_PASSWORD, 
        ADMIN_PHONE, 
        ADMIN_EMAIL, 
        ADMIN_BULKSMS,
        ADMIN_FULLNAME 
    } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_PHONE || !ADMIN_EMAIL || !ADMIN_BULKSMS || !ADMIN_FULLNAME) {
        throw new Error("One or more admin environment variables are missing");
    }
    try {
        // 1. check if super-admin role
        const [isExist] = await db.select({ id: rolesTable.id })
            .from(rolesTable).where(eq(rolesTable.role, "super-admin"))
        
        if(isExist) {
            throw new Error("Super Admin role already used")
        }

        await db.transaction(async tx => {
            // 2. create user and profile
            const [userID] = await tx.insert(usersTable).values({
                username: process.env.ADMIN_USERNAME!.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                passwordHash: await hash(process.env.ADMIN_PASSWORD!)
            }).returning({ id: usersTable.id });

            await tx.insert(userProfilesTable).values({
                email: ADMIN_EMAIL,
                phone: ADMIN_PHONE,
                fullName: ADMIN_FULLNAME,
                userId: userID.id
            })

            // 3. insert all roles (no more manual work to /${role}) and all levels
            await tx
                .insert(rolesTable)
                .values(ROLES.map(role => ({ role })))
                .onConflictDoNothing();
            
            await tx
                .insert(levelsTables)
                .values(LEVELS.map(levels  => ({ levels })))
                .onConflictDoNothing();

            const [superAdmin] = await tx.select({
                id: rolesTable.id
            }).from(rolesTable).where(eq(rolesTable.role, "super-admin"))

            // 4. connect user to roles super admin can have schoolId = null
            await tx.insert(userRolesTable).values({
                userId: userID.id,
                roleId: superAdmin.id,
                isDefaultRole: true
            })

        });
        console.log("✅ Super admin seed completed safely")
    } catch (error) {
        console.log(error instanceof Error ? error.message : "Error running super-admin seed")
    }
}

await superAdminSeed();