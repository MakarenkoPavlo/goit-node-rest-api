import Joi from 'joi';


export const registerUsersSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least {#limit} characters long',
    'any.required': 'Password is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  subscription: Joi.string().valid('starter', 'pro', 'business').default('starter')
});

export const loginUsersSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least {#limit} characters long',
    'any.required': 'Password is required',
  }),
});