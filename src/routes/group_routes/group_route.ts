import { Router } from 'express';
import { getAllUserGroups, createGroup } from '../../controllers/group_controllers/group_controller';

export const groupRouter = Router();

groupRouter.get('/groups', getAllUserGroups);
groupRouter.post('/createGroup', createGroup);