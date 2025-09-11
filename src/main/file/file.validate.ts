import { t } from "elysia";

export const FileValidation = {
    upload: t.Object({
        excelFile: t.File()
    })
}