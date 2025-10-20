import Elysia from "elysia";
import { LoginValidators } from "./login.valid";
import xss from "xss";
import { loginController } from "./login.controller";
import { jwtPlugin } from "../../plugins/global.plugin";
import { getOTPData } from "../../func/otp.func";

export const LoginPlugin = new Elysia({ name: "Login API" })
    .use(jwtPlugin)
    .post("/login", async ({ body, set }) => {
        return await loginController.login({ body, set });
    }, {
        body: LoginValidators.login,
        beforeHandle({ body }) {
            body.username = xss(body.username).toLowerCase().trim(),
            body.password = xss(body.password).trim(),
            body.sessionId = xss(body.sessionId).trim()
        }
    })
    .post("/verify-OTP", async ({ body, set, jwt }) => {
        const verifyResult = await loginController.verifyOTP({ body, set });

        if (!verifyResult.success) return {
            success: false,
            message: verifyResult.message,
            authToken: ""
        }

        // issue a jwt.
        const { userId, role, username } = await getOTPData({ sessionId: body.sessionId });
        const authToken = await jwt.sign ({ userId, role });
        
        return {
            success: true,
            message: "You have successfully logged in",
            authToken,
            role,
            username
        }
    }, {
        body: LoginValidators.verifyOTP,
        beforeHandle({ body, set }) {
            body.sessionId = xss(body.sessionId).trim(),
            body.otpInput = xss(body.otpInput).trim()
            if(!body.sessionId || !body.otpInput) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Session ID or a valid OTP is required",
                }
            }
        }

    })
    .post("/resend-OTP", async ({ body, set }) => {
        return await loginController.resendOTP({ body, set });
    }, {
        body: LoginValidators.resendOTP,
        beforeHandle({ body, set }) {
            body.sessionId = xss(body.sessionId).trim()
            if(!body.sessionId) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: "Session ID is required",
                }
            }
        }
    })