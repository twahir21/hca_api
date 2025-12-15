function fib (n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// tracking func
export async function trackPerformance<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): Promise<ReturnType<T>> {
  // --- Start ---
  const startCpu = process.cpuUsage();
  const startMem = process.memoryUsage().heapUsed;
  const startTime = process.hrtime.bigint();

  // --- Run function (works with async or sync) ---
  let result: ReturnType<T>;
  try {
    result = await fn(...args);
  } catch (err) {
    throw err;
  }

  // --- End ---
  const endCpu = process.cpuUsage(startCpu);
  const endMem = process.memoryUsage().heapUsed;
  const endTime = process.hrtime.bigint();

  // --- Convert ---
  const memUsedMB = (endMem - startMem) / 1024 / 1024;
  const cpuUserSec = endCpu.user / 1e6;
  const cpuSysSec = endCpu.system / 1e6;
  const elapsedMs = Number(endTime - startTime) / 1e6;

  console.log(`⏱ Elapsed: ${elapsedMs.toFixed(2)} ms`);
  console.log(`🧠 Memory delta: ${memUsedMB.toFixed(4)} MB`);
  console.log(`⚙️ CPU: user ${cpuUserSec.toFixed(3)}s, system ${cpuSysSec.toFixed(3)}s`);

  return result;
}


