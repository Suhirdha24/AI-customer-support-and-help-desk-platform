import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Leaf,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Ensure form fields always start completely empty with clean placeholders
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMessage('');
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'CUSTOMER',
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        toast.success(`Welcome to NexusDesk, ${user.name}!`);
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white font-sans text-slate-800">
      {/* LEFT COLUMN: Customer Showcase & Photography */}
      <div className="lg:w-1/2 xl:w-[52%] bg-slate-50 border-r border-slate-200/80 p-6 sm:p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden h-full">
        {/* Soft ambient lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Headline Section */}
        <div className="relative z-10 text-left pt-2 pb-2 shrink-0">
          <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Instant Care with Friendly Human & AI Support
          </h1>
        </div>

        {/* Clean Photo Frame */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md my-2 flex-1 flex flex-col min-h-[320px]">
          <img
            src="/images/natural_customer.jpg"
            alt="Customer Support Experience"
            className="w-full h-full object-cover rounded-2xl transition-all duration-500"
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Account Creation Form */}
      <div className="lg:w-1/2 xl:w-[48%] bg-white flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto h-full">
        {/* Form Container */}
        <div className="max-w-md w-full mx-auto space-y-5 text-left py-4">
          {/* Website Brand Header */}
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                NexusDesk
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                Eco
              </span>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create an Account
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Get immediate, sustainable customer support
            </p>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="reg_fullname"
                  id="reg_fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoComplete="off"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="reg_user_email"
                  id="reg_user_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
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
                  type={showPassword ? 'text' : 'password'}
                  name="reg_user_password"
                  id="reg_user_password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min 6 characters)"
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 pt-1">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Bottom Footer */}
        <div className="w-full text-center text-xs text-slate-400 shrink-0 pt-2 font-normal">
          <span>© 2026 NexusDesk Technologies • Verified Eco-Certified Platform</span>
        </div>
      </div>
    </div>
  );
};
