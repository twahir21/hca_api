```ts            
console.log("memory used: ", (process.memoryUsage().heapUsed/1024/1024).toFixed(2), "MB. cpu used: ", (process.cpuUsage().user/1e6).toFixed(2), "seconds");
```
### The above info used to :

1. Use it for monitoring (to see if memory/CPU usage grows abnormally).

2. Detect memory leaks: if heapUsed grows steadily and never drops, you have a leak.

3. Detect CPU-bound work: if CPU time spikes but requests aren’t I/O-heavy, you may need worker threads, clustering, or move heavy computation out of request loop.