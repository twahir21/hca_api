import { t } from "elysia";

type validErr = {
    success: boolean;
    message: string;
}

export const LoginValidators = {
    login: t.Object({
        username: t.String({
            minLength: 4,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false,
                    message: "Username must be between 4-40 characters"
                }
            }
        }),
        password: t.String({
            maxLength: 40,
            minLength: 8,
            error(): validErr {
                return {
                    success: false,
                    message: "Password must be between 8-40 characters"
                }
            }
        }),
        sessionId: t.String()
    }),
    verifyOTP: t.Object({
        sessionId: t.String(),
        otpInput: t.String()
    }),
    resendOTP: t.Object({
        sessionId: t.String()
    })
}