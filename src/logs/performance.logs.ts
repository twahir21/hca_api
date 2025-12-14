export async function trackPerformance<T extends (...args: any[]) => any>(
  fn: T,
  additionalInfo : { 
        route: string,
        timestamp: number,
        method?: string,
        statusCode?: any
    },
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

  console.log(`📦 Route: ${additionalInfo.route}`);
  console.log(`⏱ Time taken: ${elapsedMs.toFixed(2)} ms`);
  console.log(`🧠 Memory delta: ${memUsedMB.toFixed(4)} MB`);
  console.log(`⚙️ CPU: user ${cpuUserSec.toFixed(3)}s, system ${cpuSysSec.toFixed(3)}s`);
  console.log(`📅 timestamp: ${additionalInfo.timestamp}`);
  console.log("Also implement total memory usage and CPU usage by the entire system");
  console.log(`Status code : ${additionalInfo.statusCode}`)
  console.log("Method used: ", additionalInfo.method)
  console.log(`------------------------------------------------------------`)

  return result;
}


interface AdvancedPerformanceMetric {
  route: string;
  duration: number;
  timestamp: Date;
  method: string;
  statusCode: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
  databaseQueryCount?: number;
  cacheHitRate?: number;
}