import { t } from "elysia";

type validErr = {
    success: boolean;
    message: string;
}

export const schoolValidators = {
    createSchool: t.Object({
        name: t.String({
            maxLength: 40,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Name must be valid and between 3-40 characters"
                }
            }   
        }),
        code: t.String({
            maxLength: 60,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Code must be valid and between 3-60 characters"
                }
            }  
        }),
        address: t.String({
            maxLength: 60,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Address must be valid and between 3-60 characters"
                }
            }  
        }),
        phone: t.String({
            maxLength: 12,
            minLength: 12,
            error (): validErr {
                return {
                    success: false,
                    message: "Name must be valid and starts with 255"
                }
            }  
        }),
        bulkSMSName: t.String({
            maxLength: 20,
            minLength: 1,
            error (): validErr {
                return {
                    success: false,
                    message: "Sender SMS name is invalid or empty"
                }
            }
        }),
        email: t.String({
            maxLength: 60,
            minLength: 3,
            format: "email",
            error (): validErr {
                return {
                    success: false,
                    message: "Email must be valid and between 3-60 characters"
                }
            }  
        })
    }),
    updateSchool: t.Object({
        schoolId: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "School ID is empty or invalid UUID"
                }
            }
        }),
        name: t.String({
            maxLength: 40,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Name must be valid and between 3-40 characters"
                }
            }   
        }),
        code: t.String({
            maxLength: 60,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Code must be valid and between 3-60 characters"
                }
            }  
        }),
        address: t.String({
            maxLength: 60,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Address must be valid and between 3-60 characters"
                }
            }  
        }),
        phone: t.String({
            maxLength: 12,
            minLength: 12,
            error (): validErr {
                return {
                    success: false,
                    message: "Name must be valid and starts with 255"
                }
            }  
        }),
        bulkSMSName: t.String({
            maxLength: 20,
            minLength: 1,
            error (): validErr {
                return {
                    success: false,
                    message: "Sender SMS name is invalid or empty"
                }
            }
        }),
        email: t.String({
            maxLength: 60,
            minLength: 3,
            format: "email",
            error (): validErr {
                return {
                    success: false,
                    message: "Email must be valid and between 3-60 characters"
                }
            }  
        })
    }),
    deleteSchool: t.Object({
        schoolId: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "School ID is empty or invalid UUID"
                }
            }
        })
    }),
    getUserSchools: t.Object({
        userId: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "Invalid or empty userId"
                }
            }
        })
    })
}