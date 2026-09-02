import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // If already authenticated, redirect to role's dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'AGENT') navigate('/agent/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const executeLogin = async (targetEmail: string, targetPassword: string, roleName?: string) => {
    setErrorMessage(null);
    setLoading(true);
    if (roleName) setActiveDemoRole(roleName);

    try {
      const res = await apiClient.post('/auth/login', {
        email: targetEmail.trim(),
        password: targetPassword,
      });

      if (res.data.success) {
        const { token, user: loggedInUser } = res.data.data;
        login(token, loggedInUser);
        toast.success(`Welcome back, ${loggedInUser.name}!`);

        if (loggedInUser.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (loggedInUser.role === 'AGENT') {
          navigate('/agent/dashboard', { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      } else {
        setErrorMessage(res.data.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Network error: Cannot connect to server. Please check if the backend is running.'
          : 'Invalid email or password. Please check your credentials.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setActiveDemoRole(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      toast.error('Please enter your email and password.');
      return;
    }
    await executeLogin(email, password);
  };

  const handleOneClickLogin = async (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    await executeLogin(demoEmail, 'Password123!', roleName);
  };

  const handleResetSession = () => {
    logout();
    localStorage.clear();
    setErrorMessage(null);
    toast.info('Session and local cache cleared. You can sign in now.');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glow ambient background effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 shadow-lg shadow-emerald-500/20 mb-4 ring-4 ring-emerald-500/10">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">NexusDesk AI</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Eco-Friendly, AI-Augmented Customer Support & Helpdesk
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Sign in to your account</h2>
            <button
              type="button"
              onClick={handleResetSession}
              title="Clear stored tokens and reset session"
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset session</span>
            </button>
          </div>

          {/* Inline Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && !activeDemoRole ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* One-Click Instant Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Instant 1-Click Demo Login
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Admin Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickLogin('admin@example.com', 'ADMIN')}
                className="group relative px-2.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-700/50 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 text-center transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading && activeDemoRole === 'ADMIN' ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">Admin</div>
                    <div className="text-[10px] text-slate-400 group-hover:text-rose-200 mt-0.5 font-mono">Full Access</div>
                  </div>
                )}
              </button>

              {/* Agent Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickLogin('agent1@example.com', 'AGENT')}
                className="group relative px-2.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-700/50 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 text-center transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading && activeDemoRole === 'AGENT' ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">Agent</div>
                    <div className="text-[10px] text-slate-400 group-hover:text-indigo-200 mt-0.5 font-mono">Queue & KB</div>
                  </div>
                )}
              </button>

              {/* Customer Button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickLogin('customer1@example.com', 'CUSTOMER')}
                className="group relative px-2.5 py-2.5 text-xs font-semibold rounded-xl bg-slate-700/50 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-center transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading && activeDemoRole === 'CUSTOMER' ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">Customer</div>
                    <div className="text-[10px] text-slate-400 group-hover:text-emerald-200 mt-0.5 font-mono">Submit & Track</div>
                  </div>
                )}
              </button>
            </div>

            <div className="mt-3 text-center text-[11px] text-slate-400">
              Demo Password: <code className="text-slate-300 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700">Password123!</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline">
            Register as a Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
