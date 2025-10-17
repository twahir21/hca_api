type mainLoginType = {
    success: boolean,
    message: string
};


export type loginBody = {
    username: string,
    password: string,
    sessionId: string;
}

export interface loginReturn extends mainLoginType {
    data: { 
        role: "admin" | "parent" | "teacher" | "invalid";
        username: string;
        phone: string;
        userId: string;
    }
}