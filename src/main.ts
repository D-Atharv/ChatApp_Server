import express, { Request, Response, NextFunction } from 'express';
import http from "http";
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db';
import { apiRouter } from './routes/routes';
import { verifyToken } from './middlewares/authMiddleware';
import { setupSocket } from './sockets/socket'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

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

    app.get('/', (req: Request, resp: Response) => {
        resp.send('Hello World!');
    });

    app.use((err: Error, req: Request, resp: Response, next: NextFunction) => {
        console.error(err);
        resp.status(500).send('Something broke!');
    });

    setupSocket(server);

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();