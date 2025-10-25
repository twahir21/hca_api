import { Set } from "../../types/type";
import { TeachersDatabase } from "./teachers.db";
import { TeacherBody } from "./teachers.types";

export const TeachersControllers = {
    createTeacher: async ({ body, set }: { body: TeacherBody, set: Set}) => {
        // 1. save Teacher to the database
        const saveToDb = await TeachersDatabase.createTeacher({ body, set });

        // 2. if not ok throw back the error
        if (saveToDb.success === false) { return saveToDb };

        // 3. Send invitation link to activate account

    },
    uploadExcel: async () => {
        //-> format of the excel
        // name,phone,subject
        // John Doe,0712345678,Math
        // Jane Smith,0712349876,English

    }
}