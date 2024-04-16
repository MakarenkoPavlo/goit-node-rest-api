const { Router } = require("express");


const userRouter = router();

userRouter.post('/register');

userRouter.post('/login');

export { userRouter };