function TrackClassPerformance<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);

      for (const key of Object.getOwnPropertyNames(constructor.prototype)) {
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);
        if (descriptor && typeof descriptor.value === "function" && key !== "constructor") {
          const originalMethod = descriptor.value;

          Object.defineProperty(this, key, {
            ...descriptor,
            value: async (...methodArgs: any[]) => {
              const startCpu = process.cpuUsage();
              const startMem = process.memoryUsage().heapUsed;
              const startTime = process.hrtime.bigint();

              let result;
              let statusCode = 200;
              try {
                result = await originalMethod.apply(this, methodArgs);
              } catch (err) {
                statusCode = 500;
                throw err;
              } finally {
                const endCpu = process.cpuUsage(startCpu);
                const endMem = process.memoryUsage().heapUsed;
                const endTime = process.hrtime.bigint();

                const memUsedMB = (endMem - startMem) / 1024 / 1024;
                const cpuUserSec = endCpu.user / 1e6;
                const cpuSysSec = endCpu.system / 1e6;
                const elapsedMs = Number(endTime - startTime) / 1e6;

                // Extra metadata
                const logEntry = {
                  route: `/${key}`,       // default: method name as "route"
                  duration: elapsedMs,
                  timestamp: new Date(),
                  method: key,
                  statusCode,
                  userId: "guest",        // could be injected dynamically
                  sessionId: "abc123",    // e.g. from context
                  userAgent: "NodeJS",    // placeholder
                  ipAddress: "127.0.0.1", // placeholder
                  metrics: {
                    memoryDeltaMB: memUsedMB,
                    cpuUserSec,
                    cpuSysSec
                  }
                };

                console.log("📊 Log Entry:", JSON.stringify(logEntry, null, 2));
              }

              return result;
            }
          });
        }
      }
    }
  };
}

@TrackClassPerformance
class MathService2 {
  fib(n: number): number {
    return n <= 1 ? n : this.fib(n - 1) + this.fib(n - 2);
  }

  async simulateWork(ms: number): Promise<string> {
    await new Promise(r => setTimeout(r, ms));
    return "done!";
  }
}

// Example usage
const math2 = new MathService2();

console.log("Fibonacci result:", math2.fib(20));
math2.simulateWork(300).then(res => console.log("Async result:", res));
