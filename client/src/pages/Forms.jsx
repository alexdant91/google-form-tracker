import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Copy,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { formsApi, utils } from '../services/api';

const Forms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseUrl: '',
    entryField: '',
    whatsappTemplate: '',
    csvColumnName: 'Paziente',
    isActive: true
  });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await formsApi.getAll();
      setForms(response.data);
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingForm) {
        await formsApi.update(editingForm._id, formData);
      } else {
        await formsApi.create(formData);
      }
      await loadForms();
      handleCloseModal();
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleDelete = async (formId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo form? Tutte le risposte associate verranno eliminate.')) {
      return;
    }
    
    try {
      await formsApi.delete(formId);
      await loadForms();
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setFormData({
      name: form.name,
      description: form.description || '',
      baseUrl: form.baseUrl,
      entryField: form.entryField,
      whatsappTemplate: form.whatsappTemplate,
      csvColumnName: form.csvColumnName,
      isActive: form.isActive
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingForm(null);
    setFormData({
      name: '',
      description: '',
      baseUrl: '',
      entryField: '',
      whatsappTemplate: '',
      csvColumnName: 'Paziente',
      isActive: true
    });
  };

  const toggleFormStatus = async (formId, currentStatus) => {
    try {
      await formsApi.update(formId, { isActive: !currentStatus });
      await loadForms();
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultWhatsAppTemplate = `Ciao {FIRST_NAME}! 🌟

Ti invio il link per compilare il nostro questionario. Ci vorrà solo qualche minuto del tuo tempo.

📋 Link questionario: {FORM_LINK}

Grazie per la tua collaborazione! 😊

Se hai domande, non esitare a contattarmi.`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Caricamento form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Form</h1>
          <p className="text-gray-600 mt-1">
            Gestisci i tuoi Google Forms e le configurazioni di invio
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Nuovo Form
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
            placeholder="Cerca form per nome o descrizione..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {filteredForms.length} di {forms.length} form
          </span>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nessun form trovato' : 'Nessun form configurato'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Prova a modificare i termini di ricerca'
              : 'Inizia creando il tuo primo Google Form'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Crea il tuo primo form
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div
              key={form._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              {/* Form Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{form.name}</h3>
                      <button
                        onClick={() => toggleFormStatus(form._id, form.isActive)}
                        className={`p-1 rounded-full transition-colors ${
                          form.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={form.isActive ? 'Form attivo' : 'Form disattivato'}
                      >
                        {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(form)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Modifica form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(form._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stato:</span>
                    <span className={`badge ${form.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {form.isActive ? 'Attivo' : 'Disattivato'}
                    </span>
                  </div>

                  {/* Entry Field */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Campo precompilato:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {form.entryField}
                      </code>
                      <button
                        onClick={() => copyToClipboard(form.entryField)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Copia campo"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* CSV Column */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Colonna CSV:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {form.csvColumnName}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Creato:</span>
                    <span className="text-sm text-gray-900">
                      {utils.formatDate(form.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <a
                      href={form.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs flex-1 justify-center"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visualizza Form
                    </a>
                    <button
                      onClick={() => copyToClipboard(form.baseUrl)}
                      className="btn-secondary text-xs px-3"
                      title="Copia URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingForm ? 'Modifica Form' : 'Nuovo Form'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nome Form *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="es. Questionario Soddisfazione"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Colonna CSV</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="es. Paziente"
                      value={formData.csvColumnName}
                      onChange={(e) => setFormData({...formData, csvColumnName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrizione</label>
                  <textarea
                    className="textarea-field"
                    rows="2"
                    placeholder="Descrizione del form (opzionale)"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Form Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configurazione Google Form
                  </h3>

                  <div className="form-group">
                    <label className="form-label">URL Base Form *</label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'URL del tuo Google Form (senza parametri)
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Campo Entry *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="entry.1234567"
                      value={formData.entryField}
                      onChange={(e) => setFormData({...formData, entryField: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Il campo che verrà precompilato con l'ID del contatto
                    </p>
                  </div>
                </div>

                {/* WhatsApp Template */}
                <div className="form-group">
                  <label className="form-label">Template Messaggio WhatsApp *</label>
                  <textarea
                    className="textarea-field"
                    rows="8"
                    placeholder={defaultWhatsAppTemplate}
                    value={formData.whatsappTemplate}
                    onChange={(e) => setFormData({...formData, whatsappTemplate: e.target.value})}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    <p className="mb-1">Variabili disponibili:</p>
                    <div className="flex flex-wrap gap-2">
                      {['{FIRST_NAME}', '{LAST_NAME}', '{FULL_NAME}', '{EMAIL}', '{PHONE}', '{COMPANY}', '{FORM_LINK}'].map(variable => (
                        <code key={variable} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {variable}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Form attivo
                  </label>
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
                  {editingForm ? 'Aggiorna Form' : 'Crea Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms;