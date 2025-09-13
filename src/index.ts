import { Elysia } from "elysia";
import { AllPlugins } from "./plugins/all.plugin";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .get("/", () => "Hello, from blackStack Elysia API")
  .use(cors())
  .use(AllPlugins)
  .listen(3000);

console.log(` SERVER:
    🚀 BlackStack Server initialized: 🦊 Elysia is running ... at http://${app.server?.hostname}:${app.server?.port}`);