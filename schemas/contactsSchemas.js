import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot be longer than {#limit} characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().allow('').messages({
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name cannot be longer than {#limit} characters',
  }),
  email: Joi.string().email().optional().allow('').messages({
    'string.email': 'Email must be a valid email address',
  }),
  phone: Joi.string().optional().allow('').messages({
    'string.empty': 'Phone number is required',
  }),
});

export const updateStatusContactSchema = Joi.object({
  favorite: Joi.boolean().required().messages({
    'any.required': 'Favorite status is required',
    'boolean.base': 'Favorite status must be a boolean value',
  }),
});