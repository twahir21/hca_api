import { index, pgEnum, pgTable, primaryKey, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { schoolTable, usersTable } from "./core.schema";

// enums. must be export for database to see its types
export const levelsEnum = pgEnum("level", ["pre-primary", "primary", "O-level", "A-level", "higher-education"])

// ────────────────────────────────
// 1. LEVELS TABLE
// ────────────────────────────────
// we have 5 levels pre-primary, primary, o-level, A-level, higher education (manual insert)
export const levelsTables = pgTable("levels_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  levels: levelsEnum("level").notNull(), // (e.g. Primary, pre-school, kg etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});



// ────────────────────────────────
// 2. CLASSES TABLE
// ────────────────────────────────
export const ClassTable = pgTable("classes", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    // LevelID allowes multiple levels e.g. nursery & primary
    levelId: uuid("level_id").notNull().references(() => levelsTables.id, { onDelete: "restrict" }), 
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" })
}, t => ({
        uniqueNamePerSchool: unique().on(t.name, t.schoolId), // unique name per school
        schoolIndx: index("idx_class_school").on(t.schoolId) 
    })
);


// ────────────────────────────────
// 3. SUBJECTS TABLE
// ────────────────────────────────
export const SubjectTable = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }), // optional (e.g. COU105),
  schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  // LevelID should not be here Mathematics can be in any level
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
        uniqueNamePerSchool: unique().on(t.name, t.schoolId), // unique name per school
        schoolIndx: index("idx_subj_school").on(t.schoolId) 
    })
);


// ─────────────────────────────────────────────────────────────────────────────────
// 4. JOINT TABLE subject <-> class (many-to-many relation)
// ─────────────────────────────────────────────────────────────────────────────────
// maths belong to class 1 and 2 but also class 3 has math, bio, e.t.c 
export const subjectClassTable = pgTable("subject_class_levels", {
  subjectId: uuid("subject_id").references(() => SubjectTable.id, { onDelete: "cascade" }).notNull(),
  classId: uuid("class_id").references(() => ClassTable.id, { onDelete: "cascade" }).notNull(),
}, 
  (t) => ({
    pk: primaryKey({ columns: [t.subjectId, t.classId], name: "pk_subject_class" }), // composite key
  })
);

// ─────────────────────────────────────────────────────────────────────────────────
// 5. JOINT TABLE subject <-> levels (many-to-many relation)
// ─────────────────────────────────────────────────────────────────────────────────
// 
export const subjectLevelTable = pgTable("subject_levels", {
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => SubjectTable.id, { onDelete: "cascade" }),

  levelId: uuid("level_id")
    .notNull()
    .references(() => levelsTables.id, { onDelete: "cascade" }),
}, t => ({
  pk: primaryKey({ columns: [t.subjectId, t.levelId] }),
}))

