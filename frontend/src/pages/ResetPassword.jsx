import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import userApi from '../utils/userApi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await userApi.post('/reset-password', { token, password });
      setStatus(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-secondary p-6 sm:p-12 text-center space-y-4 border border-black/10">
          <h1 className="text-2xl font-serif uppercase">Invalid Link</h1>
          <p className="text-gray-700">This password reset link is invalid or missing a token.</p>
          <Link to="/forgot-password" title="Forgot Password" className="btn-primary py-4 block font-bold tracking-[0.2em]">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-secondary p-6 sm:p-12 space-y-8 border border-black/10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif tracking-widest uppercase">Reset Password</h1>
          <p className="text-gray-700 text-sm">Enter your new password below.</p>
        </div>

        {status ? (
          <div className="space-y-4">
            <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
              {status}. Redirecting to login...
            </div>
            <Link to="/login" className="w-full btn-primary py-4 text-center block font-bold tracking-[0.2em]">
              Login Now
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-primary border border-black/10 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-accent"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-primary border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                required
              />
            </div>

            {error ? (
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 mt-4 font-bold tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
