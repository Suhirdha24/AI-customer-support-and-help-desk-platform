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
  Zap,
  Leaf,
  Shield,
  Star,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Ensure form fields always start completely empty with clean placeholders
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields.');
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
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white font-sans text-slate-800">
      {/* LEFT COLUMN: Customer Showcase & Photography (Fills 50% - 52% of window) */}
      <div className="lg:w-1/2 xl:w-[52%] bg-slate-50 border-r border-slate-200/80 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden h-full">
        {/* Soft ambient lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Bar */}
        <div className="relative z-10 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs text-emerald-800 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900">NexusDesk</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wider">
              Eco
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium">Customer Onboarding</span>
          </div>
        </div>

        {/* Content Section: Headline, Description & Feature Pills */}
        <div className="relative z-10 text-left pt-3 shrink-0">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Instant Care with Friendly Human & AI Support
            </h1>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              Create your account to submit inquiries, track real-time resolution progress, access verified self-service guides, and experience sustainable customer care.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Zero Wait Time</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-xs">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Encrypted Privacy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>Carbon-Neutral</span>
            </span>
          </div>
        </div>

        {/* Photo Frame that expands vertically to fill all available space */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md group my-3 flex-1 flex flex-col min-h-[260px] max-h-[480px]">
          <img
            src="/images/natural_customer.jpg"
            alt="Customer Support Experience"
            className="w-full flex-1 min-h-0 object-cover rounded-t-2xl transition-all duration-500 group-hover:scale-[1.01]"
          />

          {/* Bottom Overlay Bar */}
          <div className="bg-white/95 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">98% Customer Satisfaction</p>
                <p className="text-[11px] text-slate-500 hidden sm:block">Verified post-resolution reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero Carbon Support</span>
            </div>
          </div>
        </div>

        {/* Bottom Sustainability Note */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center gap-2 shrink-0">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Eco-certified customer care • Carbon-neutral compute</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Account Creation Form (Fills other 50% of window) */}
      <div className="lg:w-1/2 xl:w-[48%] bg-white flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 overflow-y-auto h-full">
        {/* Right Top Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NexusDesk Customer Portal</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Self-Service
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-lg w-full mx-auto my-auto space-y-6 text-left py-4">
          {/* Header */}
          <div>
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
              <Leaf className="w-6 h-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              Create an Account
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Get immediate, sustainable customer support
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5" autoComplete="off">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <span className="text-xs sm:text-sm text-slate-500 font-mono">
                  e.g. <span className="text-slate-800 font-bold">Jane Doe</span>
                </span>
              </div>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <input
                  type="text"
                  name="reg_fullname"
                  id="reg_fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  autoComplete="off"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Work Email
                </label>
                <span className="text-xs sm:text-sm text-slate-500 font-mono">
                  e.g. <span className="text-slate-800 font-bold">alex@company.com</span>
                </span>
              </div>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <input
                  type="email"
                  name="reg_user_email"
                  id="reg_user_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs sm:text-sm text-slate-500 font-mono">
                  Min 8 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="reg_user_password"
                  id="reg_user_password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-slate-50/70 border-2 border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm sm:text-base font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs sm:text-sm text-slate-600 pt-1">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Bottom Footer */}
        <div className="w-full text-center text-xs text-slate-400 shrink-0 pt-2">
          <span>© 2026 NexusDesk Technologies • Verified Eco-Certified Platform</span>
        </div>
      </div>
    </div>
  );
};
