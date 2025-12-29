import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/apiService';

const AdminLogin: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value.trim();

    try {
      const result = await api.login({ username, password });
      if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin privileges required.');
      }
    } catch (err: any) {
      setError(err?.message ? String(err.message) : 'Login failed. Try admin / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 w-full max-w-sm border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="IronCrest Logo" className="w-24 h-24 mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-slate-900">Admin Access</h2>
          <p className="text-slate-500 text-sm">Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Username</label>
            <input
              name="username"
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white py-2.5 rounded-lg transition-all font-semibold shadow-md shadow-brand-500/20 active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
