import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
// 1. Contacts
export const contactsTable = pgTable("contacts_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    phone: text("phone").notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// 2. Groups
export const groupsTable = pgTable("groups_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().unique(), 
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// 3. Group <-> Contacts (many-to-many)
export const groupContactsTable = pgTable("group_contacts_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    groupId: uuid("group_id").references(() => groupsTable.id, { onDelete: "cascade" }).notNull(),
    contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "cascade" }).notNull(),
    addedAt: timestamp("added_at").defaultNow().notNull()
});


// 4. Messages
export const recentMessagesTable = pgTable("recent_messages", {
    id: uuid().defaultRandom().primaryKey(),
    message: text("message").notNull(),
    role: text("user_role", { enum: ["admin", "teacher", "parent"]}).default("parent"),
    groupId: uuid("group_id").references(() => groupsTable.id, { onDelete: "cascade" }),
    contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow()
})