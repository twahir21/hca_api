import { and, asc, count, desc, eq, gte, inArray, like, lte, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { contactsTable, groupContactsTable, groupsTable, recentMessagesTable, sentSmsCountTable } from "../../schema/sms.schema";
import { Set } from "../../types/type";
import { createGroup, editGroup, GroupedResult, massiveContact, recentSMS, smsAnalytics } from "./sms.types";
import { cacheExists, cacheGet, cacheSave } from "../../cache/redis.cache";
import { cacheNames } from "../../const/cache.const";

export type returnType = {
    success: boolean;
    message: string;
    fetchContactsData?: {
        data: {id: string; name: string; phone: string}[]
        total: number
    },
    totalGroups?: number, 
    getGroups?: GroupedResult[] 
}


export const smsDatabase = {
    createContact: async ({ name, phone }: { name: string; phone: string }, set: Set): Promise<returnType> => {
        try {
            // 1. check if name or phone exixts
            const count = await db.select({
                name: contactsTable.name,
                phone: contactsTable.phone
            })
            .from(contactsTable)
            .where(or(
                eq(contactsTable.name, name),
                eq(contactsTable.phone, phone)
            ));

            if(count.length > 0){
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Phone number or name is already taken."
                }
            }
            // 2. If pass, insert to database
            await db.insert(contactsTable).values({
                // format name to Title Case
                name: name.trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), 
                phone
            });
            set.status = "OK";
            return {
                success: true,
                message: "Contact registered successfully!"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in creating new Contact"
            }
        }
    },
    fetchContacts: async ({ currentPage, limit, search, set }: { currentPage: string; limit: string; search: string; set: Set }): Promise<returnType> => {
        try {
            // 0. Define variables
            const page = parseInt(currentPage) || 1;
            const perPage = parseInt(limit) || 5;
            const offset = (page - 1) * perPage;

            // check redis first
            const isData = await cacheExists(cacheNames.CONTACTS);
            const isTotal = await cacheExists(cacheNames.CONTACTS_TOTAL);

            if (isData && isTotal && page === 1 && perPage === 5 && !search) {
                const data = await cacheGet(cacheNames.CONTACTS);
                const total = await cacheGet(cacheNames.CONTACTS_TOTAL);

                if (data && total) {
                    set.status = "OK";
                    return {
                        success: true,
                        message: "Contacts fetched successfully",
                        fetchContactsData: { data, total }
                    }
                }
            }

            // 1. define where clause for search
            const whereClause = search
            ? or(
                like(contactsTable.name, `%${search}%`),  // partial name match
                eq(contactsTable.name, search),           // strict name match

                like(contactsTable.phone, `%${search}%`), // partial phone match
                eq(contactsTable.phone, search)           // strict phone match
            )
            : undefined;
            
            // 2 . fetch data
            const data = await db.select({
                id: contactsTable.id,
                name: contactsTable.name,
                phone: contactsTable.phone,
            }).from(contactsTable)  
            .where(whereClause)  // only applied if search provided
            .limit(perPage)
            .offset(offset)
            .orderBy(asc(contactsTable.name));

            // 3. count total
            const total = await db.select({
                total: count(contactsTable.id)
            }).from(contactsTable)
            .where(whereClause)
            .then( c => Number(c[0].total ?? 0))
            
            // 4. return if not found
            if(data.length === 0){
                set.status = "Not Found";
                return {
                    success: false,
                    message: "No contacts available"
                }
            }
            if (!search && page === 1 && perPage === 5) {
                // cache the data in redis for next time
                cacheSave({ name: cacheNames.CONTACTS, value: data });
                cacheSave({ name: cacheNames.CONTACTS_TOTAL, value: total });
            }

            set.status = "OK";
            return {
                success: true,
                message: "Contacts fetched successfully",
                fetchContactsData: { data, total }
            }
        } catch (error) {
            set.status = "Internal Server Error"
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in fetching contacts"
            } 
        }
    },
    deleteContacts: async ({ set, body }: { set: Set, body: { id: string; } }): Promise<returnType> => {
        try {
            await db.delete(contactsTable).where(eq(contactsTable.id, body.id));

            set.status = "OK";
            return {
                success: true,
                message: "Contact deleted successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in deleting contacts"
            } 
        }
    },
    getPhoneNumbers: async ({ ids } : { ids: string[] }): Promise<string []> => {
        try {
            const phoneNumbers = await db.select({
                phone: contactsTable.phone
            }).from(contactsTable)
            .where(inArray(contactsTable.id, ids))
            .then(c => c.map(c => c.phone));
            
            return phoneNumbers;
        } catch (error) {
            return [];
        }
    },
    createMassiveContacts: async ({ body, set }: { body: massiveContact; set: Set }): Promise<returnType> => {
    try {
        for (const contact of body) {
        // 1. check if name or phone exists in DB
        const exists = await db
            .select()
            .from(contactsTable)
            .where(
            or(
                eq(contactsTable.name, contact.name),
                eq(contactsTable.phone, contact.phone)
            )
            );

        if (exists.length > 0) {
            set.status = "Bad Request";
            return {
            success: false,
            message: `Phone number or name is already taken: ${contact.phone}`,
            };
        }

        // 2. If pass, insert to database
        await db.insert(contactsTable).values({
            name: contact.name,
            phone: contact.phone,
        });
        }

        set.status = "OK";
        return {
        success: true,
        message: "Contacts uploaded and saved successfully",
        };
    } catch (error) {
        set.status = "Internal Server Error";
        return {
        success: false,
        message:
            error instanceof Error
            ? error.message
            : "Something went wrong in uploading contacts",
        };
    }
    },
    updateContact: async ({ body, set }: { body: { id: string; name: string; phone: string;}, set: Set }): Promise<returnType> => {
        try {
            // 1. Update the contact
            await db.update(contactsTable)
            .set({
                // update to Title Case
                name: body.name.trim().toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                phone: body.phone
            })
            .where(eq(contactsTable.id, body.id));
            set.status = "OK";
            return {
                success: true,
                message: "Contact updated successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error"
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in updating contact"
            }
        }
    },
    createGroup: async ({ body, set }: { body: createGroup; set: Set }): Promise<returnType> => {
        try {
            // 0. check if group name exists
            const isExist = await db
                .select({ id: groupsTable.id })
                .from(groupsTable)
                .where(eq(groupsTable.name, body.groupName));

            if(isExist.length > 0) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Group name already exists"
                }
            }
            // 1. create group
            const group = await db.insert(groupsTable).values({
                name: body.groupName
            }).returning().then(g => g[0].id);

            // 2. loop contacts selected and insert (bulk insert)
            // * don't use for (const contact of ..) because it will be too slow one by one
            await db.insert(groupContactsTable).values(body.contacts.map(c => ({
                contactId: c,
                groupId: group
            })));

            set.status = "OK";
            return {
                success: true,
                message: "Group created successfully",
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in creating group"
            }
        }
    },
    getGroups: async ({ currentPage, limit, search, set }: {
        currentPage: string;
        limit: string;
        search: string;
        set: Set;
    }): Promise<returnType> => {
    try {
        const page = parseInt(currentPage) || 1;
        const perPage = parseInt(limit) || 5;
        const offset = (page - 1) * perPage;

        // 1️⃣ Base filter for search
        const whereClause = search
        ? or(
            like(groupsTable.name, `%${search}%`),
            eq(groupsTable.name, search)
            )
        : undefined;

        // 2️⃣ Fetch distinct groups (paginated)
        const groupsPage = await db
        .select({
            id: groupsTable.id,
            groupName: groupsTable.name,
        })
        .from(groupsTable)
        .where(whereClause)
        .orderBy(asc(groupsTable.name))
        .limit(perPage)
        .offset(offset);

        if (groupsPage.length === 0) {
        set.status = "Not Found";
            return {
                success: false,
                message: "No groups found",
            };
        }

        const groupIds = groupsPage.map((g) => g.id);

        // 3️⃣ Fetch contacts for only those groups
        const groupContacts = await db
        .select({
            groupId: groupContactsTable.groupId,
            contactName: contactsTable.name,
            contactPhone: contactsTable.phone,
        })
        .from(groupContactsTable)
        .innerJoin(contactsTable, eq(groupContactsTable.contactId, contactsTable.id))
        .where(inArray(groupContactsTable.groupId, groupIds));

        // 4️⃣ Merge contacts with groups
        const grouped = groupsPage.map((group) => {
        const contacts = groupContacts
            .filter((c) => c.groupId === group.id)
            .map(({ contactName, contactPhone }) => ({ contactPhone, contactName: contactName.trim().toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") }));

            return {
                groupId: group.id,
                groupName: group.groupName
                    .trim()
                    .toLowerCase()
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" "),
                totalContacts: contacts.length,
                contacts,
            };
        });

        // 5. count total groups 
        const totalGroups = await db
        .select({ count: count(groupsTable.id) })
        .from(groupsTable)
        .where(whereClause ?? undefined).then((r) => Number(r[0].count));
        

        set.status = "OK";
            return {
                success: true,
                message: "Groups fetched successfully",
                totalGroups,
                getGroups: grouped,
            };
    } catch (error) {
        set.status = "Internal Server Error";
        return {
        success: false,
        message:
            error instanceof Error
            ? error.message
            : "Something went wrong while fetching groups",
        };
    }
    },
    deleteGroup: async ({ set, body }: { set: Set, body: { id: string; } }): Promise<returnType> => {
        try {
            await db.delete(groupsTable).where(eq(groupsTable.id, body.id));
            // cascades automatically delete leftover relations in groupsContactTable.
            set.status = "OK";
            return {
                success: true,
                message: "Group deleted successfully"
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in deleting Group"
            } 
        }
    },
    editGroup: async ({ body, set }: { body: editGroup, set: Set }) => {
        try {
        // 1. if groupName is edited, update groupName
        if (body.groupName.length > 0) {
            await db.update(groupsTable).set({ name: body.groupName }).where(eq(groupsTable.id, body.groupId));
        }

        // 2️⃣ Remove all existing contacts for this group
        await db.delete(groupContactsTable)
         .where(eq(groupContactsTable.groupId, body.groupId));

        // 3️⃣ Insert the new contacts
        if (body.contacts.length > 0) {
            await db.insert(groupContactsTable).values(
                body.contacts.map((contactId) => ({
                groupId: body.groupId,
                contactId,
                }))
            );
        }

    
        set.status = "OK";
            return {
                success: true,
                message: "Group updated successfully"
            }
        } catch (error) {
            console.error(error)
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in editing Group"
            }
        }
    },
    saveSMS: async ({ message, groupName, set }: { message: string; groupName: string; set: Set }) => {
        try {
            // 0. Check if the message exists
            const isExist = await db.select({ id: recentMessagesTable.id })
                                .from(recentMessagesTable)
                                .where(eq(recentMessagesTable.message, message));

            if (isExist.length > 0) {
                set.status = "Accepted";
                return {
                    success: true,
                    message: "SMS sent successfully but it already exist."
                }
            }
            // 1. save the message to the database 
            await db.insert(recentMessagesTable).values({
                message,
                groupName
            })
            set.status = "OK";
            return {
                success: true,
                message: "SMS sent successfully and saved"
            }
        } catch (error) {
            set.status = "Accepted";
            return {
                success: true,
                message: "SMS sent successfully but something went wrong in saving SMS"
            }
        }
    },
    smsAnalytics: async ({ set }: { set: Set }): Promise<smsAnalytics> => {
        try {
            // 1. define today range of time
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // 2. count total SMS per day
            const smsToday = await db
            .select({ count: count(sentSmsCountTable.id) })
            .from(sentSmsCountTable)
              .where(
                and(
                gte(sentSmsCountTable.createdAt, startOfDay),
                lte(sentSmsCountTable.createdAt, endOfDay)
                )
            )
            .then((r) => Number(r[0].count));
            
            // 3. get total groups
            const totalGroups = await db
                .select({ count: count(groupsTable.id) })
                .from(groupsTable)
                .then((r) => Number(r[0].count));
            
            // 4. get total contacts
            const totalContacts = await db
                .select({ count: count(contactsTable.id) })
                .from(contactsTable)
                .then((r) => Number(r[0].count));

            set.status = "OK";
            return {
                success: true,
                message: "SMS analytics fetched successfully",
                data: { smsToday, totalGroups, totalContacts }
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in fetching SMS analytics",
                data: { smsToday: 0, totalGroups: 0, totalContacts: 0 }
            }
        }
    },
    getRecentSMS: async ({ set, currentPage, limit, search }: { set: Set; currentPage: string; limit: string; search: string }): Promise<recentSMS> => {
        try {
                const page = parseInt(currentPage) || 1;
                const perPage = parseInt(limit) || 5;
                const offset = (page - 1) * perPage;

                // Base filter for search
                const whereClause = search
                ? or(
                    like(recentMessagesTable.message, `%${search}%`),
                    eq(recentMessagesTable.message, search)
                    )
                : undefined;

            const recentSMS = await db
                    .select()
                    .from(recentMessagesTable)
                    .where(whereClause)
                    .orderBy(desc(recentMessagesTable.createdAt))
                    .limit(perPage)
                    .offset(offset)

            if (recentSMS.length === 0) {
                set.status = "OK";
                return {
                    success: true,
                    message: "No recent SMS found",
                    data: [],
                    totalSMS: 0
                }
            }

            // count total sms
            const totalSMS = await db
                .select({ count: count(recentMessagesTable.id) })
                .from(recentMessagesTable)
                .then((r) => Number(r[0].count));
                    
            set.status = "OK";
            return {
                success: true,
                message: "Recent SMS fetched successfully",
                data: recentSMS,
                totalSMS
            }
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in fetching recent SMS",
                data: [],
                totalSMS: 0
            }
        }
    },
}