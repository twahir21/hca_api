import { eq } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { sendOTPSMS } from "../../func/nextsms.func";
import { generateOTP, getOTPData, isSessionExist, Return, verifyOTP } from "../../func/otp.func";
import { schoolTable, userProfilesTable, userRolesTable } from "../../schema/core.schema";
import { Set } from "../../types/type";
import { loginDatabase } from "./login.db";
import { loginBody } from "./login.types";
import { sendEmail } from "../../config/email.config";

export const loginController = {
    login: async ({ body , set }: { body: loginBody; set: Set }): Promise<Return & { data: {sessionId: string; OTP: string }}> => {
        // check if session exist (this logic needs re-checking ..)
        const isExist = await isSessionExist(body.sessionId);
        if (isExist) {
            set.status = "Already Reported";
            return {
                success: false,
                message: "Session already exist",
                data: { 
                    sessionId: body.sessionId,
                    OTP: ""
                }
            }
        }
        // 2FA (password + OTP)
        const verifyUser = await loginDatabase.login({ body, set });
        if (!verifyUser.success) return {
            success: false,
            message: verifyUser.message,
            data: {
                sessionId: '',
                OTP: ''
            }
        };
        // otp
        const OTP = await generateOTP({ userId: verifyUser.data.userId });

        // better to use the queue like bullmq in VPS
        const isSent = await sendOTPSMS({
            phoneArray: [verifyUser.data.phone],
            sender: verifyUser.data.bulkSMS,
            message: `Your verification code for ${verifyUser.data.bulkSMS} is ${OTP.OTP}. valid for 5 minutes. Do not share it with anyone.`,
            set
        });

        const { sessionId, OTP: code } = OTP;
        
        // provide a fallback option to send via email
        if (!isSent.success){
            const sendMail = await sendEmail({
                fromName: "SkuliPro",
                subject: "verify OTP",
                message: `Your verification code for ${verifyUser.data.bulkSMS} is ${OTP.OTP}. valid for 5 minutes. Do not share it with anyone.`,
                title: "OTP Verification",
                user: [verifyUser.data.email]
            })

            return {
                ...sendMail,
                message: sendMail.success ? "We have sent OTP via email. SMS delivery is currently unavailable." : sendMail.message,
                data: {
                    sessionId,
                    OTP: code
                }
            }
        }
        return {
            ...isSent,
            data: {
                sessionId,
                OTP: code
            }
        };

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
    resendOTP: async ({ body, set }: { set: Set, body: { sessionId: string } }): Promise<Return & { data: {sessionId: string; OTP: string; }}> => {
        try {
            const userId = await getOTPData({ sessionId: body.sessionId });

            if(!userId){
                return {
                    success: false,
                    message: "Please clear your cookies and login again",
                    data: {
                        sessionId: "",
                        OTP: ""
                    }
                }
            }

            // get phone number using userId
            const [contactInfo] = await db.select({
                phone: userProfilesTable.phone,
                email: userProfilesTable.email
            }).from(userProfilesTable)
            .where(eq(userProfilesTable.userId, userId));


            const [bulk] = await db.select({
                name: schoolTable.bulkSMSName
            }).from(userRolesTable)
            .leftJoin(schoolTable, eq(schoolTable.id, userRolesTable.schoolId))
            .where(eq(userRolesTable.userId, userId))
            .then(m => m.map(a => a.name))

            const OTP = await generateOTP({ userId });

            // better to use the queue like bullmq in VPS
            const isSent = await sendOTPSMS({
                phoneArray: [contactInfo.phone],
                sender: bulk ?? "",
                message: `Your verification code for ${bulk ?? ""} is ${OTP.OTP}. valid for 5 minutes. Do not share it with anyone.`,
                set
            });

            const { sessionId, OTP: code } = OTP;
        
            // provide a fallback option to send via email
            if (!isSent.success){
                const sendMail = await sendEmail({
                    fromName: "SkuliPro",
                    subject: "verify OTP",
                    message: `Your verification code for ${bulk ?? ""} is ${OTP.OTP}. valid for 5 minutes. Do not share it with anyone.`,
                    title: "OTP Verification",
                    user: [contactInfo.email]
                })

                return {
                    ...sendMail,
                    message: sendMail.success ? "We have sent OTP via email. SMS delivery is currently unavailable." : sendMail.message,
                    data: {
                        sessionId,
                        OTP: code
                    }
                }
            }
            return {
                ...isSent,
                data: {
                    sessionId,
                    OTP: code
                }
            };
        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in resending OTP",
                data: { sessionId: "", OTP: ""}
            }
        }
    }
}