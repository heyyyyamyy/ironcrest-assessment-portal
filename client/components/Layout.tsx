import React from 'react';
import { LogOut, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/apiService';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  title?: string;
  showLogout?: boolean;
  fullWidth?: boolean; // New prop to control max-width container
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false, title, showLogout = true, fullWidth = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!hideHeader && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-50 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-brand-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">Ironcrest Recruitment Assessment Round</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {title && (
                <div className="hidden md:block px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                    <span className="text-slate-600 text-xs font-semibold uppercase tracking-wide">{title}</span>
                </div>
              )}
              {showLogout && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-lg transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}
      <main className={`flex-grow w-full ${fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
