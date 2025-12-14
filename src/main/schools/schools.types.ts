export type schoolBody = {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
}

export interface updateSchoolBody extends schoolBody {
    schoolId: string;
}

export type baseSchoolReturn = {
    success: boolean;
    message: string;
}

export interface getSchools extends baseSchoolReturn {
    schools: {
        id: string;
        name: string;
        code: string;
        address: string;
        phone: string;
        subscriptionPlan: "Starter" | "Growth" | "Enterprice";
        status: "approved" | "inactive" | "suspended" | "expired" | "pending";
        email: string | null;
        expiredAt: Date | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[],
    totalSchools: number;
}