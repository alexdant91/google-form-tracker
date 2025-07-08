import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Search,
  FileQuestion,
  Users,
  FileText,
  MessageCircle,
  Settings
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const popularPages = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Torna alla dashboard principale'
    },
    {
      name: 'Contatti',
      href: '/contacts',
      icon: Users,
      description: 'Gestisci i tuoi contatti'
    },
    {
      name: 'Form',
      href: '/forms',
      icon: FileText,
      description: 'Configura i tuoi Google Forms'
    },
    {
      name: 'Risposte',
      href: '/responses',
      icon: MessageCircle,
      description: 'Visualizza le risposte ricevute'
    },
    {
      name: 'Impostazioni',
      href: '/settings',
      icon: Settings,
      description: 'Configura l\'applicazione'
    }
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <FileQuestion className="w-16 h-16 text-primary-600" />
            </div>
            <div className="absolute top-0 right-1/4 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce-subtle">
              <Search className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pagina Non Trovata
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Ops! La pagina che stai cercando non esiste o è stata spostata.
          </p>
          <p className="text-gray-500">
            Verifica l'URL o naviga verso una delle sezioni disponibili.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna Indietro
          </button>
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Vai alla Dashboard
          </Link>
        </div>

        {/* Popular Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">
            Pagine Popolari
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularPages.map((page) => (
              <Link
                key={page.href}
                to={page.href}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group text-left"
              >
                <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-primary-100 transition-colors">
                  <page.icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-primary-700">
                    {page.name}
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-primary-600">
                    {page.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Se il problema persiste, verifica che l'URL sia corretto o contatta il supporto tecnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;