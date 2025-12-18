export type baseLinkReturn = {
    success: boolean;
    message: string;
}

export type initiateAccountBody = {
    address?: string | undefined;
    gender?: "male" | "female" | undefined;
    dob?: Date | undefined;
    username: string;
    fullName: string;
    password: string;
}

export type sendTokenBody = {
    schoolId: string;
}