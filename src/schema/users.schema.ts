import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
    id: uuid().defaultRandom().primaryKey(),
    role: text("role", { enum: ["admin", "parent", "teacher", "invalid"]}).notNull().default("admin"),
    username: text("username").unique().notNull(),
    password: text("password").notNull(),
    phone: text("phone").unique().notNull()
})
