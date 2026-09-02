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
  Info,
  HelpCircle,
  Zap,
  Leaf,
  Star,
  Cpu,
  Smile,
  BarChart3,
} from 'lucide-react';

type RoleTab = 'ADMIN' | 'AGENT' | 'CUSTOMER';

interface RoleProp {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  desc: string;
}

interface RoleConfig {
  id: RoleTab;
  label: string;
  subLabel: string;
  email: string;
  icon: React.ElementType;
  activeColor: string;
  badgeBg: string;
  // Natural visual showcase properties
  heroImage: string;
  badgeText: string;
  headline: string;
  description: string;
  overlayIcon: React.ElementType;
  overlayTitle: string;
  overlaySubtitle: string;
  overlayPill: string;
  props: RoleProp[];
}

const ROLES: RoleConfig[] = [
  {
    id: 'ADMIN',
    label: 'Admin',
    subLabel: 'Platform Administrator',
    email: 'admin@example.com',
    icon: Shield,
    activeColor: 'bg-white text-emerald-900 shadow-sm border-slate-200/80 font-bold',
    badgeBg: 'bg-emerald-600',
    heroImage: '/images/natural_admin.jpg',
    badgeText: 'Executive Operations & Governance',
    headline: 'Reliable Platform Governance & Sustainable Operations',
    description:
      'Monitor live ticket velocity, configure SLA benchmarks, audit security logs, and oversee support team capacity in real time.',
    overlayIcon: Shield,
    overlayTitle: 'Executive Administration',
    overlaySubtitle: 'Compliance audit trail, team leads, and RBAC governance',
    overlayPill: '99.98% SLA Benchmark',
    props: [
      {
        icon: Shield,
        iconColor: 'text-emerald-700',
        title: 'Team RBAC',
        desc: 'Role hierarchies & access control',
      },
      {
        icon: BarChart3,
        iconColor: 'text-teal-700',
        title: 'Live Metrics',
        desc: 'SLA compliance & ticket breakdown',
      },
      {
        icon: Leaf,
        iconColor: 'text-emerald-700',
        title: 'Eco-Engine',
        desc: '0.02g CO₂e green telemetry',
      },
    ],
  },
  {
    id: 'AGENT',
    label: 'Agent',
    subLabel: 'Support Specialist',
    email: 'agent1@example.com',
    icon: Headphones,
    activeColor: 'bg-white text-teal-900 shadow-sm border-slate-200/80 font-bold',
    badgeBg: 'bg-teal-600',
    heroImage: '/images/natural_agent.jpg',
    badgeText: 'Support Specialist Workspace',
    headline: 'Help Customers Faster with Real-Time Response Assistance',
    description:
      'Manage incoming customer inquiries with suggested draft replies, track live customer sentiment, and collaborate through internal staff notes.',
    overlayIcon: Headphones,
    overlayTitle: 'Support Specialist Desk',
    overlaySubtitle: 'Context-aware suggestions, queue triage & customer threads',
    overlayPill: '1.8m Avg Resolution',
    props: [
      {
        icon: Zap,
        iconColor: 'text-teal-700',
        title: 'Response Copilot',
        desc: '1-click suggested response drafts',
      },
      {
        icon: Smile,
        iconColor: 'text-emerald-700',
        title: 'Customer Tone',
        desc: 'Sentiment analysis radar',
      },
      {
        icon: Cpu,
        iconColor: 'text-slate-700',
        title: 'Workload Matrix',
        desc: '1-click ticket claiming & handoffs',
      },
    ],
  },
  {
    id: 'CUSTOMER',
    label: 'Customer',
    subLabel: 'Client Inquiries',
    email: 'customer1@example.com',
    icon: User,
    activeColor: 'bg-white text-emerald-900 shadow-sm border-slate-200/80 font-bold',
    badgeBg: 'bg-emerald-600',
    heroImage: '/images/natural_customer.jpg',
    badgeText: 'Client Self-Service Portal',
    headline: 'Quick, Friendly Customer Care with Instant Answers',
    description:
      'Submit inquiries with instant categorization, track resolution milestones in real time, browse self-service guides, and rate your experience.',
    overlayIcon: Star,
    overlayTitle: 'Customer Care Portal',
    overlaySubtitle: 'Help center documentation & verified 5-star feedback',
    overlayPill: '4.8/5 CSAT Score',
    props: [
      {
        icon: Zap,
        iconColor: 'text-emerald-700',
        title: 'Zero Wait',
        desc: 'Instant self-service answers',
      },
      {
        icon: Leaf,
        iconColor: 'text-teal-700',
        title: 'Help Center',
        desc: 'Rich searchable knowledge base',
      },
      {
        icon: Star,
        iconColor: 'text-amber-600',
        title: 'CSAT Reviews',
        desc: 'Transparent 5-star feedback',
      },
    ],
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

  const { login, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

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

    const targetRole = ROLES.find((r) => r.id === activeRole) || ROLES[0];
    const cleanEmail = email.trim() || targetRole.email;
    const cleanPassword = password || 'Password123!';

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
  const OverlayIcon = currentRole.overlayIcon;

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
            <span className="text-emerald-700 font-medium">{currentRole.badgeText}</span>
          </div>

          {/* Natural Headline */}
          <div className="space-y-2.5 transition-all duration-300">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {currentRole.headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              {currentRole.description}
            </p>
          </div>

          {/* Natural Photo Frame: Changes smoothly per role */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50 group min-h-[260px] sm:min-h-[340px]">
            <img
              key={currentRole.id}
              src={currentRole.heroImage}
              alt={`${currentRole.label} Workspace`}
              className="w-full h-auto object-cover rounded-t-2xl transition-all duration-500 group-hover:scale-[1.01]"
            />

            {/* Natural Photo Bottom Overlay Bar */}
            <div className="bg-white/95 border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center">
                  <OverlayIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{currentRole.overlayTitle}</p>
                  <p className="text-[11px] text-slate-500">{currentRole.overlaySubtitle}</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 font-medium text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentRole.overlayPill}</span>
              </div>
            </div>
          </div>

          {/* 3 Natural Value Prop Cards */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {currentRole.props.map((prop, idx) => {
              const PropIcon = prop.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <PropIcon className={`w-3.5 h-3.5 ${prop.iconColor}`} />
                    <span>{prop.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Clean White Authentication Card */}
        <div className="lg:col-span-5 w-full">
          {/* Card Header */}
          <div className="text-center mb-5 lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign In</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Select your role to access your dedicated workspace
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            {/* Segmented Role Selector in Clean Light Palette */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500">
                  Select Workspace Role
                </span>
                <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                  <Info className="w-3 h-3" />
                  <span>Auto-fills credentials</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 border border-slate-200/60 rounded-xl">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/80'
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
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Role: <strong className="text-slate-800 font-semibold">{currentRole.subLabel}</strong>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    key={`email-${activeRole}`}
                    type="email"
                    name={`user_login_email_${activeRole}`}
                    id={`user_login_email_${activeRole}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentRole.email}
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
                    Default: <strong className="text-emerald-700 font-semibold">Password123!</strong>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    key={`pwd-${activeRole}`}
                    type={showPassword ? 'text' : 'password'}
                    name={`user_login_pwd_${activeRole}`}
                    id={`user_login_pwd_${activeRole}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password123!"
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

              {/* Options */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
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
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
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
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 underline">
              Register as a Customer
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Demo Access & Passwords</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              For all demo roles (Admin, Agent, Customer), the default password is{' '}
              <code className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                Password123!
              </code>
              . You can switch between roles using the role switcher tabs above.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
