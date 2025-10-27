import crypto from "crypto";

function generateActivationToken(): string {
  const token =  crypto.randomBytes(32).toString("hex");
  console.log("Token: ", token) // 64 chars, strong randomness
  return token
}

generateActivationToken()