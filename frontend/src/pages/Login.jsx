import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = useMemo(() => {
    const next = new URLSearchParams(location.search).get('next') || '';
    return next.startsWith('/') ? next : '/shop';
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-secondary p-6 sm:p-12 space-y-8 border border-black/10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif tracking-widest uppercase">Sign In</h1>
          <p className="text-gray-700 text-sm">Login to see favorites and order history</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-primary border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Password</label>
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
            <div className="flex justify-end">
              <Link to="/forgot-password" title="Forgot Password" className="text-xs text-gray-600 hover:text-gold transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>
          {error ? <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 mt-4 font-bold tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-700">
          New user?{' '}
          <Link to={`/register?next=${encodeURIComponent(nextPath)}`} className="text-gold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
