import { Router } from 'express';
import { getAllUserGroups, createGroup } from '../../controllers/group_controllers/group_controller';
import { verifyToken } from "../../middlewares/authMiddleware";

export const groupRouter = Router();

groupRouter.get('/allGroups', verifyToken, getAllUserGroups);
groupRouter.post('/createGroup', verifyToken, createGroup);
