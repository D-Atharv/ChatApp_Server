import { Router } from "express";
import { getMessageForGroup, sendMessage } from "../../controllers/message_controllers/message_controller";

export const messageRouter = Router();

messageRouter.get('/groups/:groupID/allMessages', getMessageForGroup);
messageRouter.post('/groups/:groupID/sendMessage', sendMessage);
