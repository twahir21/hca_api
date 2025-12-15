let hits = 0;

export const metricsLogs = (request: Request, server: Bun.Server | null) => {
    console.log("Request method: ", request.method);
    console.log("Request url: ", request.url)
    console.log("Sever: ", server?.requestIP(request)?.address);
    console.log("Hitted: ", hits++, " times")
}