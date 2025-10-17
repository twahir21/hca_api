import { sendOTPSMS } from "../../func/nextsms.func";
import { checkOTPGeneration, generateOTP, getOTPData, isSessionExist, saveOTP, verifyOTP } from "../../func/otp.func";
import { Set } from "../../types/type";
import { loginDatabase } from "./login.db"
import { loginBody } from "./login.types"

export const loginController = {
    login: async ({ body , set }: { body: loginBody; set: Set }) => {
        // check if session exist
        const isExist = await isSessionExist(body.sessionId);
        // if (isExist) {
        //     set.status = "Already Reported";
        //     return {
        //         success: false,
        //         message: "Session already exist",
        //         sessionId: body.sessionId
        //     }
        // }
        // 2FA (password + OTP)
        const verifyUser = await loginDatabase.login({ body, set });
        if (!verifyUser.success) return {
            success: false,
            message: verifyUser.message,
            sessionId: ""
        };
        // otp
        const OTP = generateOTP();
        console.log("phone: ", verifyUser.data.phone)
        const sendOTP = await sendOTPSMS({ 
            phoneArray: [verifyUser.data.phone],
            message: `Your verification code for HCA is ${OTP}. valid for 5 minutes. Do not share it with anyone.`,
            set
        })

        // save otp
        const sessionId = await saveOTP({
            userId: verifyUser.data.userId,
            role: verifyUser.data.role,
            otpInput: OTP,
            phoneNumber: verifyUser.data.phone
        })

        return {
            success: sendOTP.success,
            message: sendOTP.message,
            sessionId
        }
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
            const { phoneNumber } = await getOTPData({ sessionId: body.sessionId });

            if (!phoneNumber || phoneNumber.length === 0) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "You have exceeded 5 minutes, please login again"
                }
            }

            // ensure that the number has max of 5 attempts
            if (!await checkOTPGeneration({ phoneNumber })) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "You have exceeded OTP generation limit, try again later"
                }
            }

            const OTP = generateOTP();

            return await sendOTPSMS({
                phoneArray: [phoneNumber],
                message: `Your verification code for HCA is ${OTP}. valid for 5 minutes. Do not share it with anyone.`,
                set
            });
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