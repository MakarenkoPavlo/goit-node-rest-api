import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const contactsPath = path.join("db", "contacts.json");


export async function listContacts() {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function getContactById(contactId) {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    return contacts.find(contact => contact.id === contactId) || null;
  } catch (error) {
    return null;
  }
}

export async function removeContact(contactId) {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    
    const removedContact = contacts.find(contact => contact.id === contactId);
    return removedContact || null;
  } catch (error) {
    return null;
  }
}

export async function addContact(name, email, phone) {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    const newContact = { id: uuidv4(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    return null;
  }
}

export async function putUpdateContact(id, newData) {
  try {
    const data = await fs.readFile(contactsPath, 'utf-8');
    const contacts = JSON.parse(data);
    
    const index = contacts.findIndex(contact => contact.id === id);
    if (index === -1) {
      return null;
    }
    
    const updatedContact = { ...contacts[index], ...newData };
    contacts[index] = updatedContact;
    
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    
    return updatedContact;
  } catch (error) {
    return null;
  }
}