function TrackPerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const startCpu = process.cpuUsage();
    const startMem = process.memoryUsage().heapUsed;
    const startTime = process.hrtime.bigint();

    let result;
    try {
      result = await originalMethod.apply(this, args);
    } catch (err) {
      throw err;
    }

    const endCpu = process.cpuUsage(startCpu);
    const endMem = process.memoryUsage().heapUsed;
    const endTime = process.hrtime.bigint();

    const memUsedMB = (endMem - startMem) / 1024 / 1024;
    const cpuUserSec = endCpu.user / 1e6;
    const cpuSysSec = endCpu.system / 1e6;
    const elapsedMs = Number(endTime - startTime) / 1e6;

    console.log(`⏱ [${propertyKey}] Elapsed: ${elapsedMs.toFixed(2)} ms`);
    console.log(`🧠 [${propertyKey}] Memory delta: ${memUsedMB.toFixed(4)} MB`);
    console.log(`⚙️ [${propertyKey}] CPU: user ${cpuUserSec.toFixed(3)}s, system ${cpuSysSec.toFixed(3)}s`);

    return result;
  };

  return descriptor;
}


class MathService {
  @TrackPerformance
  fib(n: number): number {
    return n <= 1 ? n : this.fib(n - 1) + this.fib(n - 2);
  }

  @TrackPerformance
  async simulateWork(ms: number): Promise<string> {
    await new Promise(r => setTimeout(r, ms));
    return "done!";
  }
}

const math = new MathService();

console.log("Fibonacci result:", math.fib(20));
math.simulateWork(500).then(res => console.log("Async result:", res));
