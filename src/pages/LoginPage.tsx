import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ChevronDown, Info, X } from 'lucide-react';
import type { UserRole } from '../types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roles: { value: UserRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'manager', label: 'Manager' },
];

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!validate()) return;

    setIsLoading(true);
    // Simulated delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1200));

    localStorage.setItem('aoss_user_role', selectedRole);
    localStorage.setItem('aoss_user_email', email);
    localStorage.setItem('aoss_authenticated', 'true');
    if (rememberMe) {
      localStorage.setItem('aoss_remember_me', 'true');
    }

    setIsLoading(false);
    navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const selectedRoleLabel = roles.find((r) => r.value === selectedRole)?.label ?? 'Owner';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 bg-[#0F0A2E]" />
      <div
        className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vh] rounded-full opacity-40 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #7658E8 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vh] rounded-full opacity-30 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #F7DFF0 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[10%] right-[10%] w-[40vw] h-[40vh] rounded-full opacity-25 blur-[90px]"
        style={{ background: 'radial-gradient(circle, #FFF0B0 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[30%] left-[20%] w-[30vw] h-[30vh] rounded-full opacity-20 blur-[80px]"
        style={{ background: 'radial-gradient(circle, #DAD1FF 0%, transparent 70%)' }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-sidebar-bg border border-sidebar-highlight/30 px-5 py-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-violet/20">
              <Info className="w-4 h-4 text-accent-violet" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Demo Mode</p>
              <p className="text-xs text-text-muted">No password reset available in demo</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/[0.1] shadow-2xl p-8 sm:p-10">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-sidebar-highlight flex items-center justify-center shadow-lg shadow-accent-violet/30">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                  AOSS <span className="text-accent-violet">FrontDesk</span>
                </h1>
                <p className="text-[10px] font-medium text-text-muted tracking-[0.2em] uppercase">
                  Dental Clinic Portal
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-white mt-6 mb-1">Welcome Back</h2>
            <p className="text-sm text-text-muted">Sign in to your clinic portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login error */}
            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
                >
                  {loginError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="doctor@clinic.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border text-white text-sm placeholder:text-white/30 outline-none transition-all focus:bg-white/[0.1] focus:ring-2 focus:ring-accent-violet/40 ${
                    errors.email
                      ? 'border-error/50 focus:ring-error/40'
                      : 'border-white/[0.1] focus:border-accent-violet/50'
                  }`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.06] border text-white text-sm placeholder:text-white/30 outline-none transition-all focus:bg-white/[0.1] focus:ring-2 focus:ring-accent-violet/40 ${
                    errors.password
                      ? 'border-error/50 focus:ring-error/40'
                      : 'border-white/[0.1] focus:border-accent-violet/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1.5 text-xs text-error"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border border-white/20 bg-white/[0.05] peer-checked:bg-accent-violet peer-checked:border-accent-violet transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-accent-violet hover:text-sidebar-highlight transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Sign in as</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm text-left outline-none flex items-center justify-between transition-all hover:bg-white/[0.1] focus:ring-2 focus:ring-accent-violet/40 focus:border-accent-violet/50"
                >
                  <span>{selectedRoleLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform ${isRoleOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {isRoleOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-sidebar-bg border border-white/[0.1] shadow-xl overflow-hidden z-20"
                    >
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.value);
                            setIsRoleOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                            selectedRole === role.value
                              ? 'bg-accent-violet/20 text-accent-violet'
                              : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-violet to-sidebar-highlight text-white text-sm font-semibold shadow-lg shadow-accent-violet/30 hover:shadow-xl hover:shadow-accent-violet/40 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
            </motion.button>
          </form>

          {/* Demo notice */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <div className="flex items-start gap-2 text-center justify-center">
              <Info className="w-3.5 h-3.5 text-accent-violet mt-0.5 shrink-0" />
              <p className="text-xs text-white/40 leading-relaxed">
                <span className="text-accent-violet font-medium">Demo Mode</span> — Use any email and
                password to sign in
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-4 mx-auto w-1/3 h-1 rounded-full bg-gradient-to-r from-accent-violet via-sidebar-highlight to-accent-pink opacity-60" />
      </motion.div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
