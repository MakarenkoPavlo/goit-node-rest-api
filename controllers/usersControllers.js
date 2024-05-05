import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import { User } from "../models/userModel.js";
import HttpError from '../helpers/HttpError.js'; 
import { catchAsync } from '../services/catchAsync.js';
import { registerUsersSchema, loginUsersSchema } from '../schemas/usersSchemas.js';
import path from 'path';
import Jimp from 'jimp';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../controllers/authControllers.js';

export const registerUserController = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const verificationToken = uuidv4();

    const newUser = new User({ email, password, verificationToken });

    const savedUser = await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      user: {
        email: savedUser.email,
        subscription: savedUser.subscription,
        avatarURL: savedUser.avatarURL
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
export const loginUserController = catchAsync(async (req, res, next) => {
  const { SECRET_KEY } = process.env;
  const { email, password } = req.body;

  const { error } = loginUsersSchema.validate({ email, password });
  if (error) {
    throw HttpError(400, error.details[0].message);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
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


export const logoutUserController = catchAsync (async (req, res) => {
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

export const currentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  const { email, subscription } = user;

  res.status(200).json({
    email,
    subscription,
  });
});

export const updateSubscriptionUser = catchAsync (async (req, res) => {
  const allowedSubscriptions = ["starter", "pro", "business"];
  const { subscription } = req.body;

  if (!allowedSubscriptions.includes(subscription)) {
    throw HttpError(400, "Invalid subscription type. Subscription must be one of: 'starter', 'pro', 'business'");
  }

  const user = req.user;

  user.subscription = subscription;

  await user.save();

  res.status(200).json({
    message: "Subscription updated successfully",
    subscription: user.subscription,
  });
});

export const updateAvatar = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const file = req.file; 

  if (!file) {
    throw HttpError(400, "No file uploaded");
  }

  const uniqueFileName = `${userId}_${Date.now()}${path.extname(file.originalname)}`;
  const tmpPath = path.join(__dirname, '..', 'tmp', uniqueFileName);
  const targetPath = path.join(__dirname, '..', 'public', 'avatars', uniqueFileName);

  await Jimp.read(file.path)
    .then(image => image.cover(250, 250).write(tmpPath))
    .catch(err => {
      throw HttpError(500, "Failed to process image");
    });

  fs.rename(tmpPath, targetPath, async err => {
    if (err) {
      throw HttpError(500, "Failed to save image");
    }

    const avatarURL = `/avatars/${uniqueFileName}`;

    const user = await User.findByIdAndUpdate(userId, { avatarURL }, { new: true });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    res.status(200).json({ avatarURL });
  });
});