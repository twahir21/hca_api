import { NextSMSHeaders } from "../../const/headers.const";
import { processExcel } from "../../func/file.func";
import { sendNextSMS } from "../../func/nextsms.func";
import { Set } from "../../types/type";
import { returnType, smsDatabase } from "./sms.db";
import { createGroup, editGroup, isSmsSuccess, massiveContact, sendSMS, SmsResult } from "./sms.types";

export const smsController = {
    sendViaExcel: async ({ file, set }: { file: File, set: Set }) => {
        return await processExcel({ file, set, requiredHeaders: ["Name", "Phone Number"] })
    },
    sendSMS: async ({ body, set }: { body: sendSMS, set: Set }): Promise<{ success: boolean, message: string }> => {
        try {                  
            switch(body.type) {
                case "contact": 
                    // 1. Ensure in contact field either single phone or contact selection
                    const validSelections = Object.entries(body.contactSelection?.selected ?? {})
                                        .filter(([id, value]) => value === true)
                                        .map(([id]) => id)

                    if (validSelections.length === 0 && body.phone === 0) {
                        set.status = "Bad Request";
                        return {
                            success: false,
                            message: "You must at least Enter phone number or select one contact"
                        }
                    }

                    // 2. get phone numbers from ids of validSelections
                    const phoneNumbers = await smsDatabase.getPhoneNumbers({ ids: validSelections });

                    // 3. convert single phone to string for the send
                    const singlePhone =  body.phone?.toString() ?? "0";
                
                    // 4. make sure phone number is valid if used
                    if(Number(singlePhone) > 0) {
                        if (!singlePhone.startsWith("255") || singlePhone.length > 13) {
                            set.status = "Bad Request";
                            return {
                                success: false,
                                message: "Phone number is invalid, it must start with 255"
                            }
                        }
                        // 4.1 The Number is used and valid
                        phoneNumbers.push(singlePhone);
                    }

                    // 5. send sms in contact field
                    return await sendNextSMS({ phoneArray: phoneNumbers, message: body.message, set, body });

                case "group": 

               // 1. ensure that selected group is never null
                if(body.selectedGrp === null || body.selectedGrp === undefined) {
                    set.status = "Bad Request";
                    return {
                        success: false,
                        message: "Selected group cannot be empty"
                    }
                }

                // 2. send sms in group field
                return await sendNextSMS({ 
                    phoneArray: body.selectedGrp.contacts.map(c => c.contactPhone), 
                    message: body.message, 
                    set, 
                    body 
                });


                case "upload": 
                // 1. Obtain all data from file
                if (body.file?.length === 0) {
                    set.status = "Bad Request";
                    return {
                        success: false,
                        message: "You must upload a valid File"
                    }
                }

                // 2. send sms in upload field
                return await sendNextSMS({ phoneArray: body.file?.map(f => f.phone) ?? [], message: body.message, set, body });

                default: 
                return {
                    success: false,
                    message: "Invalid case type. Check your request"
                }
            }

        } catch (error) {
            set.status = "Internal Server Error";
            return {
                success: false,
                message: error instanceof Error ? error.message : "Something went wrong"
            }
        }
    },
    get: async ({ set }: { set: Set }) => {

        try {
            const response = await fetch("https://messaging-service.co.tz/api/sms/v1/balance", {
            method: "GET",
            headers: NextSMSHeaders,
            redirect: "follow",
            });

            const result: {sms_balance: number} = await response.json();
            set.status = "OK";
            return result.sms_balance;
        } catch (error) {
            set.status = "Internal Server Error";
            return 0;
        }
    },
    massiveContactsUpload: async ({ body, set } : { body: massiveContact, set: Set }) => {
        return await smsDatabase.createMassiveContacts({ body, set })
    },
    addingContact: async ( body: {
        name: string,
        phone: string
    }, set : Set ): Promise<{
        success: boolean,
        message: string
    }> => {
        const result = await smsDatabase.createContact({ name: body.name, phone: body.phone }, set)
        return {
            success: result.success,
            message: result.message
        }
    },
    fetchContacts: async ({ currentPage, limit, set, search }: { 
        currentPage: string; limit: string; set: Set, search: string
    }): Promise<returnType> => {
        return await smsDatabase.fetchContacts({ limit, currentPage, search, set });
    },
    deleteContacts: async ({ set, body }: { set: Set, body: { id: string } }) => {
        return await smsDatabase.deleteContacts({ set, body });
    },
    updateContact: async ({ body, set }: { body: { id: string; name: string; phone: string;}, set: Set }) => {
        return await smsDatabase.updateContact({ body, set });
    },
    createGroup: async ({ body, set } : { body: createGroup, set: Set }) => {
        return await smsDatabase.createGroup({ body, set });
    },
    getGroups: async ({ currentPage, limit, search, set }: { currentPage: string; limit: string; search: string; set: Set }) => {
        return await smsDatabase.getGroups({ currentPage, limit, search, set });
    },
    deleteGroup: async ({ set, body }: { set: Set, body: { id: string } }) => {
        return await smsDatabase.deleteGroup({ set, body });
    },
    editGroup: async ({ body, set }: { body: editGroup, set: Set }) => {
        return await smsDatabase.editGroup({ body, set });
    },
    smsAnalytics: async ({ set }: { set: Set }) => {
        return await smsDatabase.smsAnalytics({ set });
    },
    getRecentSMS: async ({ set, currentPage, limit, search }: { set: Set, currentPage: string, limit: string, search: string }) => {
        return await smsDatabase.getRecentSMS({ set, currentPage, limit, search });
    }
}
