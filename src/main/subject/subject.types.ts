export type baseSubjectReturn = {
    success: boolean,
    message: string,
}

export interface getSubjects extends baseSubjectReturn {
    data: {
        id: string;
        name: string;
        code: string | null;
        schoolId: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
    }[],
    total: number
}
