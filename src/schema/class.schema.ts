import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ClassTable = pgTable("classes_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

export const SubjectTable = pgTable("subjects_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});