import express from 'express';
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContacts,
} from '../controllers/contactsControllers.js';
import validateBody from '../helpers/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from '../schemas/contactsSchemas.js';
import isValidId from '../helpers/isValidId.js';

const contactsRouter = express.Router();

contactsRouter.get('/', getAllContacts);

contactsRouter.get('/:id', isValidId, getOneContact);

contactsRouter.delete('/:id', isValidId, deleteContact);

contactsRouter.post('/', validateBody(createContactSchema), createContact);

contactsRouter.put('/:id', isValidId, validateBody(updateContactSchema), updateContact);

contactsRouter.patch('/:id/favorite', isValidId, validateBody(updateStatusContactSchema), updateStatusContacts);

export default contactsRouter;