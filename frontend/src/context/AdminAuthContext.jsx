import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('adminToken'));
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);
  const navigate = useNavigate();
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const loginPath = isAdminHost ? '/login' : '/admin/login';

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowTimeoutWarning(false);
    setRemainingSeconds(30);

    // Set warning timer (shows after 2 minutes of inactivity, with 30 second countdown)
    warningTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      // Start countdown
      let countdown = 30;
      setRemainingSeconds(countdown);
      countdownRef.current = setInterval(() => {
        countdown -= 1;
        setRemainingSeconds(countdown);
        if (countdown <= 0) {
          clearInterval(countdownRef.current);
        }
      }, 1000);
    }, 120000); // 2 minutes (120,000ms)

    // Set auto-logout timer (2.5 minutes total)
    timeoutRef.current = setTimeout(() => {
      logout();
    }, 150000);
  }, [isAuthenticated]);

  const logout = useCallback(() => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    localStorage.removeItem('adminEmail');
    setIsAuthenticated(false);
    setShowTimeoutWarning(false);
    navigate(loginPath, { replace: true });
  }, [loginPath, navigate]);

  const login = useCallback((token, email) => {
    localStorage.setItem('adminToken', token);
    if (email) localStorage.setItem('adminEmail', email);
    setIsAuthenticated(true);
    resetTimer();
  }, [resetTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };
    events.forEach(event => window.addEventListener(event, handleActivity));

    // Initial timer setup
    if (isAuthenticated) {
      resetTimer();
    }

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimer]);

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        extendSession,
        showTimeoutWarning,
        remainingSeconds
      }}
    >
      {children}
      {/* Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-slate-900">Session Timeout Warning</h3>
              <p className="text-slate-600 text-sm">
                Your session will expire in <span className="font-bold text-amber-600 text-lg">{remainingSeconds}</span> seconds due to inactivity.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={logout}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Logout Now
                </button>
                <button
                  onClick={extendSession}
                  className="flex-1 px-4 py-3 bg-gold text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-yellow-600 transition-all shadow-lg shadow-amber-200"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminAuthContext.Provider>
  );
};
