import { Elysia } from 'elysia'
import XLSX from 'xlsx'

export const filePlugin = new Elysia()
  // Handle file upload and validation
  .post('/file', async ({ body, set }) => {
    try {
      // In Elysia, when using multipart form data, the file is available directly on the body
      // The field name "file" comes from your frontend: formData.append("file", file)
      const file = (body as any).file as File;
      
      if (!file) {
        set.status = 400;
        return { error: 'No file provided' };
      }

      // Validate file type (only allow .xlsx)
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        set.status = 400;
        return { error: 'Only Excel files (.xlsx) are allowed' };
      }

      // Convert file to buffer and process (without saving to disk)
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      // Check if file has data
      if (json.length === 0) {
        set.status = 400;
        return { error: "Excel file is empty" };
      }

      // Extract headers from first row
      const headers = json[0].map(h => h.toString().trim());

      const requiredHeaders = ["Name", "Phone Number", "Message"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        set.status = 400;
        return { error: `Missing required headers: ${missingHeaders.join(", ")}` };
      }

      // Validate data rows
      const dataRows = json.slice(1);
      const validRows = [];
      const invalidRows = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const nameIndex = headers.indexOf("Name");
        const phoneIndex = headers.indexOf("Phone Number");
        const messageIndex = headers.indexOf("Message");
        
        // Basic validation
        if (row[nameIndex] && row[phoneIndex] && row[messageIndex]) {
          validRows.push({
            name: row[nameIndex],
            phone: row[phoneIndex],
            message: row[messageIndex]
          });
        } else {
          invalidRows.push({
            row: i + 2, // +2 because of header row and 0-based index
            data: row
          });
        }
      }

      return {
        success: true,
        message: "File validated successfully",
        headers,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
        sampleData: validRows.slice(0, 3), // Return first 3 valid rows as sample
        invalidSamples: invalidRows.slice(0, 3) // Return first 3 invalid rows as sample
      };

    } catch (err: any) {
      console.error('Upload error:', err);
      set.status = 500;
      return { error: 'Failed to process file', details: err.message };
    }
  })

