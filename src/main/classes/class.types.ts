export type baseClassReturn = {
    success: boolean,
    message: string,
}

export interface getClasses extends baseClassReturn {
    data: {
        id: string;
        name: string;
        schoolId: string;
        createdAt: Date | null;
        levelId: string;
        updatedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
    }[]
}
