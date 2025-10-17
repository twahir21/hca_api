
// 1. Hash func from bun
export const hash = async ( password: string ) => await Bun.password.hash(password); 

// 2. Verify func from bun
export const isMatch = async ({ password, hash }: { password: string, hash: string }) => await Bun.password.verify(password, hash);
