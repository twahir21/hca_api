import { redis } from "bun";
import { createHash, randomBytes, randomInt } from "crypto";

// 1. Creating Config
const OTP_TTL = 5 * 60; // 5 minutes
const OTP_LENGTH = 6; // prefer 6
const MAX_ATTEMPTS = 5;
const MAX_OTP_GENERATION = 3; // per day
const OTP_GENERATION_TTL = 24 * 60 * 60; // 24 hours
const OTP_RATE_LIMIT = 30; // seconds between generation


const hashOTP = (otp: string) => { return  createHash("sha256").update(otp).digest("hex"); };

export type Return = {
    success: boolean;
    message: string;
}

export const generateOTP = async (
    { userId }: { userId: string }, length = OTP_LENGTH
    ): Promise<Return & { sessionId: string; OTP: string; }> => {
    
    const generationKey = `otp:count:${userId}`;
    const rateLimitKey = `otp:rate:${userId}`;

    // Check short-term rate limit (1 OTP every 30s)
    const isRateLimited = await redis.exists(rateLimitKey);
    if (isRateLimited) {
        return {
            success: false,
            sessionId: "",
            OTP: "",
            message: "Please wait 30s before requesting a new OTP.",
        };
    }

    // Increment user's daily OTP counter
    const generationCount = await redis.incr(generationKey);
    if (generationCount === 1) {
        await redis.expire(generationKey, OTP_GENERATION_TTL); // set 24h window
    }

    if (generationCount > MAX_OTP_GENERATION) {
        return {
            success: false,
            sessionId: "",
            OTP: "",
            message: "Daily OTP generation limit reached. Try again later.",
        };
    }

    // Rate limit for 30s after generation
    await redis.set(rateLimitKey, "1", "EX", OTP_RATE_LIMIT);

    const OTP = randomInt(0, 10 ** length) // 0 to 100000 (6 digits)
        .toString() 
        .padStart(length, "0"); // ensure always 6 digits e.g. 451232 -> 00451232

    const sessionId = randomBytes(32).toString("hex"); // random unique id



    await redis.set(`otp:session:${sessionId}`, JSON.stringify({
        userId,
        otp: hashOTP(OTP),
    }), "EX", OTP_TTL);

    await redis.set(`otp_attempts:${sessionId}`, "0", "EX", OTP_TTL);

    return {
        success: true,
        message: "OTP generated successfully",
        sessionId,
        OTP
    };
}

export const verifyOTP = async ({ otpInput, sessionId }: { sessionId: string, otpInput: string }): Promise<Return> => {
    const getOTP = await redis.get(`otp:session:${sessionId}`);

    if (!getOTP) return {
        success: false,
        message: "OTP is invalid or expired"
    }

    const attempts = await redis.incr(`otp_attempts:${sessionId}`);

      if (attempts > MAX_ATTEMPTS) {
        await redis.del(`otp:session:${sessionId}`);
        await redis.del(`otp_attempts:${sessionId}`);
            return {
                success: false,
                message: "Too many attempts",
            }
        }

        const parsedOTP = JSON.parse(getOTP) as {
            userId: string,
            otp: string, // hashed OTP
        };

        console.log("Hashed OTP: ", parsedOTP.otp)
    
    if (parsedOTP.otp !== hashOTP(otpInput)) {
        return {
            success: false,
            message: "OTP is invalid or expired"
        }
    }

    await redis.del(`otp_attempts:${sessionId}`);
    await redis.del(`otp:session:${sessionId}`);

    return {
        success: true,
        message: "OTP verified"
    }
}

export const getOTPData = async ({ sessionId }: { sessionId: string }): Promise<string> => {
    const getOTP = await redis.get(`otp:session:${sessionId}`);

    if (!getOTP) return "";

    const result =  JSON.parse(getOTP) as {
        userId: string,
        otp: string, // hashed OTP
    };

    return result.userId;
}

export const isSessionExist = async (sessionId: string): Promise<boolean> => {
    return await redis.exists(`otp:session:${sessionId}`);
}
