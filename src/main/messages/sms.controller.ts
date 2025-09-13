import { NextSMSHeaders } from "../../const/headers.const";
import { isSmsSuccess, SmsResult } from "./sms.types";

export const smsController = {
    post: async (
        body: {
            message: string,
            singlePhone: string
        }
    ) => {
        console.log(body.message, " is a message ------- and phone is ", body.singlePhone);
        // 1. 
        try {
            const response = await fetch("https://messaging-service.co.tz/api/sms/v1/text/single", {
            method: "POST",
            body: JSON.stringify({
                from: "HCA",
                to: [ body.singlePhone ],
                text: body.message,
                reference: "Sending bulk sms"
            }),
            headers: NextSMSHeaders,
            redirect: "follow",
            });

            const result: SmsResult = await response.json();
            console.log("Result: ", result)
            for(const msg of result.messages){
                if (isSmsSuccess(msg)) {
                    return {
                        success: true,
                        message: "SMS sent successfully"
                    }
                }else{
                    return {
                        success: false,
                        message: msg.status.description
                    };
                }
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    },
    get: async () => {

        try {
            const response = await fetch("https://messaging-service.co.tz/api/sms/v1/balance", {
            method: "GET",
            headers: NextSMSHeaders,
            redirect: "follow",
            });

            const result: {sms_balance: number} = await response.json();
            return result.sms_balance;
        } catch (error) {
            console.error("Error fetching balance:", error);
            throw error;
        }
    }
}