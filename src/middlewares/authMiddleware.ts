import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface RequestWithUser extends Request {
    user?: any;
}

declare global {
    namespace Express {
        export interface Request {
            user?: {
                id: string;
            }
        }
    }
}

export const verifyToken = (req: RequestWithUser, resp: Response, next: NextFunction) => {


    const cookies = req.cookies;

    const jwtCookie = Object.keys(cookies).find(cookie => cookie.startsWith('jwt_'));

    if (!jwtCookie) {
        return resp.status(401).json({
            response: "failure",
            message: "Access Denied. No token provided",
            data: {},
        });
    }
    const token = cookies[jwtCookie];
    if (!token) {
        return resp.status(401).json({
            response: "failure",
            message: "Unauthorized. Invalid token",
            data: {},
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;

        next();
    } catch (error) {
        return resp.status(401).json({
            response: "failure",
            message: "Unauthorized. Invalid token",
            data: {},
        })

        next(error);

    }
}




