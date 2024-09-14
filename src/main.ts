import express, { Request, Response, NextFunction } from 'express';
import http from "http";
import { connectDB } from './database/db';
import { apiRouter } from './routes/routes'
import { setupSocket } from './sockets/socket_server';

import dotenv from 'dotenv'
dotenv.config();

const app = express();
app.use(express.json())

async function startServer() {
    await connectDB();

    const httpServer = http.createServer(app); //allowing the app (Express) to handle HTTP requests
    const io = setupSocket(httpServer);

    app.use('/api', apiRouter);

    app.get('/', (req: Request, resp: Response, next: NextFunction) => {
        resp.send('Hello World!');
    });

    app.use((err: Error, req: Request, resp: Response, next: NextFunction) => {
        console.error(err);
        resp.status(500).send('Something broke!');
    });

    const port = process.env.PORT || 3000;
    httpServer.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();
