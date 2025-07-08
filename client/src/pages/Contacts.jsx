import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Filter,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Calendar,
  MessageSquare,
  ExternalLink,
  Copy,
  Send,
  FileText,
  History,
  User
} from 'lucide-react';
import { contactsApi, formsApi, utils } from '../services/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedForm, setSelectedForm] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsResponse, formsResponse] = await Promise.all([
        contactsApi.getAll(),
        formsApi.getAll()
      ]);
      setContacts(contactsResponse.data);
      setForms(formsResponse.data);
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactsApi.update(editingContact._id, contactData);
      } else {
        await contactsApi.create(contactData);
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo contatto? Tutte le risposte associate verranno eliminate.')) {
      return;
    }
    
    try {
      await contactsApi.delete(contactId);
      await loadData();
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setContactData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || '',
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const handleGenerateLink = async () => {
    if (!selectedContact || !selectedForm) return;
    
    try {
      const response = await contactsApi.generateLink(selectedContact._id, selectedForm);
      setGeneratedLink(response.data);
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setContactData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    });
  };

  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setSelectedContact(null);
    setSelectedForm('');
    setGeneratedLink(null);
  };

  const openLinkModal = (contact) => {
    setSelectedContact(contact);
    setShowLinkModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const getFormSentCount = (contact, formId) => {
    const formHistory = contact.formHistory?.find(h => h.formId._id === formId);
    return formHistory?.sentCount || 0;
  };

  const getLastSentDate = (contact, formId) => {
    const formHistory = contact.formHistory?.find(h => h.formId._id === formId);
    return formHistory?.sentAt;
  };

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeForms = forms.filter(form => form.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Caricamento contatti...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Contatti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci i tuoi contatti e invia form personalizzati
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nuovo Contatto
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca contatti per nome, email, telefono o azienda..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {filteredContacts.length} di {contacts.length} contatti
          </span>
        </div>
      </div>

      {/* Contacts Table */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nessun contatto trovato' : 'Nessun contatto presente'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Prova a modificare i termini di ricerca'
              : 'Inizia aggiungendo il tuo primo contatto'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Aggiungi il tuo primo contatto
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Contatto</th>
                <th>Informazioni</th>
                <th>Form Inviati</th>
                <th>Aggiunto</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact._id}>
                  <td>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium text-sm">
                          {utils.getInitials(contact.firstName, contact.lastName)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.company && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {contact.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-2" />
                        {contact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-3 h-3 mr-2" />
                        {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    {contact.formHistory && contact.formHistory.length > 0 ? (
                      <div className="space-y-1">
                        {contact.formHistory.slice(0, 2).map((history, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <FileText className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-gray-600 mr-2">
                              {history.formId?.name || 'Form eliminato'}
                            </span>
                            <span className="badge badge-primary text-xs">
                              {history.sentCount}x
                            </span>
                          </div>
                        ))}
                        {contact.formHistory.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{contact.formHistory.length - 2} altri...
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Nessun form inviato</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {utils.formatDate(contact.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openLinkModal(contact)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Genera link form"
                        disabled={activeForms.length === 0}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(contact)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica contatto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina contatto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingContact ? 'Modifica Contatto' : 'Nuovo Contatto'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nome *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Mario"
                      value={contactData.firstName}
                      onChange={(e) => setContactData({...contactData, firstName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cognome *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Rossi"
                      value={contactData.lastName}
                      onChange={(e) => setContactData({...contactData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="mario.rossi@email.com"
                    value={contactData.email}
                    onChange={(e) => setContactData({...contactData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Telefono *</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+39 123 456 7890"
                      value={contactData.phone}
                      onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Azienda</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Acme Corp"
                      value={contactData.company}
                      onChange={(e) => setContactData({...contactData, company: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea
                    className="textarea-field"
                    rows="3"
                    placeholder="Note aggiuntive sul contatto..."
                    value={contactData.notes}
                    onChange={(e) => setContactData({...contactData, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingContact ? 'Aggiorna Contatto' : 'Crea Contatto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Link Modal */}
      {showLinkModal && selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Genera Link Form per {selectedContact.firstName} {selectedContact.lastName}
              </h2>
            </div>

            <div className="modal-body space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {selectedContact.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {selectedContact.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Selection */}
              <div className="form-group">
                <label className="form-label">Seleziona Form *</label>
                <select
                  className="select-field"
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  required
                >
                  <option value="">Scegli un form...</option>
                  {activeForms.map((form) => (
                    <option key={form._id} value={form._id}>
                      {form.name}
                      {getFormSentCount(selectedContact, form._id) > 0 && 
                        ` (inviato ${getFormSentCount(selectedContact, form._id)}x)`
                      }
                    </option>
                  ))}
                </select>
                {activeForms.length === 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    Nessun form attivo disponibile. Attiva almeno un form per continuare.
                  </p>
                )}
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateLink}
                  disabled={!selectedForm}
                  className="btn-primary"
                >
                  <MessageSquare className="w-4 h-4" />
                  Genera Link e Messaggio WhatsApp
                </button>
              </div>

              {/* Generated Links */}
              {generatedLink && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900">Link Generati</h3>
                  
                  {/* Form Link */}
                  <div className="space-y-2">
                    <label className="form-label">Link Form Precompilato</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input-field flex-1"
                        value={generatedLink.prefilledUrl}
                        readOnly
                      />
                      <button
                        onClick={() => copyToClipboard(generatedLink.prefilledUrl)}
                        className="btn-secondary"
                        title="Copia link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={generatedLink.prefilledUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        title="Apri form"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp Message */}
                  <div className="space-y-2">
                    <label className="form-label">Messaggio WhatsApp</label>
                    <textarea
                      className="textarea-field"
                      rows="4"
                      value={generatedLink.message}
                      readOnly
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(generatedLink.message)}
                        className="btn-secondary"
                      >
                        <Copy className="w-4 h-4" />
                        Copia Messaggio
                      </button>
                      <a
                        href={generatedLink.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-success"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Apri WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Form History */}
              {selectedContact.formHistory && selectedContact.formHistory.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <History className="w-4 h-4 mr-2" />
                    Storico Invii
                  </h3>
                  <div className="space-y-2">
                    {selectedContact.formHistory.map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">
                            {history.formId?.name || 'Form eliminato'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>Inviato {history.sentCount}x</span>
                          <span>Ultimo: {utils.formatDate(history.sentAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={handleCloseLinkModal}
                className="btn-secondary"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;