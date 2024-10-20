import { Router } from "express";
import { updateUser, logOut, loginUser, signIn } from "../../controllers/user_controllers/user_controller";
import { verifyToken } from "../../middlewares/authMiddleware";
import { getMe } from "../../controllers/user_controllers/user_controller";
import upload from "../../middlewares/upload_image_middleware";

export const userRouter = Router();

userRouter.get('/me', verifyToken, getMe);
userRouter.patch('/updateUser', verifyToken, upload, updateUser);
userRouter.post('/login', loginUser);
userRouter.post('/signin', signIn);
userRouter.post('/logout', verifyToken, logOut);
