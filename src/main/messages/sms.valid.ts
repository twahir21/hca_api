import { t } from "elysia";
type validErr = {
    success: boolean;
    message: string;
}

export const smsValidation = {
    verifyExcel: t.Object({
        message: t.String({
            minLength: 2,
            maxLength: 160,
            error(): validErr {
                return {
                    success: false,
                    message: "Message must be between 2-160 characters"
                }
            }
        }),
        singlePhone: t.String({
            maxLength: 20,
            minLength: 8,
            error(): validErr {
                return {
                    success: false,
                    message: "Phone Number must be valid."
                }
            }
        })
    }),
    contactPost: t.Object({
        name: t.String({
            minLength: 2,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Name must be between 2-40 characters'
                }
            }
        }),
        phone: t.String({
            minLength: 12,
            maxLength: 12,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Phone must be valid starts with 255'
                }
            }            
        })
    })
}