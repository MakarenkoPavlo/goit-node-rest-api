import { Router } from "express";
import { currentUser, loginUserController, logoutUserController, registerUserController, updateAvatar, updateSubscriptionUser } from "../controllers/usersControllers.js";
import { verifyToken } from "../helpers/tockenCheck.js";

const userRouter = Router();

userRouter.post('/register', registerUserController);

userRouter.post('/login', loginUserController);

userRouter.post('/logout', verifyToken, logoutUserController);

userRouter.get('/current', verifyToken, currentUser);

userRouter.patch('/', verifyToken, updateSubscriptionUser);

userRouter.patch('/avatars', verifyToken, updateAvatar);

export default userRouter;
