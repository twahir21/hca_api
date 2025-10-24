export type baseClassReturn = {
    success: boolean,
    message: string,
}

export interface getClasses extends baseClassReturn {
    classes: {
        id: string;
        name: string;
        createdAt: Date;
    }[]
}

export interface totalClasses extends baseClassReturn {
    total: number;
}