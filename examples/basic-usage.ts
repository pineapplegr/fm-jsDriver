/**
 * Basic usage example for fm-jsDriver
 * This demonstrates simple CRUD operations
 */

import { createDriver } from 'fm-jsdriver';
import schema from './fmSchema';

// Create the driver instance
const fm = createDriver(schema);

/**
 * Example 1: Create a new contact
 */
async function createContact() {
  try {
    const newContact = await fm.Contacts.create({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
      phone: '555-1234',
      city: 'New York',
      state: 'NY'
    });

    console.log('Created contact:', newContact);
    return newContact;
  } catch (error) {
    console.error('Error creating contact:', error);
  }
}

/**
 * Example 2: Get a contact by recordId
 */
async function getContact(recordId: string) {
  try {
    const contact = await fm.Contacts.get(recordId);
    console.log('Retrieved contact:', contact);
    return contact;
  } catch (error) {
    console.error('Error retrieving contact:', error);
  }
}

/**
 * Example 3: Update a contact
 */
async function updateContact(recordId: string) {
  try {
    const updated = await fm.Contacts.update(recordId, {
      company: 'New Company Inc.',
      email: 'john.doe@newcompany.com'
    });

    console.log('Updated contact:', updated);
    return updated;
  } catch (error) {
    console.error('Error updating contact:', error);
  }
}

/**
 * Example 4: Find contacts by criteria
 */
async function findContacts() {
  try {
    const results = await fm.Contacts.find(
      { company: 'Acme Corp' },
      { limit: 10, offset: 1 }
    );

    console.log('Found contacts:', results);
    return results;
  } catch (error) {
    console.error('Error finding contacts:', error);
  }
}

/**
 * Example 5: List all contacts with pagination
 */
async function listAllContacts() {
  try {
    const allContacts = await fm.Contacts.list({
      limit: 50,
      offset: 1
    });

    console.log('All contacts:', allContacts);
    return allContacts;
  } catch (error) {
    console.error('Error listing contacts:', error);
  }
}

/**
 * Example 6: Delete a contact
 */
async function deleteContact(recordId: string) {
  try {
    const result = await fm.Contacts.delete(recordId);
    console.log('Deleted contact:', result);
    return result;
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}

/**
 * Example 7: Complete CRUD workflow
 */
async function completeWorkflow() {
  // Create
  const newContact = await createContact();
  const recordId = newContact.recordId;

  // Read
  await getContact(recordId);

  // Update
  await updateContact(recordId);

  // Find
  await findContacts();

  // List
  await listAllContacts();

  // Delete
  await deleteContact(recordId);
}

// Run the example
completeWorkflow();
