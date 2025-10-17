Exactly 🚀 you nailed it — `OFFSET` works fine for small/medium datasets, but once your table has **hundreds of thousands or millions of rows**, it slows down badly because the DB still scans through all skipped rows before returning results.

👉 That’s why we use **keyset pagination** (also called *cursor-based pagination*).

---

## 🔹 Keyset Pagination (fastest way)

Instead of saying:

> “Skip 100,000 rows, give me the next 20”

You say:

> “Start **after the last ID I already have**, give me the next 20”

This way, the database can use the **index directly** and doesn’t need to count/skip.

---

### Example with `id` (ascending)

```sql
-- Instead of OFFSET
SELECT * FROM contacts
ORDER BY id
LIMIT 20 OFFSET 100000;

-- Keyset way:
SELECT * FROM contacts
WHERE id > 100000
ORDER BY id
LIMIT 20;
```

✅ Much faster: the DB just jumps straight to `id > 100000` and reads forward.

---

### 🔹 How to implement in your API

Let’s assume you paginate by `id`:

```ts
import { db } from './db';
import { contactsTable } from './schema';

export async function getContacts(cursor: number | null, limit: number) {
  const rows = await db
    .select({
      id: contactsTable.id,
      name: contactsTable.name,
      phone: contactsTable.phone,
    })
    .from(contactsTable)
    .where(cursor ? (contactsTable.id.gt(cursor)) : undefined) // only fetch after last id
    .orderBy(contactsTable.id)
    .limit(limit);

  const nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;

  return {
    items: rows,
    nextCursor, // for the next page request
  };
}
```

---

### 🔹 API Response Example

```json
{
  "items": [
    { "id": 101, "name": "Mary", "phone": "123" },
    { "id": 102, "name": "John", "phone": "456" }
  ],
  "nextCursor": 102
}
```

* The **frontend stores `nextCursor`** (the last row’s id).
* When requesting the next page, send `?cursor=102&limit=20`.
* API gives you the next slice.

---

### 🔹 Pros & Cons

✅ Super fast (DB uses index lookups, no row skipping).
✅ Scales to millions of rows.
✅ Stable ordering (no weird shifts if rows are inserted).

⚠️ You can’t jump to “page 50” directly (like with offset). Instead, you go **page by page** using cursors. This is why modern APIs (Twitter, GitHub, etc.) use **cursor pagination**.

---

👉 Do you want me to show you how to **wire this cursor-based pagination to your Qwik frontend** (so it replaces your offset/limit approach)?
