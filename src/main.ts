import express, { Request, Response, NextFunction } from 'express';
import http from "http";
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from "socket.io"; 
import { connectDB, prisma } from './database/db';
import { apiRouter } from './routes/routes'
import { verifyToken } from './middlewares/authMiddleware';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app); 

const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
    },
});

app.use(express.json());
app.use(cookieParser());

async function startServer() {
    await connectDB();

    app.use((req: Request, resp: Response, next: NextFunction) => {
        const openRoutes = ['/signin', '/login', '/me'];
        if (openRoutes.some(route => req.path.endsWith(route))) {
            return next();
        }
        verifyToken(req, resp, next);
    });

    app.use('/api', apiRouter);

    app.get('/', (req: Request, resp: Response, next: NextFunction) => {
        resp.send('Hello World!');
    });

    app.use((err: Error, req: Request, resp: Response, next: NextFunction) => {
        console.error(err);
        resp.status(500).send('Something broke!');
    });

    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);

        socket.on('send_message', async (data) => {
            try {
                const { content, groupId, senderId } = data;

                const message = await prisma.message.create({
                    data: {
                        content,
                        senderId,
                        groupId,
                        createdAt: new Date(),
                    }
                });

                io.to(groupId).emit('receive_message', message);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('join_group', (groupId) => {
            socket.join(groupId);
            console.log(`User ${socket.id} joined group ${groupId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();