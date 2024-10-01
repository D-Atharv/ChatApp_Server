import { Router } from "express";
import { groupRouter } from "./group_routes/group_route";
import { messageRouter } from './message_routes/message_route';
import { userRouter } from './user_routes/user_route';
import { blockRouter } from "./block_routes/block_routes";

export const apiRouter = Router();

apiRouter.use('/group', groupRouter);
apiRouter.use('/message', messageRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/block', blockRouter);