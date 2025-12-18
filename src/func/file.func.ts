import { Set } from "../types/type";
import * as XLSX from 'xlsx';
import { fileTypes, InvalidRow, RowValidationResult } from "./file.types";


export const processExcel = async ({ file , set, requiredHeaders }: { file: File, set: Set, requiredHeaders: string[] }): Promise<fileTypes> => {

    try {
        // 1. validation the extension
        const ext = file.name.split('.').pop();
        if (ext !== 'xlsx') {
            set.status = 400;
            return {
                success: false,
                message: "Invalid file type",
                details: "Only Excel files (.xlsx) are allowed"
            }
        }

        // 2. validate file type (only allow .xlsx)
        if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            set.status = 400;
            return { success: false, message: 'Incorrect file uploaded', details: "Only Excel files (.xlsx) are allowed" };
        }
        
        // 3. Convert file to buffer and process (without saving to disk)
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // 4.  Check if file has data
        if (json.length === 0) {
            set.status = 400;
            return { success: false, message: "Excel file is empty", details: "Make sure you have atleast one row" };
        }

        // 5. Extract header of the first row
        const headers = json[0].map(h => h.toString().trim());

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            set.status = 400;
            return { 
            success: false,
            message: "Invalid file uploaded.",
            details: `Missing required headers: ${missingHeaders.join(", ")}` 
            };
        }

        
        // 6. Validate data rows

        const dataRows = json.slice(1);
        const validRows: RowValidationResult[] = [];
        const invalidRows: InvalidRow[] = [];

        // Map headers to indices once (more efficient)
        const headerIndices: Record<string, number> = requiredHeaders.reduce((acc, header) => {
            acc[header] = headers.indexOf(header);
            return acc;
        }, {} as Record<string, number>);

        dataRows.forEach((row, rowIndex) => {
            let isValid = true;
            const rowData: RowValidationResult = {};

            for (const header of requiredHeaders) {
                const cell = row[headerIndices[header]];
                if (!cell?.toString().trim()) {
                    isValid = false;
                    break;
                }

                // format the header to pick first and lowercased header
                rowData[header.split(" ")[0].toLowerCase()] = cell.toString().trim();
            }

            if (isValid) {
                validRows.push(rowData);
            } else {
                invalidRows.push({ row: rowIndex + 2, data: row }); // +2 for header and 0-based index
            }
        });


        set.status = "OK";
        return {
            success: true,
            message: "File validated successfully",
            details: "File checked, now proceed with other steps.",
            validData: { validRows, validLength: validRows.length },
            invalidData: { invalidRows, invalidLength: invalidRows.length }
        };

    } catch (error) {
        set.status = "Internal Server Error";
        return {
            success: false,
            details: error instanceof Error ? 
                        error.message :
                        "Something went wrong in processing a file.",
            message: "Failed to process a file."
        }
    }
}