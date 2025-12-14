import { HTTPHeaders, StatusMap } from "elysia";
import { ElysiaCookie } from "elysia/dist/cookies";

export type Set =  {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, ElysiaCookie>;
}

export type baseReturn = {
    success: boolean;
    message: string;
    details: string;
}
