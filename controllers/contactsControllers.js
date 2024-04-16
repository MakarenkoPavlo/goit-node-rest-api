import { listContacts, getContactById, removeContact, addContact, putUpdateContact, updateStatusContact } from "../services/contactsServices.js";
import { catchAsync } from '../services/catchAsync.js';
import { Contact } from '../models/contactModel.js';
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const favorite = req.query.favorite === 'true';

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let query = {}; 

  if (favorite) {
    query = { ...query, favorite: true };
  }

  const totalContacts = await Contact.countDocuments(query); 
  const totalPages = Math.ceil(totalContacts / limit);

  const contacts = await Contact.find(query)
    .skip(startIndex)
    .limit(limit);

  if (startIndex >= totalContacts) {
    throw new HttpError(404, 'Страница не знайдена');
  }

  res.status(200).json({
    contacts,
    page,
    totalPages,
  });
});

export const getOneContact = catchAsync (async (req, res) => {
  const { id } = req.params;

    const contact = await getContactById(id);
    if (!contact) {
      throw HttpError(404);
    }
    res.status(200).json(contact);
  
});

export const deleteContact = catchAsync (async (req, res) => {
  const { id } = req.params;

    const removedContact = await removeContact(id);
    if (!removedContact) {
      throw HttpError(404);
    }
    res.status(200).json(removedContact);
  });

export const createContact = catchAsync(async (req, res) => {
  const newContact = await Contact.create(req.body);
 
    res.status(201).json(newContact);
});

export const updateContact = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updatedContact = await putUpdateContact(id, req.body);

  if (!updatedContact) {
    throw HttpError(404);
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Body must have at least one field" });
  }
  res.status(200).json(updatedContact);
});

export const updateStatusContacts = catchAsync(async (req, res) => {
  const { id } = req.params;

  const updatedStatusContact = await updateStatusContact(id, req.body);
  if (!updatedStatusContact) {
    throw HttpError(404);
  }
  res.status(200).json(updatedStatusContact);
});