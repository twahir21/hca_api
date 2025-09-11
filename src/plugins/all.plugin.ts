import Elysia from "elysia";
import { filePlugin } from "../main/file/file.plugin";
import { app } from "../main/file/file.controller";

export const AllPlugins = new Elysia({ name: "All mini API "})
    .use(filePlugin)
    .use(app)