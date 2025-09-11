npx autocannon -c 100 -d 20 http://localhost:3000/products
# -c means concurrency (number of requests at the same time), 
# -d duration in seconds (time to run the test)
# autocannon needs nodejs (npx)

# autocannon results:
# at the end reads total Requests. e.g. 69k requests in 20s
# req/s: read avg value e.g. 3442
# latency: read avg value e.g. 28ms should be < 50ms (excellent)
# max latency spike: read max value of latency

# test up to 10,000 concurrency, make sure server can't crush under high stress to if stable

# if in small concurrency (connections) server is fast and in large is slow, 
# your server queue requests instead of reject or load balance.
# either DB call, middleware or bun event loop is overwhelmed
# bun/node garbage collector/ memory start pausing ->  leds up to 3s latency
# no connection pooler like pgBouncer

## next step, try 1000 users then 5000 and monitor CPU and memory
# -d 20 is average time but serious testing is -d 60 or -d 120 which could say more perfect results

### maximum limits:
# latency avg < 100ms and max < 500ms
# req/s, good is 50k to 500k lowest is 3k
# error Rate (5xx/timeout), good is 0.1% lowest < 1%
# look memory and cpu usage and should be < 70%
# connection pool saturation in DB, should be < 70%
# use htop to monitor CPU and memory