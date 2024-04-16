import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { catchAsync } from "../services/catchAsync.js";

export const verifyToken = catchAsync(async (req, res, next) => {
  const { SECRET_KEY } = process.env;

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const decodedToken = jwt.verify(token, SECRET_KEY);
  const userId = decodedToken.userId;

  const user = await User.findById(userId);

  if (!user || user.token !== token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  req.user = user;
  next();
});
