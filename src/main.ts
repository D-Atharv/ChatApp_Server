import express, { Request, Response, NextFunction } from 'express';
import http from "http";
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db';
import { apiRouter } from './routes/routes'
import { setupSocket } from './sockets/socket_server';
import { verifyToken } from './middlewares/authMiddleware'
import cors from 'cors';

import dotenv from 'dotenv'
dotenv.config();

const app = express();
app.use(express.json())
app.use(cookieParser());


async function startServer() {
    await connectDB();

    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001'],
    }));

    const httpServer = http.createServer(app); //allowing the app (Express) to handle HTTP requests
    const io = setupSocket(httpServer);

    app.use((req:Request, resp : Response, next: NextFunction) => {
        const openRoutes = ['/signin', '/login'];

        if (openRoutes.some(route => req.path.endsWith(route))){
            return next();
        }

        verifyToken(req, resp, next);
    }) 
    
    app.use('/api', apiRouter);
    

    app.get('/', (req: Request, resp: Response, next: NextFunction) => {
        resp.send('Hello World!');
    });
    

    app.use((err: Error, req: Request, resp: Response, next: NextFunction) => {
        console.error(err);
        resp.status(500).send('Main middleware called. Something broke!');
    });

    const port = process.env.PORT || 3000;
    httpServer.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();
