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
        phone: string;
        userId: string;
    }
}