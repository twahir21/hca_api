import { pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users.schema";
// ────────────────────────────────
// CLASSES TABLE
// ────────────────────────────────
export const ClassTable = pgTable("classes_table", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 100 }).unique().notNull(),
    level: varchar("level", { length: 50 }), // optional (e.g. Primary, pre-school, etc.)
    createdAt: timestamp("created_at").defaultNow().notNull()
});


// ────────────────────────────────
// SUBJECTS TABLE
// ────────────────────────────────
export const SubjectTable = pgTable("subjects_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  code: varchar("code", { length: 20 }), // optional (e.g. COU105)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ────────────────────────────────
// TEACHERS TABLE
// ────────────────────────────────
export const TeachersTable = pgTable("teachers_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



// ──────────────────────────────────────────
// JUNCTION TABLE: Teacher ↔ Subject ↔ Class
// ──────────────────────────────────────────
export const TeacherSubjectClassTable = pgTable(
  "teacher_subject_class_table",
  {
    teacherId: uuid("teacher_id")
      .references(() => TeachersTable.id)
      .notNull(),
    subjectId: uuid("subject_id")
      .references(() => SubjectTable.id)
      .notNull(),
    classId: uuid("class_id")
      .references(() => ClassTable.id)
      .notNull(),
    assignedAt: timestamp("assigned_at").defaultNow(),
  },
  (t) => ({
    // composite key to ensure no single teacher can be assigned the same subject to the same class more than once.
    pk: primaryKey({ columns: [t.teacherId, t.subjectId, t.classId] }), // composite key
  })
);
