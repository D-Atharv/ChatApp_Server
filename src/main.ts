import express, { Request, Response, NextFunction } from 'express';
import { connectDB } from './database/db';
import { userRouter } from './routes/user_routes/user_route';

import 'dotenv/config';
const app = express();

async function startServer() {
    await connectDB();

    app.use('/api', userRouter);

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.send('Hello World!');
    });

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err);
        res.status(500).send('Something broke!');
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();
