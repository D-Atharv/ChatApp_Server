import { Router } from "express";
import { getMessageForGroup } from "../../controllers/message_controllers/message_controller";
import { verifyToken } from "../../middlewares/authMiddleware";

export const messageRouter = Router();

messageRouter.get('/groups/:groupID/allMessages', verifyToken, getMessageForGroup);
