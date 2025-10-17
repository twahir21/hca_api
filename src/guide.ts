import { Elysia, file } from "elysia";

const app = new Elysia()
// if u define only cookie, will take any cookie saved but u need to specify name e.g. session
// use guard to cover all routes
.guard({
  beforeHandle({ cookie: { username }, status, set }){
    console.log("hello")
    console.log(username.value);
    set.headers = { 'authorization' : 'Bearer twahir_the_blackCoder!' };
    if (!username) return status(401, "Unauthorized")
  }
})
.onAfterResponse(() => {
  console.log('Response', performance.now())
})
// used for rate-limiting, caching, analytics, custom header e.g. CORS
.onRequest(() => {
  console.log("This runs every new request is received, used for rate-limiting")
})
.get("/getfile", ({ request, server }) => {
  console.log("IP: ", server?.requestIP(request))
  // return "Hello Elysia"
  return file("index.ts") // return file
}, {
  // another way to implement in specific route
  // beforeHandle() {
  //   console.log("another way to implement in specific route")
  // }
})
.get("/home", "welcome to sudi technology", {
  afterHandle() {
    console.log("This  will run after main func (handler) of the home route is executed")
  }
})
// Derive runs before validation so as to change info before server runs e.g. Bearer token
// since elysia is Dx friend u can join derive and guard
.derive(({ headers }) => {
    const auth = headers['Authorization']

    return {
        bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
    }
})
.state('version', 1) // global state. it can also be object, number, string .etc
.get("/version", ({ store }) => store.version) // mutates the state value
.get("/sign", ({ bearer }) => console.log("Bearer: ", bearer ))
.get("/profile", ({ set }) => {
  // set.headers["authorization"] = "Bearer token";
  set.headers = { 'authorization' : 'Bearer token' };
  console.log(set.headers)
})
  // error handling and set status code
    .onError(({ code, status, set }) => {
        if (code === 'NOT_FOUND') return status(404, '404 Not Found :(')
        // code can be "UNKNOWN" | "VALIDATION" | "NOT_FOUND" | "PARSE" | "INTERNAL_SERVER_ERROR" | "INVALID_COOKIE_SIGNATURE" | "INVALID_FILE_TYPE"
      // or number based on http status
    })
    .get('/youtube', ({ redirect }) => {
        return redirect('https://youtu.be/whpVWVWBW4U?&t=8')
    })
    .get("/file", file("index.ts")) // for file handling
    .get("/sse", function* () {
      yield "Hello Elysia FROM Server-Sent Events"; // SSE
    })

.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
