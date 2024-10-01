import { Router } from "express";
import { updateUser,logOut,loginUser,signIn } from "../../controllers/user_controllers/user_controller";

export const userRouter = Router();

userRouter.patch('/updateUser', updateUser);
userRouter.post('/login',loginUser);
userRouter.post('/signIn',signIn);
userRouter.post('/logout',logOut);

