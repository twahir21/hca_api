import { t } from "elysia";

type validErr = {
    success: boolean;
    message: string;
}

export const subjectValidators = {
    createSubject: t.Object({
        name: t.String({
            maxLength: 40,
            minLength: 2,
            error(): validErr {
                return {
                    success: false,
                    message: "Subject name must be between 2-40 characters"
                }
            }
        })
    }),
    updateSubject: t.Object({
        id: t.String({
            format: "uuid",
            error(): validErr {
                return {
                    success: false,
                    message: "Invalid Subject ID"
                }
            }
        }),
        name: t.String({
            maxLength: 40,
            minLength: 2,
            error(): validErr {
                return {
                    success: false,
                    message: "Subject name must be between 2-40 characters"
                }
            }
        })
    }), 
    deleteSubject: t.Object({
        id: t.String({
            format: "uuid",
            error(): validErr {
                return {
                    success: false,
                    message: "Invalid Subject ID"
                }
            }
        })
    }),
}