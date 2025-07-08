import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageCircle,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview e statistiche'
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
      description: 'Gestisci i tuoi form Google'
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
    },
  ];

  const getCurrentPageTitle = () => {
    const currentRoute = navigation.find(item => item.href === location.pathname);
    return currentRoute?.name || 'Dashboard';
  };

  const getCurrentPageDescription = () => {
    const currentRoute = navigation.find(item => item.href === location.pathname);
    return currentRoute?.description || 'Benvenuto nella tua dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-white">
                  Contact Dashboard
                </h1>
                <p className="text-xs text-primary-100">
                  Multi Forms Management
                </p>
              </div>
            </div>
            <button
              className="lg:hidden text-white hover:bg-primary-500 rounded-md p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`
                      text-xs mt-0.5
                      ${isActive ? 'text-primary-600' : 'text-gray-400'}
                    `}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Form Tracking v1.0</p>
                <p className="text-xs text-gray-500">Powered by Alessandro D'Antoni</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:static lg:overflow-y-visible">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="relative flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Page title */}
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {getCurrentPageDescription()}
                  </p>
                </div>
              </div>

              {/* Top bar actions */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 hidden sm:inline">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-fade-in">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;