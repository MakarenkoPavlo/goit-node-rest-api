import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 
import { registerUsersSchema } from '../validators/userValidation.js'; 
import HttpError from '../helpers/HttpError.js'; 
import { catchAsync } from '../services/catchAsync.js';

export const registerUserController = catchAsync (async (req, res, next) => {
    const { email, password } = req.body;

    const { error } = registerUsersSchema.validate({ email, password });

    if (error) {
      throw new HttpError(400, error.details[0].message); 
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError(409, 'Email in use'); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword });

    const savedUser = await newUser.save();

    res.status(201).json({
      user: {
        email: savedUser.email,
        subscription: savedUser.subscription
      }
    });
});

export const loginUserController = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate({ email, password });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h' 
  });

  user.token = token;
  await user.save();

  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription
    }
  });
});


export const logoutUserController = catchAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  user.token = null;
  await user.save();

  res.status(204).end();
});