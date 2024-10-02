import { Router } from "express";
import { getMessageForGroup } from "../../controllers/message_controllers/message_controller";

export const messageRouter = Router();

messageRouter.get('/groups/:groupID/allMessages', getMessageForGroup);
