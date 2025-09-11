# to run tests
bun test index.test.ts

then the file is 
test("description", async () => {
    expect(func.result).toBe(ans)
})

## run autocannon for ts
autocannon -c 100 -d 30 -p 10 http://localhost:3000

test every route to know max number of users under limits

after building api, and test it, run autocannon to test the api

## retry mechanism
- During db deadlocks or timeout
- During network errors
- External api calls, e.g. payment gateway, ai, etc.
- cronjobs
- deleting or updating large number of records.

use Resend instead of nodemailer for emails with limit of 3000 emails per month. and 100 emails per day.

#### Elysia.
this will protect (validate) the entire Elysia app.
```ts
guard({
    body: t.Object({ 
        text: string;
    })
});
```
## CRON JOBS
1. Pattern:
┌────────────── second (optional, can be omitted)
│ ┌──────────── minute
│ │ ┌────────── hour
│ │ │ ┌──────── day of the month
│ │ │ │ ┌────── month
│ │ │ │ │ ┌──── day of week
│ │ │ │ │ │
* * * * * *

so if 6 pattern the first is second
if is 5 pattern start with minute

test yout pattern here https://crontab.guru/#5_*/1_2_*_1


## cors
```bash
    bun add @elysiajs/cors
```
```ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const app = new Elysia()
	.use(
		cors({
			origin: /.*\.saltyaom\.com$/
		})
	)
	.get('/', () => 'Hi')
	.listen(3000)
```

## types of auth
1. Bearer -> easiest but risky if token stolen.
2. Cookie -> old way good but not CSRF attacks
3. JWT -> good but when stolen user gets access until expire date
4. JWT + Cookie -> very secured but hard to implement (may overkill) for small APIs

### middlewares
.onBeforeHandle(() => "") runs before the route runs. used in auth checks and authorizations.

## error management
```ts
import { Elysia, file } from 'elysia'

new Elysia()
    .onError(({ code, error, path }) => {
        if (code === 418) return 'caught'
    })
    .get('/throw', ({ status }) => {
        // This will be caught by onError ==> the browser will show "caught"
        throw status(418)
    })
    .get('/return', ({ status }) => {
        // This will NOT be caught by onError ==> the browser will show "418"
        return status(418)
    })
```
### prefix
```ts
import { Elysia } from 'elysia'

new Elysia({ prefix: '/v1' }).get('/name', 'elysia') // Path is /v1/name
```

**for max request body size use**
```ts
import { Elysia } from 'elysia'

new Elysia({
	serve: {
		maxRequestBodySize: 1024 * 1024 * 256 // 256MB by default is 128MB
	}
})
```

**Increase Idle timeout**
```ts
import { Elysia } from 'elysia'

new Elysia({
	serve: {
		// Increase idle timeout to 30 seconds default is 10s
		idleTimeout: 30
	}
})
```

is recommended to put name for easily debugging
```ts
    new Elysia({ name: 'authentication' })
```
----------------------------------------------------------------------

#### Elysia Best Practices

----------------------------------------------------------------------
1. use mvc format like define:
```bash
 elysia_middleware --> controller/service/function --> caching in Redis/memory LRU -> model
 ```
Example: auth.plugin.ts -> auth.service.ts ->  -> auth.cache.ts -> auth.model.ts

2. Plugin handles routing, cookie validation/jwt/bearer/csrf tokens/xss and request validations.
3. Service is core of business logic e.g. creating a user.
4. model is database interaction with the service.
5. Server security (rate limiting, caching, analytics, custom header e.g. CORS)

# JWT is Json Web Token which is sent in Auth header as Bearer token or cookie.
- Even if user A knows id of user B, he will not be able to access user B's data.
- JWT uses signature. Even if attacker knows keys of JWT e.g. it users shopId and userId to 
sign, it not easy to attack.
-JWT has 3 parts separated by dot, header.payload.signature
- header contain sign-in algorithms e.g. HS256, RS256 -> HMAC
- payload contain data e.g. shopId, userId 
- signature, hash header + payload + secret key known only by server.
- attacker can create fake header + payload but not secret key. so will generate invalid token.

##### COOKIES AND AUTH
- Best of both worlds use bearer 5-15mins + refresh token (re-create token without login) stored in cookie. is best and most modern. We must handle token expiry and renewal.

- We can also use jwt in cookie but not modern since is mobile unsupported but simple but higher security risk than bearer.


### Sending/Receiving data to/from the server
1. Query params: ?key=value&key2=value2 this is used in Search/filter/pagination/sorting or changing something like language, theme, country, or give data in a month (time) etc.
or categories.

2. Path params:
     user/:userID or users/:userId/shops/:shopId, etc. is used to point which user should be updated

3. JSON: sends actual data, sensitive, complex more secure e.g. email, password, updated Email.

# File system:
const folder used to define something like defining api links, roles, etc
base used to define main func or oop like db(to select, update, etc), cache, etc. 
models are used to specify e.g. products.model.ts, user.model.ts, etc.


# SERVER SECURITY:
How to attack?
-> explore vulnerability and inject JavaScript to website which gives access to locaStorage/sessionStorage and cookies. the script reads jwt and send to attackers server.

httpOnly Cookie makes jwt more hard to get/stolen but not CSRF attacks.
CSRF is that browser is tricked and sends cookie to a wrong server.

CSRF tokens are implemented in PUT, POST, PATCH and DELETE actions / transfer funds
must be unpredictable
CSRF tokens stored in cookies

## connection pooler for database
use pgBouncer 

## types of XSS attacks
1. html/js injection
```html
<script>alert('XSS')</script>
<img src="x" onerror="alert('XSS')">
```
2. Attribute injection
```html
" onclick="alert('XSS') // user inject in certain attribute
```
3. Query Injection
```ts
/search?q=<script>alert(1)</script>
```

4. JSON/API injection
```json
{ "name": "<script>alert(1)</script>" }
```

Frontend
```tsx
// ✅ Safe (Qwik auto-escapes)
<div>{userInput}</div>

// ❌ Dangerous (if userInput contains HTML)
<div dangerouslySetInnerHTML={userInput} />
```

## types of CSRF attacks
create CSRF token with this code in Elysia backend
```ts
    const token = crypto.randomUUID();
    console.log(token)
```
1. Attacker tricks users to submit fake forms
```html
<form action="https://yourbank.com/transfer" method="POST">
  <input type="hidden" name="amount" value="1000">
  <input type="hidden" name="to" value="attacker">
</form>
<script>document.forms[0].submit()</script>
```
2. malicious requests
```html
<img src="https://yourbank.com/transfer?amount=1000&to=attacker">
```
3. Login CSRF

## SQL injection

```ts
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
user can say username = 1' OR 1=1; --` to attack === username = 1 OR 1=1
```

```sql
const sql = `SELECT * FROM users WHERE username = '${userInput}'`;
// If userInput is `' OR 1=1 --`, the query becomes a dangerous `SELECT * FROM users WHERE username = '' OR 1=1 --`