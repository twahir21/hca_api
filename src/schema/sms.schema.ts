import { unique, uniqueIndex } from "drizzle-orm/pg-core";
import { schoolTable, usersTable } from "./core.schema";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
// 1. Contacts
export const contactsTable = pgTable("contacts_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    phone: text("phone").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
}, t => ({
    contactIndx: index("contact_indx").on(t.schoolId, t.phone),
    uniquePhoneContacts: unique().on(t.phone, t.schoolId)
})
);

// 2. Groups
export const groupsTable = pgTable("groups_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
}, t => ({
    groupsIndx: index("group_indx").on(t.schoolId, t.name),
    uniqueNameInGrp: unique().on(t.schoolId, t.name)
}));

// 3. Group <-> Contacts (many-to-many)
export const groupContactsTable = pgTable("group_contacts_table", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  groupId: uuid("group_id").references(() => groupsTable.id, { onDelete: "cascade" }).notNull(),
  contactId: uuid("contact_id").references(() => contactsTable.id, { onDelete: "cascade" }).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
    // ensure contact appears only once in a group
  uniqueGroupContact: uniqueIndex("unique_group_contact").on(table.groupId, table.contactId),
}));


// 4. Messages
export const recentMessagesTable = pgTable("recent_messages", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    message: text("message").notNull(),
    groupName: text("group_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
})

// 5. counts of sent sms  (delete after a day)
export const sentSmsCountTable = pgTable("sent_sms_count", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    count: text("count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull().unique(),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
})