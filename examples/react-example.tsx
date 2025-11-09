/**
 * React integration example for fm-jsDriver
 * This demonstrates how to use fm-jsDriver in a React application
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createDriver } from 'fm-jsdriver';
import schema from './fmSchema';

const fm = createDriver(schema);

/**
 * Custom hook for managing contacts
 */
function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fm.Contacts.list({ limit: 100 });
      setContacts(result.response?.data || []);
    } catch (err) {
      setError('Failed to load contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (data: any) => {
    try {
      const result = await fm.Contacts.create(data);
      await loadContacts(); // Refresh list
      return result;
    } catch (err) {
      setError('Failed to create contact');
      throw err;
    }
  }, [loadContacts]);

  const updateContact = useCallback(async (recordId: string, data: any) => {
    try {
      const result = await fm.Contacts.update(recordId, data);
      await loadContacts(); // Refresh list
      return result;
    } catch (err) {
      setError('Failed to update contact');
      throw err;
    }
  }, [loadContacts]);

  const deleteContact = useCallback(async (recordId: string) => {
    try {
      await fm.Contacts.delete(recordId);
      setContacts(contacts.filter(c => c.recordId !== recordId));
    } catch (err) {
      setError('Failed to delete contact');
      throw err;
    }
  }, [contacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refresh: loadContacts
  };
}

/**
 * Contact List Component
 */
function ContactsList() {
  const { contacts, loading, error, deleteContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="contacts-list">
      <h2>Contacts ({contacts.length})</h2>
      <div className="contacts-grid">
        {contacts.map(contact => (
          <div
            key={contact.recordId}
            className="contact-card"
            onClick={() => setSelectedContact(contact)}
          >
            <h3>{contact.fieldData.name}</h3>
            <p>{contact.fieldData.email}</p>
            <p>{contact.fieldData.company}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this contact?')) {
                  deleteContact(contact.recordId);
                }
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}

/**
 * Contact Detail Component
 */
function ContactDetail({ contact, onClose }: { contact: any; onClose: () => void }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{contact.fieldData.name}</h2>
        <p><strong>Email:</strong> {contact.fieldData.email}</p>
        <p><strong>Company:</strong> {contact.fieldData.company}</p>
        <p><strong>Phone:</strong> {contact.fieldData.phone}</p>
        <p><strong>Address:</strong> {contact.fieldData.address}</p>
        <p><strong>City:</strong> {contact.fieldData.city}, {contact.fieldData.state} {contact.fieldData.zip}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/**
 * Contact Form Component
 */
function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const { createContact } = useContacts();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createContact(formData);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h2>New Contact</h2>
      <input
        type="text"
        name="name"
        placeholder="Name *"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
      />
      <input
        type="text"
        name="state"
        placeholder="State"
        value={formData.state}
        onChange={handleChange}
      />
      <input
        type="text"
        name="zip"
        placeholder="ZIP"
        value={formData.zip}
        onChange={handleChange}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Contact'}
      </button>
    </form>
  );
}

/**
 * Search Component
 */
function ContactSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);

    try {
      const result = await fm.Contacts.find(
        { name: searchTerm },
        { limit: 20 }
      );
      setResults(result.response?.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {results.length > 0 && (
        <div className="search-results">
          <h3>Results ({results.length})</h3>
          {results.map(contact => (
            <div key={contact.recordId}>
              {contact.fieldData.name} - {contact.fieldData.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="app">
      <header>
        <h1>FileMaker Contacts</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hide Form' : 'New Contact'}
        </button>
      </header>

      {showForm && (
        <ContactForm onSuccess={() => setShowForm(false)} />
      )}

      <ContactSearch />
      <ContactsList />
    </div>
  );
}

export default App;
export { useContacts, ContactsList, ContactForm, ContactSearch };
