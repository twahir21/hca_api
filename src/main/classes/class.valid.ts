import { t } from "elysia";

type validErr = {
    success: boolean;
    message: string;
}

export const classValidators = {
    createClass: t.Object({
        name: t.String({
            maxLength: 40,
            minLength: 2,
            error(): validErr {
                return {
                    success: false,
                    message: "Class name must be between 2-40 characters"
                }
            }
        })
    }),
    updateClass: t.Object({
        id: t.String({
            format: "uuid",
            error(): validErr {
                return {
                    success: false,
                    message: "Invalid Class ID"
                }
            }
        }),
        name: t.String({
            maxLength: 40,
            minLength: 2,
            error(): validErr {
                return {
                    success: false,
                    message: "Class name must be between 2-40 characters"
                }
            }
        })
    }), 
    deleteClass: t.Object({
        id: t.String({
            format: "uuid",
            error(): validErr {
                return {
                    success: false,
                    message: "Invalid Class ID"
                }
            }
        })
    }),
}