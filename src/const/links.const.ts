export const isProduction = false;

export const links = {
    serverLink: isProduction ? "https://api.highercareer.academy" : "http://localhost:8080",
    clientLink: isProduction ? "https://accounts.highercareer.academy" : "http://localhost:5173",
}