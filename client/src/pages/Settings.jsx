import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Building,
  FileText,
  Globe,
  Database,
  Shield,
  HelpCircle,
  ExternalLink,
  Trash2,
  Download,
  Upload,
  Info
} from 'lucide-react';
import { settingsApi, formsApi, utils } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    defaultFormId: ''
  });
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, formsResponse] = await Promise.all([
        settingsApi.get(),
        formsApi.getAll()
      ]);
      setSettings(settingsResponse.data);
      setForms(formsResponse.data);
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.update(settings);
      setSuccess('Impostazioni salvate con successo!');
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Sei sicuro di voler ripristinare le impostazioni predefinite?')) {
      setSettings({
        companyName: 'Your Company',
        defaultFormId: ''
      });
    }
  };

  const exportData = async () => {
    try {
      // In a real implementation, you would call an export API
      const data = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Configurazione esportata con successo!');
    } catch (err) {
      setError('Errore durante l\'esportazione');
    }
  };

  const tabs = [
    {
      id: 'general',
      name: 'Generale',
      icon: SettingsIcon,
      description: 'Impostazioni generali dell\'applicazione'
    },
    {
      id: 'database',
      name: 'Database',
      icon: Database,
      description: 'Configurazione e gestione del database'
    },
    {
      id: 'security',
      name: 'Sicurezza',
      icon: Shield,
      description: 'Impostazioni di sicurezza e privacy'
    },
    {
      id: 'about',
      name: 'Informazioni',
      icon: HelpCircle,
      description: 'Informazioni sull\'applicazione'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Caricamento impostazioni...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
          <p className="text-gray-600 mt-1">
            Configura la tua dashboard e personalizza le preferenze
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={exportData}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            Esporta Config
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <div className="loading-spinner"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salva Modifiche
              </>
            )}
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <tab.icon className={`
                  mr-3 h-5 w-5
                  ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}
                `} />
                <div>
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Informazioni Azienda
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label">Nome Azienda</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="es. Acme Corporation"
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Il nome della tua azienda apparirà nell'interfaccia
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Form Predefinito</label>
                      <select
                        className="select-field"
                        value={settings.defaultFormId || ''}
                        onChange={(e) => setSettings({...settings, defaultFormId: e.target.value})}
                      >
                        <option value="">Nessun form predefinito</option>
                        {forms.filter(f => f.isActive).map((form) => (
                          <option key={form._id} value={form._id}>
                            {form.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Form selezionato automaticamente nelle azioni rapide
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Preferenze Interfaccia
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Modalità Scura
                        </label>
                        <p className="text-xs text-gray-500">
                          Attiva il tema scuro per l'interfaccia (Coming Soon)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Notifiche Push
                        </label>
                        <p className="text-xs text-gray-500">
                          Ricevi notifiche per nuove risposte (Coming Soon)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Backup Automatico
                        </label>
                        <p className="text-xs text-gray-500">
                          Backup automatico dei dati ogni settimana (Coming Soon)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Gestione Database
                  </h2>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900">Informazioni Database</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          Il database MongoDB è configurato e operativo. Le operazioni di manutenzione 
                          dovrebbero essere eseguite con cautela.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Statistiche Database</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Contatti</span>
                          <span className="font-medium text-gray-900">
                            {/* This would come from an API call */}
                            {forms.length > 0 ? '---' : '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Form Configurati</span>
                          <span className="font-medium text-gray-900">{forms.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Risposte Totali</span>
                          <span className="font-medium text-gray-900">---</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Azioni Manutenzione</h3>
                      <div className="space-y-3">
                        <button className="w-full btn-secondary justify-start" disabled>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Ottimizza Database
                        </button>
                        <button className="w-full btn-secondary justify-start" disabled>
                          <Download className="w-4 h-4 mr-2" />
                          Backup Completo
                        </button>
                        <button className="w-full btn-secondary justify-start" disabled>
                          <Upload className="w-4 h-4 mr-2" />
                          Ripristina Backup
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Le funzioni di manutenzione avanzate saranno disponibili nelle prossime versioni.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Sicurezza e Privacy
                  </h2>

                  <div className="bg-green-50 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-900">Stato Sicurezza</h3>
                        <p className="text-sm text-green-800 mt-1">
                          L'applicazione utilizza connessioni sicure e pratiche di sicurezza standard.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Gestione Dati</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Crittografia Database</h4>
                            <p className="text-sm text-gray-500">I dati sensibili sono protetti</p>
                          </div>
                          <span className="badge badge-success">Attivo</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Backup Automatici</h4>
                            <p className="text-sm text-gray-500">Backup giornalieri dei dati</p>
                          </div>
                          <span className="badge badge-warning">Coming Soon</span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Log di Accesso</h4>
                            <p className="text-sm text-gray-500">Tracciamento degli accessi</p>
                          </div>
                          <span className="badge badge-warning">Coming Soon</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Privacy e Conformità</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">GDPR Compliance</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Questa applicazione rispetta i principi del GDPR per la protezione dei dati personali.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• I dati vengono conservati localmente nel tuo database</li>
                          <li>• Puoi esportare o eliminare i dati in qualsiasi momento</li>
                          <li>• Non condividiamo dati con terze parti</li>
                          <li>• I dati WhatsApp vengono processati solo localmente</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Informazioni Applicazione
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Dettagli Versione</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Versione:</span>
                            <span className="font-medium">1.0.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Build:</span>
                            <span className="font-medium">2024.06.12</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Frontend:</span>
                            <span className="font-medium">React 18 + Vite</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Backend:</span>
                            <span className="font-medium">Node.js + Express</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Database:</span>
                            <span className="font-medium">MongoDB</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Funzionalità</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Gestione contatti completa</li>
                          <li>• Form Google multipli</li>
                          <li>• Generazione link precompilati</li>
                          <li>• Integrazione WhatsApp</li>
                          <li>• Import/Export CSV</li>
                          <li>• Dashboard analytics</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Supporto</h3>
                        <div className="space-y-3">
                          <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">Documentazione</div>
                              <div className="text-sm text-gray-500">Guide e documentazione tecnica</div>
                            </div>
                          </a>

                          <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">Codice Sorgente</div>
                              <div className="text-sm text-gray-500">Repository GitHub del progetto</div>
                            </div>
                          </a>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Licenza</h3>
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          <p>
                            Questo software è distribuito sotto licenza MIT. 
                            È possibile utilizzarlo, modificarlo e distribuirlo liberamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleReset}
                  className="btn-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Ripristina Predefinite
                </button>
                <button
                  onClick={loadData}
                  className="btn-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Ricarica Impostazioni
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner"></div>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salva Modifiche
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;