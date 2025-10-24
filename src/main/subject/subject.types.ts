export type baseSubjectReturn = {
    success: boolean,
    message: string,
}

export interface getSubjects extends baseSubjectReturn {
    subjects: {
        id: string;
        name: string;
        createdAt: Date;
    }[]
}

export interface totalSubjects extends baseSubjectReturn {
    total: number;
}