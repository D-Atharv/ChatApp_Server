import { Response } from "express";
export const setTokenCookie = (resp : Response , token : string,userID: string) => {
    const cookieName = `jwt_${userID}`
    resp.cookie(cookieName,token,{ 
        httpOnly: true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'strict',
        maxAge : 15 * 60 * 1000
    });
}