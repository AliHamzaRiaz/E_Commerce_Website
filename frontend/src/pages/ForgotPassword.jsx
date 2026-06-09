import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import userApi from '../utils/userApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setPreviewUrl('');
    setIsSubmitting(true);
    try {
      const res = await userApi.post('/forgot-password', { email });
      setStatus(res.data.message);
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-secondary p-6 sm:p-12 space-y-8 border border-black/10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif tracking-widest uppercase">Forgot Password</h1>
          <p className="text-gray-700 text-sm">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {status ? (
          <div className="space-y-4">
            <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
              {status}
            </div>
            {previewUrl && (
              <div className="p-4 bg-primary border border-black/10 rounded">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">Email Preview (Development Mode)</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gold hover:underline text-sm break-all"
                >
                  Click here to view the reset email
                </a>
              </div>
            )}
            <Link to="/login" className="w-full btn-primary py-4 text-center block font-bold tracking-[0.2em]">
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-primary border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                placeholder="your@email.com"
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
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gold transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
