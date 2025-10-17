Perfect 🚀 — let’s go through **Mixins, Type Guards, Utility Types, Generics, and Unions** with clear examples.

---

# 🔹 1. Mixins

Mixins let you **compose classes** by adding reusable functionality without traditional inheritance (TS doesn’t allow multiple inheritance, so mixins are a workaround).

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

function CanLog<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(message: string) {
      console.log(`[LOG]: ${message}`);
    }
  };
}

function CanTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    getTimestamp() {
      return Date.now();
    }
  };
}

class BaseClass {}

class User extends CanTimestamp(CanLog(BaseClass)) {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}

const user = new User("Alice");
user.log("Hello");                 // [LOG]: Hello
console.log(user.getTimestamp());  // e.g., 1695827631113
```

👉 Mixins = “compose multiple behaviors into a class”.

---

# 🔹 2. Type Guards

Type guards let you **narrow types at runtime** so TS knows what you’re working with.

```ts
type Cat = { type: "cat"; meow(): void };
type Dog = { type: "dog"; bark(): void };
type Animal = Cat | Dog;

// Custom type guard
function isCat(animal: Animal): animal is Cat {
  return animal.type === "cat";
}

function handleAnimal(animal: Animal) {
  if (isCat(animal)) {
    animal.meow(); // ✅ TS knows it's a Cat
  } else {
    animal.bark(); // ✅ TS knows it's a Dog
  }
}
```

👉 Type guards = **runtime checks that inform the TS compiler**.

---

# 🔹 3. Utility Types

TS ships with powerful helpers.

```ts
type User = {
  id: number;
  name: string;
  email?: string;
};

// Partial<T> → makes everything optional
type UserDraft = Partial<User>;

// Pick<T, Keys> → pick only some fields
type UserPreview = Pick<User, "id" | "name">;

// Omit<T, Keys> → exclude some fields
type UserWithoutEmail = Omit<User, "email">;

// Required<T> → make all fields required
type UserFull = Required<User>;
```

👉 Utility types = shortcuts for common type transformations.

---

# 🔹 4. Generics

Generics let you write **reusable, type-safe functions and classes**.

```ts
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);       // type: number
const str = identity("hello");  // type: string

// Generic with constraints
function lengthOf<T extends { length: number }>(value: T): number {
  return value.length;
}

lengthOf("hello");  // 5
lengthOf([1, 2, 3]); // 3
```

👉 Generics = **templates for types**.

---

# 🔹 5. Unions

A type that can be **one of many options**.

```ts
type Status = "loading" | "success" | "error";

function printStatus(status: Status) {
  if (status === "loading") console.log("⏳ Loading...");
  else if (status === "success") console.log("✅ Success!");
  else console.log("❌ Error!");
}

printStatus("success");
```

For richer unions → **discriminated unions**:

```ts
type Circle = { kind: "circle"; radius: number };
type Square = { kind: "square"; side: number };
type Shape = Circle | Square;

function area(shape: Shape) {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.side ** 2;
  }
}
```

👉 Unions = **types that represent multiple possibilities**, often used with type guards.

---

✅ Summary:

* **Mixins** → combine class behaviors.
* **Type Guards** → runtime checks that refine types.
* **Utility Types** → quick transformations (`Partial`, `Pick`, `Omit`, `Required`, etc.).
* **Generics** → type-safe reusable templates.
* **Unions** → one type OR another (great for modeling states).

---

Would you like me to put all of these into a **single mini TypeScript cheatsheet file** (with comments + examples) so you can keep it handy for reference while coding?
