export const isProduction = true;

export const links = {
    serverLink: isProduction ? "https://api.highercareer.academy" : "http://localhost:8080",
    clientLink: isProduction ? "https://accounts.highercareer.academy" : "http://localhost:5173",
}

const isNeon = false;

export const dbLink = isNeon
  ? (isProduction
      ? process.env.NEON_PRD_URL!
      : process.env.NEON_DEV_URL!)
  : process.env.POSTGRES_URL_LOCAL!;

export const Port = isProduction ? 3000 : 8080;