import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  FileText,
  Users,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Database,
  FileSpreadsheet,
  User,
  Mail,
  Phone,
  Building,
  Eye,
  X
} from 'lucide-react';
import { responsesApi, formsApi, utils } from '../services/api';

const Responses = () => {
  const [responses, setResponses] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [importForm, setImportForm] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadResponses();
  }, [selectedForm, selectedContact]);

  const loadData = async () => {
    try {
      setLoading(true);
      const formsResponse = await formsApi.getAll();
      setForms(formsResponse.data);
      await loadResponses();
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    try {
      const params = {};
      if (selectedForm) params.formId = selectedForm;
      if (selectedContact) params.contactId = selectedContact;
      
      const response = await responsesApi.getAll(params);
      setResponses(response.data);
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile || !importForm) return;

    try {
      setImporting(true);
      const response = await responsesApi.importCsv(importForm, csvFile);
      setSuccess(response.data.message);
      await loadResponses();
      handleCloseImportModal();
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (responseId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa risposta?')) {
      return;
    }
    
    try {
      await responsesApi.delete(responseId);
      await loadResponses();
      setSuccess('Risposta eliminata con successo');
    } catch (err) {
      setError(utils.handleError(err));
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportForm('');
    setCsvFile(null);
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedResponse(null);
  };

  const filteredResponses = responses.filter(response => {
    const searchLower = searchTerm.toLowerCase();
    const contactName = `${response.contactId?.firstName || ''} ${response.contactId?.lastName || ''}`.toLowerCase();
    const formName = response.formId?.name?.toLowerCase() || '';
    const email = response.contactId?.email?.toLowerCase() || '';
    
    return contactName.includes(searchLower) || 
           formName.includes(searchLower) || 
           email.includes(searchLower);
  });

  const uniqueContacts = [...new Set(responses.map(r => r.contactId))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Caricamento risposte...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Risposte</h1>
          <p className="text-gray-600 mt-1">
            Visualizza e gestisci le risposte ai tuoi form
          </p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Upload className="w-4 h-4" />
          Importa CSV
        </button>
      </div>

      {/* Alerts */}
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Risposte Totali</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Form Attivi</p>
              <p className="text-2xl font-bold text-gray-900">
                {forms.filter(f => f.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Contatti Attivi</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueContacts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Oggi</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.filter(r => 
                  new Date(r.csvImportedAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, email o form..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Form Filter */}
          <select
            className="select-field"
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
          >
            <option value="">Tutti i form</option>
            {forms.map((form) => (
              <option key={form._id} value={form._id}>
                {form.name}
              </option>
            ))}
          </select>

          {/* Contact Filter */}
          <select
            className="select-field"
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
          >
            <option value="">Tutti i contatti</option>
            {uniqueContacts.map((contact) => (
              <option key={contact._id} value={contact._id}>
                {contact.firstName} {contact.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredResponses.length} di {responses.length} risposte</span>
          </div>
          <button
            onClick={loadResponses}
            className="btn-secondary text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Aggiorna
          </button>
        </div>
      </div>

      {/* Responses Table */}
      {filteredResponses.length === 0 ? (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedForm || selectedContact ? 'Nessuna risposta trovata' : 'Nessuna risposta presente'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedForm || selectedContact
              ? 'Prova a modificare i filtri di ricerca'
              : 'Le risposte appariranno qui dopo l\'importazione dei CSV'
            }
          </p>
          {!searchTerm && !selectedForm && !selectedContact && (
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-primary"
            >
              <Upload className="w-4 h-4" />
              Importa le tue prime risposte
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Contatto</th>
                <th>Form</th>
                <th>Data Risposta</th>
                <th>Data Importazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.map((response) => (
                <tr key={response._id}>
                  <td>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium text-sm">
                          {utils.getInitials(
                            response.contactId?.firstName, 
                            response.contactId?.lastName
                          )}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {response.contactId?.firstName} {response.contactId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {response.contactId?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {response.formId?.name || 'Form eliminato'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {utils.formatDate(response.submittedAt)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {utils.formatDate(response.csvImportedAt)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewResponse(response)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizza risposta"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(response._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimina risposta"
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

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Importa Risposte da CSV
              </h2>
            </div>

            <form onSubmit={handleImport}>
              <div className="modal-body space-y-6">
                {/* Form Selection */}
                <div className="form-group">
                  <label className="form-label">Seleziona Form *</label>
                  <select
                    className="select-field"
                    value={importForm}
                    onChange={(e) => setImportForm(e.target.value)}
                    required
                  >
                    <option value="">Scegli il form di destinazione...</option>
                    {forms.map((form) => (
                      <option key={form._id} value={form._id}>
                        {form.name} (Colonna: {form.csvColumnName})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Il CSV deve contenere una colonna con l'ID del contatto
                  </p>
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">File CSV *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="space-y-2">
                      <div>
                        <label className="btn-primary cursor-pointer">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            className="hidden"
                            required
                          />
                          Seleziona file CSV
                        </label>
                      </div>
                      {csvFile && (
                        <p className="text-sm text-gray-600">
                          File selezionato: {csvFile.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Accetta solo file .csv
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Istruzioni per l'importazione:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Il CSV deve contenere una colonna con l'ID del contatto</li>
                    <li>• Il nome della colonna deve corrispondere a quello configurato nel form</li>
                    <li>• Tutte le altre colonne verranno importate come dati della risposta</li>
                    <li>• Solo i contatti esistenti verranno processati</li>
                  </ul>
                </div>

                {/* Form Info */}
                {importForm && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Informazioni Form Selezionato:</h4>
                    {(() => {
                      const selectedFormData = forms.find(f => f._id === importForm);
                      return selectedFormData ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Nome:</strong> {selectedFormData.name}</p>
                          <p><strong>Colonna ID:</strong> {selectedFormData.csvColumnName}</p>
                          <p><strong>Campo precompilato:</strong> {selectedFormData.entryField}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="btn-secondary"
                  disabled={importing}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={importing || !csvFile || !importForm}
                >
                  {importing ? (
                    <>
                      <div className="loading-spinner"></div>
                      Importazione...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importa Risposte
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Response Modal */}
      {showResponseModal && selectedResponse && (
        <div className="modal-overlay">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900">
                Dettagli Risposta
              </h2>
              <button
                onClick={handleCloseResponseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Informazioni Contatto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Nome:</span>
                    <span className="ml-2 font-medium">
                      {selectedResponse.contactId?.firstName} {selectedResponse.contactId?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedResponse.contactId?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Telefono:</span>
                    <span className="ml-2 font-medium">{selectedResponse.contactId?.phone}</span>
                  </div>
                  {selectedResponse.contactId?.company && (
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Azienda:</span>
                      <span className="ml-2 font-medium">{selectedResponse.contactId.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Informazioni Form</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-800">Form:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {selectedResponse.formId?.name || 'Form eliminato'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-blue-800">Data risposta:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {utils.formatDate(selectedResponse.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Response Data */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Dati Risposta</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Campo</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Valore</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedResponse.responseData || {}).map(([key, value], index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-900 bg-gray-50">
                              {key}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {value ? String(value) : <span className="text-gray-400 italic">Vuoto</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Metadati</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID Risposta:</span>
                    <span className="ml-2 font-mono text-gray-900">{selectedResponse._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data importazione:</span>
                    <span className="ml-2 text-gray-900">
                      {utils.formatDate(selectedResponse.csvImportedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={handleCloseResponseModal}
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

export default Responses;