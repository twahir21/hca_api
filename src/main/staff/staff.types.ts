export type staffData = {
    data: {
        roles: ("super-admin" | "school-admin" | "principal" | "bursar" | "dorm-master" | "matron" | "patron" | "transport-officer" | "driver" | "store-keeper" | "class-teacher" | "academic-master" | "displinary-officer" | "HOD" | "ict-officer" | "librarian" | "meal-officer" | "nurse" | "parent" | "student" | "registrar" | "teacher" | "sports-master" | "lab-technician" | "cleaning-officer" | "election-officer" | "debate-manager" | "trips-officer" | "maintainance-officer" | "counselor")[];
        id: string;
        fullName: string;
        phone: string;
        email: string;
        address: string | null;
        gender: "male" | "female" | "prefer not say";
        dob: Date | null;
        userId: string;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[];
    total: number;
}