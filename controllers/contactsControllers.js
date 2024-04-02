import { listContacts, getContactById, removeContact, addContact, putUpdateContact } from "../services/contactsServices.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";


import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(HttpError(500, "Server error"));
  }
};

export const getOneContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await getContactById(id);
    if (!contact) {
      return next(HttpError(404, "Not found"));
    }
    res.status(200).json(contact);
  } catch (error) {
    next(HttpError(500, "Server error"));
  }
};

export const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const removedContact = await removeContact(id);
    if (!removedContact) {
      return next(HttpError(404, "Not found"));
    }
    res.status(200).json(removedContact);
  } catch (error) {
    next(HttpError(500, "Server error"));
  }
};

export const createContact = async (req, res, next) => {
  const { error } = createContactSchema.validate(req.body);
  if (error) {
    return next(HttpError(400, error.message));
  }

  const { name, email, phone } = req.body;
  try {
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (error) {
    next(HttpError(500, "Server error"));
  }
};

export const updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    return next(HttpError(400, error.message));
  }

  if (!name && !email && !phone) {
    return next(HttpError(400, "Body must have at least one field"));
  }
  try {
    const updatedContact = await putUpdateContact(id, req.body);
    if (!updatedContact) {
      return next(HttpError(404, "Not found"));
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(HttpError(500, "Server error"));
  }
};

