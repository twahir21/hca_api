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
        }),
        level: t.UnionEnum(["pre-primary", "primary", "O-level", "A-level", "higher-education"])
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
        }),
        level: t.UnionEnum(["pre-primary", "primary", "O-level", "A-level", "higher-education"])

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