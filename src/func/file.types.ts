export interface RowValidationResult {
    [key: string]: string; // each header maps to its cell value
}

export interface InvalidRow {
    row: number;
    data: string[];
}

export type fileTypes = {
    success: boolean;
    message: string;
    validData?: {
        validRows: RowValidationResult [];
        validLength: number;
    },
    invalidData?: {
        invalidRows: { row: number;  data: string[]; }[];
        invalidLength: number;
    },
    details: string;
}