import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react';
import { statsApi, utils } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await statsApi.get();
      setStats(response.data);
    } catch (err) {
      setError(utils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Caricamento statistiche...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Errore nel caricamento: {error}</p>
        <button
          onClick={loadStats}
          className="mt-2 btn-primary text-sm"
        >
          Riprova
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Contatti Totali',
      value: stats?.totalContacts || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive',
      href: '/contacts'
    },
    {
      title: 'Form Attivi',
      value: stats?.totalForms || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3',
      changeType: 'positive',
      href: '/forms'
    },
    {
      title: 'Risposte Ricevute',
      value: stats?.totalResponses || 0,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%',
      changeType: 'positive',
      href: '/responses'
    },
    {
      title: 'Tasso di Risposta',
      value: stats?.totalContacts > 0 
        ? `${Math.round((stats.totalResponses / stats.totalContacts) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+2%',
      changeType: 'positive',
      href: '/responses'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Benvenuto nella Dashboard
            </h1>
            <p className="text-primary-100 text-lg">
              Gestisci i tuoi contatti e form in modo efficiente
            </p>
            <div className="flex items-center mt-4 text-primary-100">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Ultimo aggiornamento: {utils.formatDate(new Date())}
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.href}
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="flex items-center text-sm">
                  <span className={`
                    ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
                    font-medium
                  `}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-1">dal mese scorso</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors duration-200" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                Attività Recente
              </h3>
              <Link
                to="/contacts"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Visualizza tutto
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats?.recentContacts?.length > 0 ? (
              stats.recentContacts.map((contact, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {utils.getInitials(contact.firstName, contact.lastName)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Aggiunto {utils.formatDate(contact.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nessun contatto recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Responses */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-gray-500" />
                Risposte Recenti
              </h3>
              <Link
                to="/responses"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Visualizza tutto
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats?.recentResponses?.length > 0 ? (
              stats.recentResponses.map((response, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {response.contactId?.firstName} {response.contactId?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {response.formId?.name} • {utils.formatDate(response.csvImportedAt)}
                    </p>
                  </div>
                  <span className="badge badge-success">Completato</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nessuna risposta recente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-gray-500" />
          Azioni Rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/contacts"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <Users className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="font-medium text-gray-900 mb-1">Nuovo Contatto</h4>
            <p className="text-sm text-gray-500">Aggiungi un nuovo contatto al sistema</p>
          </Link>
          
          <Link
            to="/forms"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <FileText className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="font-medium text-gray-900 mb-1">Nuovo Form</h4>
            <p className="text-sm text-gray-500">Configura un nuovo Google Form</p>
          </Link>
          
          <Link
            to="/responses"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <MessageCircle className="w-8 h-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="font-medium text-gray-900 mb-1">Importa Risposte</h4>
            <p className="text-sm text-gray-500">Carica le risposte da CSV</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;