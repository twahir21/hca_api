Awesome question. Here’s a practical, production-style pattern for **access + refresh tokens** with **Elysia (Bun)**, **Drizzle (Postgres)**, and **Redis**—including **Bearer auth**, **rotation**, and **revocation**.

I’ll keep it tight and actionable.

---

# What to store

* **Access token (JWT)**

  * **Lifetime:** short (5–15 min).
  * **Transport:** client sends as `Authorization: Bearer <accessToken>`.
  * **Server storage:** *don’t store the token*, but **do** store its **`jti`** in Redis for *blacklisting* (only when you need to revoke before expiry) with TTL = token’s remaining life.
* **Refresh token (opaque random string)**

  * **Lifetime:** long (7–30 days).
  * **Transport:** send to client in **HttpOnly, Secure, SameSite=Strict** cookie.
  * **Server storage:** **store a hash** of the refresh token in Postgres (never plaintext) with: `id`, `userId`, `hash`, `expiresAt`, `revokedAt`, `parentId` (for rotation lineage), `userAgent`, `ip`.

This gives you:

* Stateless **access** tokens (fast).
* Stateful **refresh** tokens (rotatable + revokable).
* If a refresh token is stolen, you can **revoke** it and its family.

---

# High-level flow

1. **Login**

   * Verify credentials.
   * Issue **access JWT** (short TTL, includes `jti`).
   * Create **refresh token** (random 256-bit), store **hash** in DB, set cookie.
2. **Authenticated API**

   * Read `Authorization: Bearer <jwt>`.
   * Verify signature & expiry.
   * Optionally check Redis blacklist for `jti`.
3. **Refresh**

   * Read refresh cookie.
   * Find token row (by `id`/lookup key) and verify **hash** + not revoked + not expired.
   * **Rotate:** mark old as `revokedAt` and create a new refresh token row linked via `parentId`.
   * Issue a brand new access JWT and set **new** refresh cookie.
   * **Reuse detection:** if a refresh token is used twice (already revoked), revoke its **entire family**.
4. **Logout**

   * Revoke current refresh token (and optionally family).
   * Blacklist current access token `jti` in Redis (TTL = remaining seconds).

---

# Drizzle schema (Postgres)

```ts
// drizzle schema (simplified)
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  hash: text("hash").notNull(),         // argon2 hash of the refresh token
  parentId: uuid("parent_id"),          // for rotation lineage (optional)
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  familyId: uuid("family_id").notNull() // same value for initial token + its rotations
});
```

> Tip: put an index on `(user_id, family_id)` and `expires_at`.

---

# Elysia setup (JWT plugin + Redis)

* **JWT:** use `@elysiajs/jwt` to sign/verify access tokens. Include `sub` (user id), `role`, and **`jti`** (uuid).
* **Redis:** store `blacklist:<jti>` = 1 with TTL (seconds till JWT exp) when revoking early.

**Access token claims (example)**

```json
{
  "sub": "<user-id>",
  "role": "admin|assistant",
  "jti": "<uuid>",
  "iat": 1730000000,
  "exp": 1730000600
}
```

**Cookie settings (refresh)**

* `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/auth/refresh` (optionally limit path).

---

# Rotation & reuse detection

* On successful refresh:

  * `revokedAt` the **old** refresh row.
  * Create a **new** refresh row with same `familyId`, `parentId = old.id`.
  * Issue new access JWT.
* If someone tries to use a **revoked** refresh token:

  * **Compromise detected** → revoke *entire family* (`revokedAt` for all rows with that `familyId`), force re-login.

---

# Should you store the access token itself in DB?

* **No.** Store **only** its `jti` in Redis **when** you must revoke it before expiry. Otherwise, let it expire naturally.
* Keep access tokens **short-lived** to minimize risk.

---

# Endpoint sketch (pseudocode with Elysia)

### Init

* `/auth/login` – create access+refresh
* `/auth/refresh` – rotate refresh, mint access
* `/auth/logout` – revoke refresh (and optionally family), blacklist access jti
* Protected routes use a **Bearer middleware**

### Login

1. Look up user, verify password.
2. `jti = uuid()`, sign access JWT (10m).
3. `refresh = random(32 bytes)`; `hash = argon2(refresh)`.
4. Insert refresh row with `expiresAt` (e.g., now + 14 days), `familyId` (uuid fixed per session family).
5. `Set-Cookie: refreshToken=<id:token>` → recommend storing the **opaque token** itself, but in DB you store **hash**.

   * Practical trick: cookie value can be `<tokenId>.<tokenSecret>` so you can select by `tokenId` quickly, then compare hash of `tokenSecret`.

### Middleware (Bearer)

* Parse `Authorization` header.
* Verify JWT signature and expiration.
* Check `redis.exists(blacklist:<jti>)` → if present, reject.

### Refresh

* Read refresh cookie → split `{tokenId}.{secret}`.
* Find row by `tokenId`. Check:

  * not expired
  * `revokedAt` is null
  * `argon2.verify(row.hash, secret)` true
* **Rotate**: set `revokedAt = now()` on current row; create a new row with `parentId=current.id`, same `familyId`.
* Issue new access token (new `jti`) and **new** refresh cookie.
* If token was already revoked → **reuse** → revoke **all** rows in `familyId` and 401.

### Logout

* Revoke current refresh row (`revokedAt = now()`).
* Optionally revoke entire family.
* Blacklist access `jti` (TTL = seconds until `exp`).
* Clear refresh cookie.

---

# Security checklist

* **Refresh cookie:** `HttpOnly`, `Secure`, `SameSite=Strict`, **short path** (e.g. `/auth/refresh`).
* **Access token:** never in cookies; always **Authorization: Bearer**.
* **Rotate** on every refresh.
* **Reuse detection** → revoke family.
* **Device awareness:** store `userAgent`, `ip` for audit; allow admin to view & invalidate sessions.
* **Rate limit** `/auth/login` and `/auth/refresh`.
* **CSRF:** not needed for Bearer APIs, but your **/auth/refresh** uses a cookie—either:

  * make it **POST** with **SameSite=Strict** cookie **and** a **double-submit CSRF token**, or
  * require an **Authorization header** along with the cookie to mitigate CSRF.
* **Hash refresh tokens** (argon2id) in DB; never store plaintext.

---

# Answers to your specific questions

* **“Is it harder than just a JWT in cookie?”**
  Slightly, because you add `/refresh`, DB rows for refresh tokens, rotation logic, and revocation. But it’s the industry-standard secure pattern.

* **“If a hacker steals the refresh token cookie, is it same as stealing a JWT cookie?”**
  It’s **serious**, because the attacker can mint new access tokens. The difference is: you can **revoke** refresh tokens and their **family**, cutting off future access. With a lone long-lived JWT in a cookie, you **can’t** revoke it statelessly.

* **“Do we store the access key or just an id to access key in DB?”**
  Store **neither** by default. Only store the **`jti`** in Redis **when** you need to blacklist (revocation before expiry). For refresh tokens, store a **hash** in DB.

---

If you want, I can drop in **concrete Elysia code snippets** for:

* JWT plugin init
* Login route
* Bearer middleware
* Refresh (with rotation+reuse detection)
* Logout (with revocation + blacklist)

Say the word and I’ll tailor it to your current project structure.
