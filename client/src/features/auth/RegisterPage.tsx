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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-800">
      {/* Soft natural ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Split Container */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left 7 Columns: Product Showcase & Natural Photography */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs text-emerald-800 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900">NexusDesk</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase tracking-wider">
              Eco
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium">Customer Onboarding</span>
          </div>

          {/* Natural Headline */}
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Instant Care with Friendly Human & AI Support
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Create your account to submit inquiries, track real-time resolution progress, access verified self-service guides, and experience sustainable customer care.
            </p>
          </div>

          {/* Natural Photo Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50 group min-h-[260px] sm:min-h-[340px]">
            <img
              src="/images/natural_customer.jpg"
              alt="Customer Self-Service Support Experience"
              className="w-full h-auto object-cover rounded-t-2xl transition-all duration-500 group-hover:scale-[1.01]"
            />

            {/* Natural Photo Bottom Overlay Bar */}
            <div className="bg-white/95 border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">98% Customer Satisfaction</p>
                  <p className="text-[11px] text-slate-500">Real-time status tracking & verified customer feedback</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 font-medium text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Carbon Support</span>
              </div>
            </div>
          </div>

          {/* 3 Natural Value Prop Cards */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Wait</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Instant self-service answers</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                <span>Secure Privacy</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">End-to-end encrypted tickets</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                <span>Eco-Friendly</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Carbon-neutral compute</p>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Clean White Registration Card */}
        <div className="lg:col-span-5 w-full">
          {/* Card Header */}
          <div className="text-center mb-5 lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Get immediate, sustainable customer care
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    e.g. <span className="text-slate-700 font-medium">Jane Doe</span>
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Work Email
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    e.g. <span className="text-slate-700 font-medium">alex@company.com</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Min 8 characters
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
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
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
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
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
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
          </div>

          <p className="text-center text-xs text-slate-500 mt-5">
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
