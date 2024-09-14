import { Router } from 'express';
import { getAllUserGroups } from '../../controllers/group_controllers/group_controller';

export const groupRouter = Router();

groupRouter.get('/groups', getAllUserGroups);