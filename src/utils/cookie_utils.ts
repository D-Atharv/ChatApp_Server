import { Response } from "express";

export const setTokenCookie = (resp : Response , token : string) => {
    resp.cookie('jwt',token,{ 
        httpOnly: true,
        secure : process.env.NODE_ENV == 'production',
        sameSite : 'strict',
        maxAge : 15 * 60 * 1000
    });
}