import { cacheGet, cacheSave } from "../../cache/redis.cache";
import { cacheTime } from "../../const/cache.const";
import { links } from "../../const/links.const";
import { sendOTPSMS } from "../../func/nextsms.func";
import { decryptToken, encryptToken } from "../../security/encrypt.sec";
import { Set } from "../../types/type";
import { TeachersDatabase } from "./teachers.db";
import { TeacherBody } from "./teachers.types";

export const TeachersControllers = {
    sendLink: async ({ set, body }: { set: Set; body: TeacherBody }) => {
        // 1. encrypt data for safety
        const encryptInfo = encryptToken(JSON.stringify(body));

        if (!encryptInfo.success || !encryptInfo.key ) {
            return encryptInfo
        };

        // 2. save to redis
        await cacheSave({ 
            name: JSON.stringify(encryptInfo.encryptedResult),
            value: encryptInfo.key,
            expiresIn: cacheTime.ONE_HOUR
        })

        await cacheSave({
            name: encryptInfo.key.toString(),
            value: body.phone,
            expiresIn: cacheTime.ONE_HOUR
        })

        // 3. Send invitation link to activate account
        return await sendOTPSMS({
            phoneArray: [body.phone],
            message:  `You’ve been added to HCA portal.
                       Click below to activate your account and set your password:
                       👉 Activate Account within 1 hour.
                       ${links.clientLink}/activate/?token=${encryptInfo.encryptedResult}`,
            set
        });
    },
    createTeacher: async ({ set, urlToken, body }: { set: Set; urlToken: string; body: { username: string; password: string; }}) => {
        // 1. obtain info from redis
        const key = await cacheGet(urlToken);
        const info = await cacheGet(key);

        if (!key || !info){
            return {
                success: false,
                message: "Token is invalid or expired, ask Admin to resend new link"
            }
        }

        // 2. return verification from the decrypter.
        const result = decryptToken({ key, encryptedResult: JSON.parse(urlToken), info});

        if (!result.success) return result;

        // 3. save Teacher to the database & redirect to login.
        return await TeachersDatabase.createTeacher({ body: JSON.parse(info), set, userInfo: { password: body.password, username: body.username } });

    },
    uploadExcel: async () => {
        //-> format of the excel
        // name,phone,subject
        // John Doe,0712345678,Math
        // Jane Smith,0712349876,English

    }
}