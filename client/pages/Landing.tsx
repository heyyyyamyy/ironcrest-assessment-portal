import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, User, ChevronRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-brand-300 rounded-full blur-3xl opacity-20"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="IronCrest Logo" className="w-32 h-32 mx-auto mb-4 object-contain" />
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Ironcrest</h1>
          <p className="text-slate-500 font-medium">Assessment Portal</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-1 rounded-2xl shadow-2xl shadow-brand-900/5 border border-white">
          <div className="space-y-2 p-4">
            <Link
              to="/admin/login"
              className="group flex items-center justify-between w-full bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 p-4 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900">Admin Portal</h3>
                  <p className="text-xs text-slate-500">Manage assessments</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-brand-500" size={20} />
            </Link>

            <Link
              to="/login"
              className="group flex items-center justify-between w-full bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Candidate Login</h3>
                  <p className="text-xs text-brand-100">Start your assessment</p>
                </div>
              </div>
              <ChevronRight className="text-brand-200 group-hover:text-white" size={20} />
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} IronCrest Developers. <br />Authorized Personnel Only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
