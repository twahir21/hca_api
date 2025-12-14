import { eq } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { sendOTPSMS } from "../../func/nextsms.func";
import { generateOTP, getOTPData, isSessionExist, verifyOTP } from "../../func/otp.func";
import { userProfilesTable } from "../../schema/core.schema";
import { Set } from "../../types/type";
import { loginDatabase } from "./login.db";
import { loginBody } from "./login.types";

export const loginController = {
    login: async ({ body , set }: { body: loginBody; set: Set }) => {
        // check if session exist (this logic needs re-checking ..)
        const isExist = await isSessionExist(body.sessionId);
        if (isExist) {
            set.status = "Already Reported";
            return {
                success: false,
                message: "Session already exist",
                sessionId: body.sessionId,
                OTP: "",
            }
        }
        // 2FA (password + OTP)
        const verifyUser = await loginDatabase.login({ body, set });
        if (!verifyUser.success) return {
            success: false,
            message: verifyUser.message,
            sessionId: "",
            OTP: ""
        };
        // otp
        const OTP = await generateOTP({ userId: verifyUser.data.userId });
        console.log("phone: ", verifyUser.data.phone);
        console.log("OTP: ", OTP)

        // const sendOTP = await sendOTPSMS({ 
        //     phoneArray: [verifyUser.data.phone],
        //     message: `Your verification code for HCA is ${OTP}. valid for 5 minutes. Do not share it with anyone.`,
        //     set
        // })

        return OTP;
    },
    verifyOTP: async ({ body, set }: { set: Set, body: { sessionId: string, otpInput: string } }) => {
        try {
            return await verifyOTP({ sessionId: body.sessionId, otpInput: body.otpInput });
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in verifying OTP"
            }
        }
    },
    resendOTP: async ({ body, set }: { set: Set, body: { sessionId: string } }) => {
        try {
            const userId = await getOTPData({ sessionId: body.sessionId });

            // get phone number using userId
            const [phoneNumber] = await db.select({
                phone: userProfilesTable.phone
            }).from(userProfilesTable)
            .where(eq(userProfilesTable.userId, userId));

            if (!phoneNumber.phone|| phoneNumber.phone.length === 0) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "You have exceeded 5 minutes, please login again"
                }
            }

            const OTP = generateOTP({ userId });

            // return await sendOTPSMS({
            //     phoneArray: [phoneNumber.phone],
            //     message: `Your verification code for HCA is ${OTP}. valid for 5 minutes. Do not share it with anyone.`,
            //     set
            // });

            return OTP;
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in resending OTP"
            }
        }
    }
}