import { t } from "elysia";

type validErr = {
    success: false
    message: string;
}

export const linkValidations = {
    createUser: t.Object({
        schoolId: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "School ID is empty or not valid UUID"
                }
            }
        }),
        phone: t.String({
            minLength: 12,
            maxLength: 12,
            error(): validErr {
                return {
                    success: false,
                    message: "Phone is empty or invalid TZ number"
                }
            }
        }),
        email: t.String({
            format: "email",
            error(): validErr{
                return {
                    success: false,
                    message: "Email is empty or invalid"
                }
            }
        })
    }),
    initiateAccount: t.Object({
        username: t.String({
            maxLength: 40,
            minLength: 6,
            error(): validErr {
                return {
                    success: false,
                    message: 'Username must be 6-40 characters'
                }
            }
        }),
        password: t.String({
            minLength: 6,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false,
                    message: "Password must be 6-40 characters"
                }
            }
        }),
        fullName: t.String({
            minLength: 3,
            maxLength: 40,
            error(): validErr {
                return{
                    success: false,
                    message: "full name is not valid or empty"
                }
            }
        }),
        address: t.Optional(
            t.String({
                maxLength: 300,
                minLength: 3,
                error(): validErr {
                    return {
                        success: false,
                        message: "Address is empty or invalid"
                    }
                }
            })
        ),
        dob: t.Optional(
            t.Date({
                error(): validErr {
                    return {
                        success: false,
                        message: "Date of birth is empty or invalid"
                    }
                }
            })
        ),
        gender: t.Optional(
            t.UnionEnum(["male", "female"])
        )

    }),
    linkQuery: t.Object({
        token: t.String({
            minLength: 3,
            error() : validErr {
                return {
                    success: false,
                    message: "token must not be less than 3 characters"
                }
            }
        })
    })
}