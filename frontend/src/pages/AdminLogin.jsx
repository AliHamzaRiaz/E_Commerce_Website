import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  LayoutDashboard, 
  RefreshCcw, 
  ChevronRight, 
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState(localStorage.getItem('adminEmail') || '');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const ordersPath = isAdminHost ? '/orders' : '/admin/orders';
  const backToStoreHref = isAdminHost ? window.location.origin.replace('admin.', '') + '/' : '/';
  const adminEmailNormalized = useMemo(() => String(email || '').trim().toLowerCase(), [email]);

  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setPreviewUrl('');
    try {
      localStorage.removeItem('adminKey');
      localStorage.removeItem('adminToken');
      setOtpStatus('');
      const res = await adminApi.post('/auth/login', { email: adminEmailNormalized, password });
      if (res.data?.step === 'otp') {
        setNeedsOtp(true);
        localStorage.setItem('adminEmail', adminEmailNormalized);
        if (res.data?.sent) setOtpStatus('Verification code sent to your email');
        else if (res.data?.previewUrl) {
          setOtpStatus('Secure verification initiated');
          setPreviewUrl(res.data.previewUrl);
          console.log('OTP Preview:', res.data.previewUrl);
        }
        return;
      }
      const token = String(res.data?.token || '');
      if (!token) throw new Error('Login failed');
      login(token, adminEmailNormalized);
      navigate(ordersPath);
    } catch (err) {
      localStorage.removeItem('adminToken');
      const data = err?.response?.data;
      const apiMsg =
        (data && typeof data === 'object' && data.message) ||
        (typeof data === 'string' && data) ||
        err?.response?.statusText;
      setError(apiMsg || err?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await adminApi.post('/auth/verify-otp', { email: adminEmailNormalized, code: otpCode });
      const token = String(res.data?.token || '');
      if (!token) throw new Error('Login failed');
      login(token, adminEmailNormalized);
      navigate(ordersPath);
    } catch (err) {
      localStorage.removeItem('adminToken');
      const data = err?.response?.data;
      const apiMsg =
        (data && typeof data === 'object' && data.message) ||
        (typeof data === 'string' && data) ||
        err?.response?.statusText;
      setError(apiMsg || err?.message || 'Invalid code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a1128] relative overflow-hidden">
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gold blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#0b2a3d] to-[#0a1128] rounded-[2rem] shadow-2xl flex items-center justify-center border border-gold/20 mb-6 group hover:rotate-6 transition-transform duration-500">
              <LayoutDashboard size={44} className="text-gold group-hover:scale-110 transition-transform" />
              <Sparkles size={20} className="absolute top-2 right-2 text-gold/50" />
            </div>
          </div>
          <h1 className="text-4xl font-serif tracking-tight text-white mb-2 uppercase">
            Libbaas <span className="text-gold font-light italic">Admin</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gold/30" />
            <p className="text-gold/60 text-[10px] font-bold uppercase tracking-[0.4em]">Excellence in every detail</p>
            <div className="h-px w-8 bg-gold/30" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle silk overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          
          <form className="space-y-6" onSubmit={needsOtp ? handleVerifyOtp : handleSubmit}>
            {!needsOtp ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold/80 font-bold ml-1">
                    <Mail size={12} />
                    Administrative Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-white/20"
                      placeholder="admin@libbaas.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold/80 font-bold ml-1">
                    <KeyRound size={12} />
                    Secure Password
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-5 py-4 text-sm focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-white/20"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="flex justify-end pr-1">
                    <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-white/40 hover:text-gold transition-colors uppercase tracking-widest">
                      Reset Password
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-2">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-white font-medium">Verify Identity</h3>
                  <p className="text-white/40 text-xs">Enter the 6-digit code sent to your email</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-5 py-5 text-center text-3xl tracking-[0.6em] font-serif focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-white/10"
                    placeholder="000000"
                    required
                  />
                  
                  {otpStatus && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-[10px] text-gold font-bold uppercase tracking-widest bg-gold/5 py-3 rounded-xl border border-gold/10">
                        <Sparkles size={12} className="animate-pulse" />
                        {otpStatus}
                      </div>
                      
                      {previewUrl && (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Development Preview</p>
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-gold hover:underline font-bold flex items-center justify-center gap-2"
                          >
                            <LayoutDashboard size={12} />
                            View Verification Email
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setNeedsOtp(false);
                        setOtpCode('');
                        setOtpStatus('');
                      }}
                      className="py-4 border border-white/10 text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Change Account
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="py-4 border border-white/10 text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <RefreshCcw size={12} className="animate-spin" /> : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 border border-red-500/20 bg-red-500/10 px-5 py-4 rounded-2xl text-[11px] text-red-400 animate-in shake-1 border-l-4 border-l-red-500">
                <AlertCircle size={16} />
                <span className="font-bold uppercase tracking-wider">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative flex items-center justify-center gap-3 bg-gold text-[#0a1128] py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-white transition-all duration-500 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isSubmitting ? (
                <RefreshCcw size={18} className="animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">{needsOtp ? 'Complete Authentication' : 'Authorize Access'}</span>
                  <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <a href={backToStoreHref} className="inline-flex items-center gap-2 text-white/30 hover:text-gold transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
              <ArrowLeft size={14} />
              Return to Boutique
            </a>
          </div>
        </div>
        
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-white/5" />
            <ShieldCheck size={20} className="text-gold/20" />
            <div className="h-px w-12 bg-white/5" />
          </div>
          <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-medium">
            Libbaas Secure <span className="text-gold/40">Encryption</span> Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
