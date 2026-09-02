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
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 flex flex-col justify-center py-4 lg:py-2 px-4 sm:px-6 lg:px-8 relative overflow-y-auto lg:overflow-hidden font-sans text-slate-800">
      {/* Soft natural ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Split Container: Fits in screen */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10 my-auto">
        {/* Left 7 Columns: Product Showcase & Natural Photography */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-3.5 text-left">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-emerald-200 text-xs text-emerald-800 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900">NexusDesk</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wider">
              Eco
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium">Customer Onboarding</span>
          </div>

          {/* Compact Natural Headline */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Instant Care with Friendly Human & AI Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              Create your account to submit inquiries, track real-time resolution progress, and access verified self-service guides.
            </p>
          </div>

          {/* Natural Photo Frame */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md shadow-slate-200/50 group">
            <img
              src="/images/natural_customer.jpg"
              alt="Customer Self-Service Support Experience"
              className="w-full h-44 sm:h-52 lg:h-56 xl:h-60 object-cover rounded-t-xl transition-all duration-500 group-hover:scale-[1.01]"
            />

            {/* Natural Photo Bottom Overlay Bar */}
            <div className="bg-white/95 border-t border-slate-100 px-3.5 py-2 sm:py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">98% Customer Satisfaction</p>
                  <p className="text-[10px] text-slate-500 hidden sm:block">Real-time status tracking & verified feedback</p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-medium text-[10px] sm:text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Zero Carbon Support</span>
              </div>
            </div>
          </div>

          {/* 3 Compact Natural Value Prop Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-0.5">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs transition-all">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 mb-0.5">
                <Zap className="w-3 h-3 text-emerald-700" />
                <span className="truncate">Zero Wait</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight truncate">Instant self-service answers</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs transition-all">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 mb-0.5">
                <Shield className="w-3 h-3 text-teal-700" />
                <span className="truncate">Secure Privacy</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight truncate">End-to-end encrypted</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs transition-all">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 mb-0.5">
                <Leaf className="w-3 h-3 text-emerald-700" />
                <span className="truncate">Eco-Friendly</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight truncate">Carbon-neutral compute</p>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Clean White Registration Card */}
        <div className="lg:col-span-5 w-full">
          {/* Card Header */}
          <div className="text-center mb-3.5 lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white shadow-xs mb-2">
              <Leaf className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Create an Account</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Get immediate, sustainable customer care
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-lg shadow-slate-200/50">
            <form onSubmit={handleRegister} className="space-y-3" autoComplete="off">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    e.g. <span className="text-slate-700 font-medium">Jane Doe</span>
                  </span>
                </div>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Work Email
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    e.g. <span className="text-slate-700 font-medium">alex@company.com</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Min 8 characters
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-3">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
