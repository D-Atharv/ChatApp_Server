import { Router } from "express";
import { blockUser,unblockUser,getBlockedGroups } from "../../controllers/block_controllers/block_controller";

export const blockRouter = Router();


blockRouter.post('/toBlock',blockUser);
blockRouter.post('/unBlock',unblockUser);
blockRouter.get('/allBlockedUsers',getBlockedGroups);

