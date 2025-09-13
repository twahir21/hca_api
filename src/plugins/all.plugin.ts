import Elysia from "elysia";
import { filePlugin } from "../main/file/file.plugin";
import { bulkSMSPlugin } from "../main/messages/sms.plugin";

export const AllPlugins = new Elysia({ name: "All mini API "})
    .use(filePlugin)
    .use(bulkSMSPlugin)
