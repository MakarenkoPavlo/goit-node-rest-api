import { User } from '../models/userModel.js';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

export const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationToken = null;
    user.verify = true;
    await user.save();

    return res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const config = {
    host: 'smtp.meta.ua',
    port: 465,
    secure: true,
    auth: {
      user: 'cmertnik1986@meta.ua',
      pass: process.env.PASS_META,
    },
  };
  const transporter = nodemailer.createTransport(config);

  const mailOptions = {
    from: 'cmertnik1986@meta.ua',
    to: email,
    subject: 'Email Verification',
    text: `Click on the following link to verify your email: /users/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Error sending verification email');
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Missing required field email' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

    const verificationToken = await sendVerificationEmail(email);

    return res.status(200).json({ message: 'Verification email sent', verificationToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};