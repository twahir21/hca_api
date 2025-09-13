export type fileTypes = {
    success: boolean;
    message: string;
    validData?: {
        validRows: { name: string; phone: string; message: string; }[];
        validLength: number;
    },
    invalidData?: {
        invalidRows: { row: number;  data: string[]; }[];
        invalidLength: number;
    },
    details: string;
}