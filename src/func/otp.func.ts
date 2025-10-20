import { redis } from "bun";
import { randomBytes, randomInt } from "crypto";

// 1. Creating Config
const OTP_TTL = 5 * 60; // 5 minutes
const OTP_LENGTH = 6; // prefer 6
const MAX_ATTEMPTS = 5;
const MAX_OTP_GENERATION = 5;
const OTP_GENERATION_TTL = 24 * 60 * 60; // 24 hours

const sessionId = randomBytes(32).toString("hex"); // random unique id

export const generateOTP = (length = OTP_LENGTH) => {
    return randomInt(0, 10 ** length) // 0 to 100000 (6 digits)
        .toString() 
        .padStart(length, "0"); // ensure always 6 digits e.g. 451232 -> 00451232
}

const hashOTP = (otp: string) => { return  Bun.hash(otp).toString(); };

export const saveOTP = async ({ userId, role, otpInput, phoneNumber, username }: { userId: string, role: string, otpInput: string; phoneNumber: string, username: string }) => {
    await redis.set(`otp:session:${sessionId}`, JSON.stringify({
        userId,
        role,
        otp: hashOTP(otpInput),
        phoneNumber,
        username
    }), "EX", OTP_TTL);
    await redis.set(`otp_attempts:${userId}`, "0", "EX", OTP_TTL);

    return sessionId;
}

export const verifyOTP = async ({  otpInput, sessionId }: { sessionId: string, otpInput: string }) => {
    const getOTP = await redis.get(`otp:session:${sessionId}`);

    if (!getOTP) return {
        success: false,
        message: "OTP not found or expired"
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
            role: "admin" | "parent" | "teacher" | "invalid",
            otp: string, // hashed OTP
            phoneNumber: string,
            username: string 
        };
    
    if (parsedOTP.otp !== hashOTP(otpInput)) {
        return {
            success: false,
            message: "Invalid OTP"
        }
    }

    await redis.del(`otp:sesssion:${ sessionId }`);
    await redis.del(`otp_attempts:${ sessionId }`);

    return {
        success: true,
        message: "OTP verified"
    }
}

export const getOTPData = async ({ sessionId }: { sessionId: string }) => {
    const getOTP = await redis.get(`otp:session:${sessionId}`);

    if (!getOTP) return {
        success: false,
        message: "OTP not found or expired",
        phoneNumber: "",
        userId: "",
        role: "invalid"
    }

    const result =  JSON.parse(getOTP) as {
        userId: string,
        role: "admin" | "parent" | "teacher" | "invalid",
        otp: string, // hashed OTP
        phoneNumber: string,
        username: string 
    };

    return {
        success: true,
        message: "OTP found",
        phoneNumber: result.phoneNumber,
        userId: result.userId,
        role: result.role,
        username: result.username
    }
}

export const isSessionExist = async (sessionId: string) => {
    return await redis.exists(`otp:session:${sessionId}`);
}

export const checkOTPGeneration = async ({ phoneNumber }: { phoneNumber: string }) => {
  const key = `otp_generation:${phoneNumber}`;
  const generation = await redis.incr(key);

  // ✅ Set expiry only if key was newly created (first increment)
  if (generation === 1) {
    await redis.expire(key, OTP_GENERATION_TTL);
  }

  if (generation > MAX_OTP_GENERATION) {
    return false;
  }

  return true;
};
