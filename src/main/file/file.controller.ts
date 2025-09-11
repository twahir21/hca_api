import * as XLSX from "xlsx";

export const fileController = {
    verify: async ({ file }: any ) => {
        console.log("File received: ", file);

        try {
        // Convert file buffer to workbook
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        // Extract headers from first row
        const headers = json[0].map(h => h.trim());

        const requiredHeaders = ["Name", "Phone Number", "Message"];
        for (const h of requiredHeaders) {
            if (!headers.includes(h)) {
            //   set.status = 400;
            return { error: `Missing required header: ${h}` };
            }
        }

        return {
            message: "File uploaded & validated successfully",
            headers,
            rows: json.slice(1).length
        };

        } catch (err: any) {
            //   set.status = 500;
            return { error: "Failed to process file", details: err.message };
            }
        }
}

import { Elysia } from 'elysia'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// Create uploads directory if it doesn't exist
// const uploadsDir = './uploads'
// if (!existsSync(uploadsDir)) {
//   await mkdir(uploadsDir, { recursive: true })
// }

export const app = new Elysia()
  // Serve static files (optional)
  
  // Handle file upload
//   .post('/file', async ({ body, set }) => {
//     try {
//       const file = body.file as File;
      
//       if (!file) {
//         set.status = 400;
//         return { error: 'No file provided' };
//       }

//       // Validate file type (only allow .xlsx)
//       if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//         set.status = 400;
//         return { error: 'Only Excel files (.xlsx) are allowed' };
//       }

//       // Add this validation in the upload handler
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//             set.status = 400;
//             return { error: 'File size too large. Maximum size is 5MB' };
//         }

//       // Convert file to buffer
//       const buffer = await file.arrayBuffer();
//       const fileName = `${Date.now()}-${file.name}`;
//       const filePath = `${uploadsDir}/${fileName}`;

//       // Save file to disk
//       await writeFile(filePath, Buffer.from(buffer));

//       // Return success response
//       return { 
//         success: true, 
//         message: 'File uploaded successfully',
//         fileName: fileName,
//         originalName: file.name,
//         size: file.size
//       };
//     } catch (error) {
//       console.error('Upload error:', error);
//       set.status = 500;
//       return { error: 'Failed to upload file' };
//     }
//   })

