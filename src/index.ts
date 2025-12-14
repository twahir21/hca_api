import { Elysia } from "elysia";
import { AllPlugins } from "./plugins/all.plugin";
import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";

const app = new Elysia()
  .onError(({ code, set }) => {
    if (code === "NOT_FOUND") {
      set.status = "Not Found";
      return {
        success: false,
        message: "404 Not Found :("
      }
    }
  })
  .use(openapi()) 
  .get("/", () => "Hello, from blackStack Elysia API")
  .use(cors(
    {
      origin: ["http://localhost:5173", "https://accounts.highercareer.academy"]
    }
  ))
  // used for rate-limiting, caching, analytics, custom header e.g. CORS
  .onRequest(({ request }) => {
    console.log("rate-limiting", request.url)
  })
  .use(AllPlugins)

  .listen(8080);

console.log(` 
  SERVER: 🚀 BlackStack Server initialized: 🦊 Elysia is running ... at http://${app.server?.hostname}:${app.server?.port}
`);