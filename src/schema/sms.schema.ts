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
import { uniqueIndex } from "drizzle-orm/pg-core";

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
    createdAt: timestamp("created_at").defaultNow().notNull()
})

// 5. counts of sent sms  (delete after a day)
export const sentSmsCountTable = pgTable("sent_sms_count", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    count: text("count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
})