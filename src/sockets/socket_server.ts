import http from "http";
import { Server,Socket } from "socket.io";
import { IncomingMessageFromClient } from "./message_handler";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

interface CustomSocket extends Socket {
    user?: {
      id: string;
    }
  }

export const setupSocket = (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            credentials: true,
            methods: ["GET", "POST", "PATCH"],
        }
    });

    io.use((socket: CustomSocket, next) => {
        if (socket.handshake.headers.cookie) {

            const cookies = cookie.parse(socket.handshake.headers.cookie);
            const token = cookies.jwt; 

            if (token) {
                jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
                    if (err) return next(new Error('Authentication error'));
                    if (typeof decoded === 'object' && 'id' in decoded) {
                        socket.user = { id: decoded.id }; // Ensure you have an `id` in the JWT payload
                        next();
                    } else {
                        next(new Error('Invalid token payload'));
                    }
                });
            } else {
                next(new Error('No token provided'));
            }
        } else {
            next(new Error('No cookies found'));
        }
    });


    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('send_message', (message) => {
            IncomingMessageFromClient(io, socket, message);
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    })
    return io;
}