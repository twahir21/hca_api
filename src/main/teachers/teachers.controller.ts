import { cacheGet} from "../../cache/redis.cache";
import { decryptToken } from "../../security/encrypt.sec";
import { Set } from "../../types/type";
import { TeachersDatabase } from "./teachers.db";
import { decodedBody } from "./teachers.types";

export const TeachersControllers = {
    createTeacher: async ({ set, decodedBody, body }: { set: Set;  body: { username: string; password: string; }; decodedBody: decodedBody}) => {
        // 3. save Teacher to the database & redirect to login.
        return await TeachersDatabase.createTeacher({ body: decodedBody, set, userInfo: { password: body.password, username: body.username } });
    },
    uploadExcel: async () => {
        //-> format of the excel
        // name,phone,subject
        // John Doe,0712345678,Math
        // Jane Smith,0712349876,English

    }
}