import http from "http";
import { Server } from "socket.io";
import { IncomingMessage } from "./message_handler";

export const setupSocket = (httpServer: http.Server) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH"],
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('send_message', (message) => {
            IncomingMessage(io, message);
        })

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    })
    return io;
}