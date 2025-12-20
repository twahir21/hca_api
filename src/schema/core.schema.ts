import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { ClassTable, SubjectTable } from "./academic.schema";

// Feature,School Admin (school-admin role),Principal (principal role)
// Primary Focus,"Operational Management (daily logistics, records, resources).","Instructional Leadership (academic quality, staff performance, school vision)."
// Scope of Work,"Executing policies, managing staff/student data entry, timetabling, managing inventory (in coordination with other roles like bursar or registrar).","Setting the school's vision, making high-level policy, final disciplinary decisions, curriculum oversight."
// System Access,"High-level access to read and write operational and data records (users, enrollment, schedules, logistics). They are the main day-to-day data handlers.","High-level access to view reports and aggregated data (student achievement, financial summaries). They have ultimate authority but often delegate day-to-day data entry."
// Analogy,The Chief Operating Officer (COO) of the school.,The Chief Executive Officer (CEO) and head of the faculty.

export const roleEnums = pgEnum("role", [
    'super-admin',
    'school-admin', // often second master of school
    'principal', // Head master of the school CEO
    'bursar',
    'dorm-master',
    'matron',
    'patron',
    'transport-officer',
    'driver',
    'store-keeper',
    'class-teacher',
    'academic-master',
    'displinary-officer',
    'HOD',
    'ict-officer',
    'librarian',
    'meal-officer',
    'nurse',
    'parent',
    'student', // Added: Crucial for systems allowing student interaction
    'registrar',
    'teacher',
    'sports-master',
    'lab-technician',
    'cleaning-officer',
    'election-officer',
    'debate-manager',
    'trips-officer',
    'maintainance-officer',
    'counselor', // Added: For student guidance and sensitive data access
]);

// charge per user count of that school e.g. 1000 sh per month per user
export const subscription = pgEnum("subscription_plan", [
    'Starter', // uses core schemas + communications + website/app creation, 
    'Growth', // medium features like finance,  dorm management, store management, library, support department and extra curriculum e.g. sports
    'Enterprice' // advanced features like online classes & quizes, AI tutor, smart attendance (e.g. face recognition, fingerprint), and GPS for schoolBus
])

export const genderEnums = pgEnum("gender", ["male", "female"]);
export const periodEnums = pgEnum("period", ["pre-morning", "morning", "afternoon", "evening", "night"])
export const attendanceStatus = pgEnum("status", ["present", "absent", "permitted"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended", "pending"]);
export const schoolStatusEnum = pgEnum("school_status", ["approved", "inactive", "suspended", "expired", "pending"]);
// inactive -> long no use of account (dormant) or banned and wait to be deleted. (incorrect link share.)
// suspended -> account not paid (and this is done by admin)
// pending -> wait for the final approval e.g. OTP verification

// todo JWT usually has 5-10 json values
// ********************************************************************************
// jwt token -> user-status, schoolId, subscription_plan, userId, role: [], selectedRole
// ******************************************************************************
// ------------------------------------
// 1. SCHOOLS TABLE
// ------------------------------------
export const schoolTable = pgTable("school", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).unique().notNull(), // use code to unique fetch school
    address: text("address").notNull(),
    bulkSMSName: text("bulk_sms_name"),
    phone: varchar("phone", { length: 20 }).notNull(), // two schools can have same owner.
    subscriptionPlan: subscription("subscription_plan").default("Enterprice").notNull(),
    status: schoolStatusEnum("school_status").default("pending").notNull(),
    email: text("email").notNull(),
    expiredAt: timestamp("expired_at"),
    lastActivity: timestamp("last_activity").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
}, t => ({
    codeIndx: index("idx_code_school").on(t.code) // fetch school per code
  })
)


// ------------------------------------
// 2. ROLES TABLE
// ------------------------------------ 
export const rolesTable = pgTable("roles", {
    id: uuid("id").defaultRandom().primaryKey(),
    role: roleEnums("role").notNull(),
    description: text("description"),
    rank: integer("rank"),
    createdAt: timestamp("created_at").defaultNow()
}); // i will prepare sheet of rank -> role -> description (hard-coded set of permissions)



// -----------------------------------
// 3. USERS TABLE
// ------------------------------------
export const usersTable = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").unique().notNull(), // capital letter + 2-4 numbers
    passwordHash: text("password_hash").notNull(),
    lastLogin: timestamp("last_login"),
    status: userStatusEnum("user_status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()) // auto-update when column changes
}, t => ({
    // parents may have students in different schools
    schoolUsernameIndx: index("idx_school_username").on(t.username) // first is given priority if one is to be used
  })
);

// -----------------------------------
// 3. USER PROFILE TABLE
// ------------------------------------
export const userProfilesTable = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  address: text("address"),
  gender: genderEnums("gender"),
  dob: timestamp("dob"),
  userId: uuid("profile_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});



// ---------------------------------------------
// 4. USER-ROLE TABLE ( many-to-many relation)
// ---------------------------------------------
export const userRolesTable = pgTable("user_role", {
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
    isDefaultRole: boolean("is_default").default(false).notNull(),
    schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }),
}, t => ({
  uniqueUserRoleScope: unique("uniq_user_role_scope").on(t.userId, t.roleId, t.schoolId),
  idxUserSchool: index("idx_user_role_user_school").on(t.userId, t.schoolId),
}));


// ────────────────────────────────
// 9. TEACHERS TABLE
// ────────────────────────────────
export const TeachersTable = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull().unique(),
  schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").notNull().references(() => userProfilesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
    schoolUserIdIndx: index("idx_teacher_school_userId").on(t.schoolId, t.userId) // first is given priority if one is to be used
  })
);

// ───────────────────────────────────────────────
// 10. TERMS TABLE
// ───────────────────────────────────────────────
export const termTable = pgTable("term", {
    id: uuid("id").defaultRandom().primaryKey(),
    term: varchar("term", { length: 20 }).notNull(), // e.g. "Term 1"
    schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, (t) => ({
    uniqueTermPerSchool: unique().on(t.schoolId, t.term)
}))

// ───────────────────────────────────────────────
// 11. ACADEMIC YEAR
// ───────────────────────────────────────────────
export const academicYearTable = pgTable("academic_year", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 20 }).notNull(), // e.g. "2025/2026"
  termId: uuid("term_id").notNull().references(() => termTable.id, { onDelete: "cascade"}),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
  isCurrent: boolean("is_current").default(false), // (used to indicate if the row of academic year is current or past)
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

},t => ({
        uniqueNamePerSchool: unique().on(t.schoolId, t.name), // unique name per school
        checkDates: check("check_dates", sql`"end_date" > "start_date"`)

    })
);


// ───────────────────────────────────────────────
// 12. JUNCTION TABLE: Teacher ↔ Subject ↔ Class
// ───────────────────────────────────────────────
// for lesson plans and assignments.
export const TeacherSubjectClassTable = pgTable(
  "teacher_subject_class",
  {
    teacherId: uuid("teacher_id")
      .references(() => TeachersTable.id, { onDelete: "cascade" })
      .notNull(),
    subjectId: uuid("subject_id")
      .references(() => SubjectTable.id, { onDelete: "cascade" })
      .notNull(),
    classId: uuid("class_id")
      .references(() => ClassTable.id, { onDelete: "cascade" })
      .notNull(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schoolTable.id, { onDelete: "cascade" }),

    assignedAt: timestamp("assigned_at").defaultNow(),
    academicYearId: uuid("academic_year_id")
        .references(() => academicYearTable.id, { onDelete: "cascade" }), // support tracking changes per academic year

  },
  (t) => ({
    // composite key to ensure no single teacher can be assigned the same subject to the same class in same school more than once.
    pk: primaryKey({ columns: [t.schoolId, t.subjectId, t.classId, t.teacherId], name: "pk_teacher_subject_class" }), // composite key
  })
);


// ───────────────────────────────────────────────
// 13. PARENTS
// ───────────────────────────────────────────────
export const parentsTable = pgTable("parents", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    profileId: uuid("profile_id").notNull().references(() => userProfilesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
    userIdIndx: index("idx_userId").on(t.userId)
  })
);



// ───────────────────────────────────────────────
// 14. DORMITORIES
// ───────────────────────────────────────────────
export const dormitoriesTable = pgTable(
  "dormitories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    gender: genderEnums("gender").notNull(),
    capacity: integer("capacity"),
    matronId: uuid("matron_id").references(() => TeachersTable.id, { onDelete: "set null" }),
    patronId: uuid("patron_id").references(() => TeachersTable.id, { onDelete: "set null" }),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
  },
  (t) => ({
    // enforce uniqueness of dorm name within a school
    uniqueDormNamePerSchool: unique().on(t.schoolId, t.name),
    schoolIndx: index("idx_dorm_school").on(t.schoolId),


    // enforce XOR: either matron OR patron, but not both
    managerXOR: check(
      "manager_xor_check",
      sql`("matron_id" IS NOT NULL AND "patron_id" IS NULL) OR ("matron_id" IS NULL AND "patron_id" IS NOT NULL)`
    ),
  })
);


// ───────────────────────────────────────────────
// 15. STUDENT
// ───────────────────────────────────────────────
// i did not join with user profile since student's phone is optional
export const studentsTable = pgTable("student", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 50 }).notNull(),
    admissionNo: text("admission_no").notNull(),
    gender: genderEnums("gender").notNull(),
    dob: timestamp("dob").notNull(),
    address: text("address"),
    schoolId: uuid("school_id").notNull().references(() => schoolTable.id, { onDelete: "cascade" }),
    dormId: uuid("dorm_id").references(() => dormitoriesTable.id, { onDelete: "set null" }), // not every student will be in dorm (day scholars) so this can be null
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
    
  }, t => ({
    uniqueAdmissionPerSchool: unique().on(t.admissionNo, t.schoolId), // unique admission per school (name can be same in one school)
        // indexing school-id for fast lookups
        schoolIndx: index("idx_std_school").on(t.schoolId),
        schoolAdmissionIndx: index("idx_admission_school").on(t.admissionNo, t.schoolId),
        schoolDormIndx: index("idx_dorm_school_student").on(t.dormId, t.schoolId),
        // data accuracy & safety
        checkDob: check("check_dob", sql`"dob" <= now()`)
      })
);


// ──────────────────────────────────────────────────────────────────────
// 16. JOINT TABLE student <-> class <-> year (many-to-many relation)
// ──────────────────────────────────────────────────────────────────────
// keeps historical class changes for the student upon promotions/repetition & current
export const studentsClassYearTable = pgTable("students_class_year", {
    studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
    classId: uuid("class_id").notNull().references(() => ClassTable.id, { onDelete: "cascade" }),
    academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "cascade" }).notNull(),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    isCurrent: boolean("is_current").default(true) // if true means is active class for now
}, t => ({
        pk: primaryKey({ columns: [t.classId, t.studentId, t.academicYearId ], name: "pk_students_class_year"}),
        stdClassIndex: index("std_class_indx").on(t.studentId, t.isCurrent) // indexing ...
    })
)


// ─────────────────────────────────────────────────────────────────────
// 17. JOINT TABLE ?? STUDENT <-> PARENT (many-to-many relation)
// ─────────────────────────────────────────────────────────────────────
// A student can be linked to many parents -> allow assigning multiple parents

export const studentParentsTable = pgTable("student_parents", {
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  parentId: uuid("parent_id").references(() => parentsTable.id, { onDelete: "cascade" }).notNull(),
  relation: varchar("relation", { length: 20 }), // e.g. father, mother, guardian

}, t => ({
        pk: primaryKey({ columns: [t.parentId, t.studentId], name: "pk_student_parent"}), // no parent assigned to a student twice
        studentIndx: index("idx_student").on(t.studentId),
    })
);

// ───────────────────────────────────────────────
// 18. JOINT TABLE parent <-> school (many-to-many)
// ───────────────────────────────────────────────
// One parent account → many schools.
// Each school can control its own students/records for that parent.
// The parent can log in once and access multiple schools’ portals (multi-tenant friendly).
export const parentSchoolsTable = pgTable("parent_schools", {
  parentId: uuid("parent_id")
    .notNull()
    .references(() => parentsTable.id, { onDelete: "cascade" }),
  schoolId: uuid("school_id")
    .notNull()
    .references(() => schoolTable.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.parentId, t.schoolId], name:"pk_parent_school" }),
}));



// ───────────────────────────────────────────────
// 19. ATTENDANCE
// ───────────────────────────────────────────────
export const attendanceTable = pgTable("attendance", {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    classId: uuid("class_id").notNull().references(() => ClassTable.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => SubjectTable.id, { onDelete: "cascade" }), // track attendance per subject taught (can be null -> not common) 
    date: timestamp("date").notNull().defaultNow(),
    period: periodEnums("period").default("morning"),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    status: attendanceStatus("status").notNull().default("present"),
    description: text("description"), // if permitted give the why ? e.g. he is sick 
    teacherId: uuid("teacher_id").notNull().references(() => TeachersTable.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
    // these will be used for reports
    academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "set null" }),
    termId: uuid("term_id").references(() => termTable.id, { onDelete: "set null" }),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),


}, t => ({
    attendanceIndex: index("idx_school_class_date").on(t.schoolId, t.classId, t.date),
    schoolIndx: index("idx_attendace_school").on(t.schoolId),

  })
);



// ───────────────────────────────────────────────
// 20. EXAM TABLE
// ───────────────────────────────────────────────
export const examsTable = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // e.g. "Midterm Test"
  termId: uuid("term_id").notNull().references(() => termTable.id, { onDelete: "cascade"}), // eg. term 1
  subjectId: uuid("subject_id").references(() => SubjectTable.id, { onDelete: "cascade" }).notNull(),
  classId: uuid("class_id").references(() => ClassTable.id, { onDelete: "cascade" }).notNull(),
  teacherId: uuid("teacher_id").references(() => TeachersTable.id, { onDelete: "cascade" }),
  totalMarks: integer("total_marks").default(100),
  academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
        uniqueNamePerSchool: unique().on(t.schoolId, t.name, t.classId), // unique name per school
        schoolIndx: index("idx_exam_school").on(t.schoolId),
    })
);

// ───────────────────────────────────────────────
// 21. EXAM-RESULTS TABLE
// ───────────────────────────────────────────────
export const examResultsTable = pgTable("exam_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => examsTable.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  marks: integer("marks").notNull(),
  grade: varchar("grade", { length: 5 }),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
      // a student can have multiple results for the same exam name not examId (same year >-< varies year) 
      uniqueExamIdPerSchool: unique().on(t.examId, t.schoolId, t.studentId), // unique name per school
      examIndx: index("idx_exam_student").on(t.examId, t.studentId),
    })
  );

// ───────────────────────────────────────────────
// 22. AUDIT LOGS TABLE
// ───────────────────────────────────────────────
export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  ipAddress: text("ip_address"),
  deviceInfo: text("device_info"),
  description: text("description"),
  actionType: text("action_type"), // CREATE, DELETE, LOGIN, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
}, t => ({
    schoolIdIndx: index("school_id_idx").on(t.schoolId),
    userIndx: index("idx_user").on(t.userId, t.createdAt),
  })
);


// ───────────────────────────────────────────────
// 23. ASSIGNMENTS TABLE
// ───────────────────────────────────────────────
export const assignmentTable = pgTable("assignment", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    subjectId: uuid("subject_id").notNull().references(() => SubjectTable.id, { onDelete: "cascade" }),
    classId: uuid("class_id").notNull().references(() => ClassTable.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id").notNull().references(() => TeachersTable.id, { onDelete: "cascade" }),
    dueDate: timestamp("due_date"), // the date that assignment starts to count
    submittedAt: timestamp("submitted_at"), // deadline 
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
        uniqueNamePerSchool: unique().on(t.schoolId, t.title), // unique title per school
        schoolIndx: index("idx_assignment_school").on(t.schoolId),
    })
)

// ───────────────────────────────────────────────
// 24. LESSON PLAN TABLE
// ───────────────────────────────────────────────
export const lessonPlanTable = pgTable("lesson_plan", {
    id: uuid("id").defaultRandom().primaryKey(),
    teacherId: uuid("teacher_id").notNull().references(() => TeachersTable.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").notNull().references(() => SubjectTable.id, { onDelete: "cascade" }),
    classId: uuid("class_id").notNull().references(() => ClassTable.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    objectives: text("objectives").notNull(),
    isApproved: boolean("is_approved").default(false), // only hod can prove this lesson plan
    approvalDate: timestamp("approval_date"),
    schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),

}, t => ({
        uniqueNamePerSchool: unique().on(t.schoolId, t.topic), // unique topic per school
        schoolIndx: index("idx_lesson_school").on(t.schoolId),
    })
);


// ───────────────────────────────────────────────
// 25. EXAM relations (exam ↔ subject ↔ class)
// ───────────────────────────────────────────────
// “Exam X is for Subject Y in Class Z at School S.” - Ask anything of the two known
export const examSubjectClassTable = pgTable(
  "exam_subject_class",
  {
    examId: uuid("exam_id")
      .references(() => examsTable.id, { onDelete: "cascade" })
      .notNull(),
    subjectId: uuid("subject_id")
      .references(() => SubjectTable.id, { onDelete: "cascade" })
      .notNull(),
    classId: uuid("class_id")
      .references(() => ClassTable.id, { onDelete: "cascade" })
      .notNull(),
    schoolId: uuid("school_id")
      .notNull()
      .references(() => schoolTable.id, { onDelete: "cascade" }),

    assignedAt: timestamp("assigned_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.examId, t.subjectId, t.classId, t.schoolId], name: "pkexam_subject_class" }), // composite key
    schoolIndx: index("idx_exam_subj_class_school").on(t.schoolId),
  })
);

// ──────────────────────────────────────────────────────────────────
// 26. STUDENT SUBJECT CLASS relations (student ↔ subject ↔ class)
// ──────────────────────────────────────────────────────────────────
// not every student takes every subject in a class e.g. optional subjects
// For reporting which subjects each student officially takes
export const studentSubjectClassTable = pgTable("student_subject_class", {
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => SubjectTable.id, { onDelete: "cascade" }).notNull(),
  classId: uuid("class_id").references(() => ClassTable.id, { onDelete: "cascade" }).notNull(),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "set null" }),
  termId: uuid("term_id").references(() => termTable.id, { onDelete: "set null" }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
}, t => ({
  pk: primaryKey({ columns: [t.studentId, t.subjectId, t.classId, t.schoolId], name: "pk_std_subj_class" }),
  studentIndex: index("idx_student_subject").on(t.studentId, t.subjectId),
  schoolIndx: index("idx_std_subj_class_school").on(t.schoolId),
}));


// ──────────────────────────────────────────────────────────────────
// 27. STUDENT SUBJECT EXAM relations (student ↔ subject ↔ exam)
// ──────────────────────────────────────────────────────────────────
// some exams are multi-subject e.g. Mid-term have all subjects
// also allow combined exams e.g. Maarifa ya jamii combines uraia, stadi za kazi etc.
//* USED FOR: 
// Perfect for per-subject marks within multi-subject exams
// Makes generating subject-level reports faster
// Avoids redundancy if same exam includes multiple subjects
export const studentExamSubjectTable = pgTable("student_exam_subject", {
  examId: uuid("exam_id").references(() => examsTable.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => SubjectTable.id, { onDelete: "cascade" }).notNull(),
  marks: integer("marks").notNull(),
  grade: varchar("grade", { length: 5 }),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
}, t => ({
  pk: primaryKey({ columns: [t.examId, t.subjectId, t.studentId, t.schoolId], name: "pk_std_exam_subj" }),
  studentIndex: index("idx_student_exam").on(t.studentId, t.examId),
}));


// ──────────────────────────────────────────────────────────────────
// 28. CLASS TEACHER YEAR relations (class ↔ teacher ↔ year)
// ──────────────────────────────────────────────────────────────────
// Sometimes teachers change classes each year
// e.g., who was class teacher for Class X in Year Y.
export const classTeacherYearTable = pgTable("class_teacher_year", {
  teacherId: uuid("teacher_id").references(() => TeachersTable.id, { onDelete: "cascade" }).notNull(),
  classId: uuid("class_id").references(() => ClassTable.id, { onDelete: "cascade" }).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "cascade" }).notNull(),
  schoolId: uuid("school_id").references(() => schoolTable.id, { onDelete: "cascade" }).notNull(),
}, t => ({
  pk: primaryKey({ columns: [t.teacherId, t.classId, t.academicYearId, t.schoolId], name:"pk_class_teacher_year" }),
}));

// ──────────────────────────────────────────────────────────────────
// 29. STUDENT DORM YEAR relations (Student ↔ Dorm ↔ AcademicYear)
// ──────────────────────────────────────────────────────────────────
// students may move to a different dorm or become day scholars e.g. per year or diff reason.
// dorm allocation history
export const studentDormYearTable = pgTable("student_dorm_year", {
  studentId: uuid("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  dormId: uuid("dorm_id").references(() => dormitoriesTable.id, { onDelete: "cascade" }).notNull(),
  academicYearId: uuid("academic_year_id").references(() => academicYearTable.id, { onDelete: "cascade" }).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  reason: text("reason"), // reason for the shift.
}, t => ({
  pk: primaryKey({ columns: [t.studentId, t.dormId, t.academicYearId], name: "pk_student_dorm_year" }),
}));

// ──────────────────────────────────────────────────────────────────
// 30. TOKEN INFO 
// ──────────────────────────────────────────────────────────────────
export const tokenInfoTable = pgTable("token_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  schoolId: text("school_id").notNull(),
  role: roleEnums("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});