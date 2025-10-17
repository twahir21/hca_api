import { Elysia } from "elysia";
import { Worker } from "node:worker_threads";
import path from "path";

const app = new Elysia();

// CPU-heavy endpoint using worker
app.get("/factorial/:n", async (c) => {
  const n = Number(c.params.n);

  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve("./heavy-task.ts"));
    worker.postMessage(n);

    worker.on("message", (result) => {
      resolve({ n, factorial: result });
      worker.terminate(); // free resources
    });

    worker.on("error", (err) => reject(err));
  });
});

app.listen(3000, () => console.log("Elysia running on http://localhost:3000"));

// run with bun run --threads=4 server.ts
