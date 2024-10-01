import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface RequestWithUser extends Request {
    user?: any;
  }

export const verifyToken = (req:RequestWithUser,resp:Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    if (!token) {
        return resp.status(401).json({
            response: "failure",
            message: "Access Denied. No token provided",
            data: {},
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        
        next();
    }catch(error){
        return resp.status(401).json({
            response: "failure",
            message: "Unauthorized. Invalid token",
            data: {},
        })

        next(error);
        
    }
}