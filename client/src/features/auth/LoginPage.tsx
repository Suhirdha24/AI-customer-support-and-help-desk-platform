import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Headphones,
  User,
  CheckCircle2,
  X,
} from 'lucide-react';

type RoleTab = 'ADMIN' | 'AGENT' | 'CUSTOMER';

interface RoleConfig {
  id: RoleTab;
  label: string;
  subLabel: string;
  email: string;
  icon: React.ElementType;
  heroImage: string;
  headline: string;
}

const ROLES: RoleConfig[] = [
  {
    id: 'ADMIN',
    label: 'Admin',
    subLabel: 'Platform Administrator',
    email: 'admin@example.com',
    icon: Shield,
    heroImage: '/images/natural_admin.jpg',
    headline: 'Reliable Platform Governance & Sustainable Operations',
  },
  {
    id: 'AGENT',
    label: 'Agent',
    subLabel: 'Support Specialist',
    email: 'agent1@example.com',
    icon: Headphones,
    heroImage: '/images/natural_agent.jpg',
    headline: 'Help Customers Faster with Real-Time Response Assistance',
  },
  {
    id: 'CUSTOMER',
    label: 'Customer',
    subLabel: 'Client Inquiries',
    email: 'customer1@example.com',
    icon: User,
    heroImage: '/images/natural_customer.jpg',
    headline: 'Quick, Friendly Customer Care with Instant Answers',
  },
];

export const LoginPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<RoleTab>('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleOpenForgotModal = () => {
    setResetEmail(email.trim());
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetError(null);
    setResetSuccess(null);
    setForgotModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const cleanResetEmail = resetEmail.trim().toLowerCase();
    if (!cleanResetEmail) {
      setResetError('Please enter your registered email address.');
      return;
    }
    if (!resetNewPassword) {
      setResetError('Please enter a new password.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setResetLoading(true);
      const res = await apiClient.post('/auth/reset-password', {
        email: cleanResetEmail,
        newPassword: resetNewPassword,
      });

      if (res.data?.success) {
        setResetSuccess(res.data.data?.message || 'Password reset successfully!');
        toast.success('Password updated successfully! You can now sign in.');
        setEmail(cleanResetEmail);
        setPassword(resetNewPassword);
        setTimeout(() => {
          setForgotModalOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to reset password. Please verify your email address.';
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  // Preload all natural images for instant tab switching
  useEffect(() => {
    ROLES.forEach((r) => {
      const img = new Image();
      img.src = r.heroImage;
    });
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'AGENT') navigate('/agent/dashboard', { replace: true });
      else navigate('/customer/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Reset form to pure empty placeholder state on role switch
  useEffect(() => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  }, [activeRole]);

  const handleRoleSelect = (role: RoleConfig) => {
    setActiveRole(role.id);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res.data?.success && res.data?.data) {
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
        setErrorMessage(res.data?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Unable to connect to the authentication server. Please check your network connection.'
          : 'Invalid email or password. Please verify your credentials and try again.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = ROLES.find((r) => r.id === activeRole) || ROLES[0];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white font-sans text-slate-800">
      {/* LEFT COLUMN: Product Showcase & Photography */}
      <div className="lg:w-1/2 xl:w-[52%] bg-slate-50 border-r border-slate-200/80 p-6 sm:p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden h-full">
        {/* Soft natural ambient lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Headline Section */}
        <div className="relative z-10 text-left pt-2 pb-2 shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {currentRole.headline}
          </h1>
        </div>

        {/* Clean Photo Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md my-2 flex-1 flex flex-col min-h-[320px]">
          <img
            key={currentRole.id}
            src={currentRole.heroImage}
            alt={`${currentRole.label} Workspace`}
            className="w-full h-full object-cover rounded-2xl transition-all duration-500"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Form */}
      <div className="lg:w-1/2 xl:w-[48%] bg-white flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto h-full">
        {/* Right Center: Balanced Sign In Form */}
        <div className="max-w-md w-full mx-auto space-y-5 text-left py-4">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sign In
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Select your role to access your dedicated workspace
            </p>
          </div>

          {/* Segmented Role Selector */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
                Workspace Role
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-xl">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent hover:bg-slate-200/60 font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  key={`email-${activeRole}`}
                  type="email"
                  name={`user_login_email_${activeRole}`}
                  id={`user_login_email_${activeRole}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  key={`pwd-${activeRole}`}
                  type={showPassword ? 'text' : 'password'}
                  name={`user_login_pwd_${activeRole}`}
                  id={`user_login_pwd_${activeRole}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/30"
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in as {currentRole.label}...</span>
                </>
              ) : (
                <>
                  <span>Sign in as {currentRole.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 pt-1">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Register as a Customer
            </Link>
          </p>
        </div>

        {/* Right Bottom Footer */}
        <div className="w-full text-center text-xs text-slate-400 shrink-0 pt-2 font-normal">
          <span>© 2026 NexusDesk Technologies • Verified Eco-Certified Platform</span>
        </div>
      </div>

      {/* Reset Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-left relative">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Enter your registered email address to set a new password.
            </p>

            {/* Error Message */}
            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{resetError}</div>
              </div>
            )}

            {/* Success Message */}
            {resetSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{resetSuccess}</div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={resetLoading}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    disabled={resetLoading}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={resetLoading}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  disabled={resetLoading}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {resetLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
