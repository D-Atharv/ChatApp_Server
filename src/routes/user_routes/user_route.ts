import { Router } from "express";
import { updateUser, logOut, loginUser, signIn } from "../../controllers/user_controllers/user_controller";
import { verifyToken } from "../../middlewares/authMiddleware";
import { getMe } from "../../controllers/user_controllers/user_controller";

export const userRouter = Router();

userRouter.get('/me',verifyToken,getMe)
userRouter.patch('/updateUser', updateUser);
userRouter.post('/login', loginUser);
userRouter.post('/signin', signIn);
userRouter.post('/logout', logOut);

