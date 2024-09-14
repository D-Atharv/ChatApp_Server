import { Router } from "express";
import { updateUser } from "../../controllers/user_controllers/user_controller";

export const userRouter = Router();

userRouter.patch('/updateUser', updateUser);

