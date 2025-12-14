export const NextSMSHeaders = new Headers({
    "Authorization": process.env.NEXT_AUTH_HEADER ?? "Basic c3ViY3VzdG9tZXI6MTIzNDU2",
    "Content-Type": "application/json",
    "Accept": "application/json",
});