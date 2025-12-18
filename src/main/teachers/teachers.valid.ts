import { t } from "elysia";

type validErr = {
    success: boolean;
    message: string;
}

export const TeachersValidators = {
    createTeacher : t.Object({
        name: t.String({
            minLength: 3,
            maxLength: 40,
            error (): validErr {
                return {
                    success: false,
                    message: "Name must be between 3-40 characters"
                }
            }
        }),
        phone: t.String({
            maxLength: 12,
            minLength: 12,
            error (): validErr {
                return {
                    success: false,
                    message: "Phone number must be valid tz 255XXXXXXXXX"
                }
            }
        }),
        subjects: t.String({
            maxLength: 40,
            minLength: 2,
            error (): validErr {
                return {
                    success: false,
                    message: "Subject must be between 2-40 characters"
                }
            }
        }),
        class: t.String({
            maxLength: 40,
            minLength: 3,
            error (): validErr {
                return {
                    success: false,
                    message: "Class must be between 3-40 characters"
                }
            }
        })
    }),
    saveTeacher: t.Object({
        username: t.String({
            maxLength: 40,
            minLength: 3,
            error(): validErr {
                return {
                    success: false,
                    message: 'Username must be 3-40 characters'
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
        })
    }),
    teacherQuery: t.Object({
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