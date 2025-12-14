import { parentPort } from "node:worker_threads";

// Example: calculate factorial (CPU-intensive)
function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// Listen for messages from main thread
parentPort?.on("message", (n: number) => {
  const result = factorial(n);
  parentPort?.postMessage(result); // send back the result
});
