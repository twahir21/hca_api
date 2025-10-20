import { db } from "../connections/drizzle.conn";
import { NextSMSHeaders } from "../const/headers.const";
import { smsDatabase } from "../main/messages/sms.db";
import { isSmsSuccess, sendSMS, SmsResult } from "../main/messages/sms.types";
import { sentSmsCountTable } from "../schema/sms.schema";
import { Set } from "../types/type";

// 1. Function to send sms
export const sendNextSMS = async ({ phoneArray, message, set, body } : { phoneArray: string[], message: string, set: Set, body: sendSMS }): Promise<{ success: boolean, message: string }> => {
    try {
        // 1. Define the API endpoint
        const response = await fetch("https://messaging-service.co.tz/api/sms/v1/text/single", {
        method: "POST",
        body: JSON.stringify({
            from: "HCA",
            to: phoneArray,
            text: message,
            reference: "Sending bulk sms"
        }),
        headers: NextSMSHeaders,
        redirect: "follow",
        });

        const result: SmsResult = await response.json();

        // console.dir(result, { depth: null, colors: true });

        // 2. Process the response in parallel without order
        const outcome = await Promise.all(
            result.messages.map(async (msg) => {
                if (!isSmsSuccess(msg)) {
                    set.status = "Bad Request";
                    return {
                        success: false,
                        message: msg.status.description
                    };
                }
                // insert a count (use redis for hot writes)
                await db.insert(sentSmsCountTable).values({
                    count: "sent",
                })
                return {
                    success: true,
                    message: msg.message
                }
            })
        );

        
        // 3. Return the response
        if (Array.isArray(outcome)) {
            const allSuccess = outcome.every(o => o.success);

            const savedMsg = await smsDatabase.saveSMS({
                    message: body.message,
                    set,
                    groupName: body.selectedGrp ? body.selectedGrp.groupName : "Individual",
                });

            return {
                success: allSuccess,
                message: allSuccess ? savedMsg.message : "Some receivers didn't deliver the message, check total SMS you have.",
            };
        }
        return outcome;


    } catch (error) {
        set.status = "Internal Server Error";
        return {
            success: false,
            message: error instanceof Error ? 
                        error.message :
                        "Something went wrong in sending sms"
        }
    }
}

// 2. Function to send OTP
// format of OTP message for auto detected by browsers
// ====================================================
// 123456 is your verification code for BlackCoder App.
// @yourdomain.com #123456
// ====================================================
export const sendOTPSMS = async ({ phoneArray, message, set } : { phoneArray: string[], message: string, set: Set }): Promise<{ success: boolean, message: string }> => {
    try {
        // 1. Define the API endpoint
        const response = await fetch("https://messaging-service.co.tz/api/sms/v1/text/single", {
        method: "POST",
        body: JSON.stringify({
            from: "HCA",
            to: phoneArray,
            text: message.trim(),
            reference: "Sending bulk sms"
        }),
        headers: NextSMSHeaders,
        redirect: "follow",
        });

        const result: SmsResult = await response.json();

        result.messages.map( msg => {
            if (!isSmsSuccess(msg)) {
                set.status = "Bad Request";
                return {
                    success: false,
                    message: msg.status.description || "Failed to send OTP"
                };
            }
        })
        set.status = "Accepted";
        return {
            success: true,
            message: result.messages[0].status.description || "OTP sent successfully"
        }
    } catch (error) {
        set.status = "Internal Server Error";
        return {
            success: false,
            message: error instanceof Error ? 
                        error.message :
                        "Something went wrong in sending OTP"
        }
    }
}