import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { apiClient } from '../../api/client.js';
import { toast } from '../../store/useToastStore.js';
import {
  Sparkles,
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
  Activity,
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
  // Dynamic visual showcase properties
  heroImage: string;
  badgeText: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineGradient: string;
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
    activeColor: 'text-rose-400 border-rose-500/50 bg-rose-500/10',
    badgeBg: 'bg-rose-500',
    heroImage: '/images/admin_hero.jpg',
    badgeText: 'Enterprise Security & SLA Control',
    headlinePrefix: 'Executive Governance & ',
    headlineHighlight: 'System-Wide Telemetry',
    headlineGradient: 'from-rose-400 via-pink-300 to-purple-400',
    description:
      'Oversee multi-team capacity, configure SLA benchmarks, audit security logs, and monitor zero-carbon infrastructure in real time.',
    overlayIcon: Shield,
    overlayTitle: 'Enterprise Security Command',
    overlaySubtitle: '256-bit AES encryption & compliance audit logging',
    overlayPill: '99.99% Uptime SLA',
    props: [
      {
        icon: Shield,
        iconColor: 'text-rose-400',
        title: 'Zero-Trust RBAC',
        desc: 'Role hierarchies & access locks',
      },
      {
        icon: BarChart3,
        iconColor: 'text-purple-400',
        title: 'Executive Analytics',
        desc: 'Global SLA & resolution gauges',
      },
      {
        icon: Leaf,
        iconColor: 'text-emerald-400',
        title: 'Carbon Audit',
        desc: '0.02g CO₂e green compute',
      },
    ],
  },
  {
    id: 'AGENT',
    label: 'Agent',
    subLabel: 'Support Specialist',
    email: 'agent1@example.com',
    icon: Headphones,
    activeColor: 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10',
    badgeBg: 'bg-indigo-500',
    heroImage: '/images/agent_hero.jpg',
    badgeText: 'AI Copilot Workstation',
    headlinePrefix: 'Supercharge Support with ',
    headlineHighlight: 'Real-time AI Copilot',
    headlineGradient: 'from-indigo-400 via-cyan-300 to-teal-400',
    description:
      'Triage incoming tickets with generative suggested responses, track live customer sentiment, and collaborate with internal notes.',
    overlayIcon: Headphones,
    overlayTitle: 'Agent Productivity Suite',
    overlaySubtitle: 'Context-aware AI suggested replies & sentiment gauges',
    overlayPill: '1.8m Avg Resolution',
    props: [
      {
        icon: Zap,
        iconColor: 'text-indigo-400',
        title: 'Auto-Draft Copilot',
        desc: '1-click generative response drafts',
      },
      {
        icon: Smile,
        iconColor: 'text-cyan-400',
        title: 'Sentiment Radar',
        desc: 'Live emotional tone tracking',
      },
      {
        icon: Cpu,
        iconColor: 'text-violet-400',
        title: 'Team Workload',
        desc: 'Instant claiming & peer handoffs',
      },
    ],
  },
  {
    id: 'CUSTOMER',
    label: 'Customer',
    subLabel: 'Client Inquiries',
    email: 'customer1@example.com',
    icon: User,
    activeColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    badgeBg: 'bg-emerald-500',
    heroImage: '/images/customer_hero.jpg',
    badgeText: 'Instant Self-Service Portal',
    headlinePrefix: 'Instant Solutions with ',
    headlineHighlight: 'Friendly AI Assistance',
    headlineGradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    description:
      'Submit inquiries with instant AI categorization, track live resolution updates, browse knowledge base guides, and rate your experience.',
    overlayIcon: Star,
    overlayTitle: 'Customer-First Experience',
    overlaySubtitle: 'Self-service knowledge base & 5-star CSAT ratings',
    overlayPill: '4.8/5 CSAT Score',
    props: [
      {
        icon: Zap,
        iconColor: 'text-emerald-400',
        title: 'Zero Wait Time',
        desc: 'Immediate AI triage & answers',
      },
      {
        icon: Leaf,
        iconColor: 'text-teal-400',
        title: 'Help Center Docs',
        desc: 'Categorized guides & articles',
      },
      {
        icon: Star,
        iconColor: 'text-amber-400',
        title: 'CSAT Feedback',
        desc: 'Transparent 5-star service ratings',
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

  // Preload all role images into browser cache for instant tab transitions
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

    // Use typed value or active role placeholder default
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[34rem] h-[34rem] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Split Container */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left 7 Columns: Product Showcase & Visual Artwork */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Brand Badge (Changes dynamically based on selected role) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-sm backdrop-blur-md transition-all">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">NexusDesk AI</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">{currentRole.badgeText}</span>
          </div>

          {/* Headline (Changes dynamically based on selected role) */}
          <div className="space-y-3 transition-all duration-300">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {currentRole.headlinePrefix}{' '}
              <span className={`bg-gradient-to-r ${currentRole.headlineGradient} bg-clip-text text-transparent`}>
                {currentRole.headlineHighlight}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              {currentRole.description}
            </p>
          </div>

          {/* Hero Visual Showcase: Changes image dynamically with role */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/90 bg-slate-900/70 shadow-2xl group min-h-[260px] sm:min-h-[340px]">
            <img
              key={currentRole.id}
              src={currentRole.heroImage}
              alt={`${currentRole.label} Workspace Preview`}
              className="w-full h-auto object-cover rounded-2xl transition-all duration-500 group-hover:scale-[1.01] animate-fadeIn"
            />

            {/* Bottom Glass Overlay (Role-specific telemetry) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-4 sm:p-5 flex items-center justify-between text-xs backdrop-blur-[2px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white flex items-center justify-center">
                  <OverlayIcon className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">{currentRole.overlayTitle}</p>
                  <p className="text-[11px] text-slate-400">{currentRole.overlaySubtitle}</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>{currentRole.overlayPill}</span>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid (Changes dynamically per role) */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {currentRole.props.map((prop, idx) => {
              const PropIcon = prop.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm transition-all"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                    <PropIcon className={`w-3.5 h-3.5 ${prop.iconColor}`} />
                    <span>{prop.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Authentication Card */}
        <div className="lg:col-span-5 w-full">
          {/* Card Header */}
          <div className="text-center mb-5 lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/25 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Select your role to access your dedicated workspace
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Sleek Segmented Role Tab Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
                  Select Workspace Role
                </span>
                <span className="text-[11px] text-indigo-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Auto-fills credentials</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? `${role.activeColor} shadow-sm border`
                          : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Role: <strong className="text-slate-300 font-semibold">{currentRole.subLabel}</strong>
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
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Default: <strong className="text-emerald-400 font-semibold">Password123!</strong>
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
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span>Remember this device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
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
          <p className="text-center text-xs text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 underline">
              Register as a Customer
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Demo Access & Passwords</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              For all demo roles (Admin, Agent, Customer), the default password is{' '}
              <code className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                Password123!
              </code>
              . You can switch between roles using the role switcher tabs.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
