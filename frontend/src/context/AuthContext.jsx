import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import userApi from '../utils/userApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile') || 'null');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    let cancelled = false;
    setIsLoading(true);
    userApi
      .get('/me')
      .then((res) => {
        if (cancelled) return;
        const u = res.data?.user || null;
        setUser(u);
        localStorage.setItem('userProfile', JSON.stringify(u || null));
        setFavorites(Array.isArray(res.data?.favorites) ? res.data.favorites.map(String) : []);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('userToken');
        localStorage.removeItem('userProfile');
        setUser(null);
        setFavorites([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveAuth = (token, u) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userProfile', JSON.stringify(u));
    setUser(u);
  };

  const register = async ({ name, email, password }) => {
    const res = await userApi.post('/register', { name, email, password });
    saveAuth(res.data?.token || '', res.data?.user || null);
    setFavorites([]);
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await userApi.post('/login', { email, password });
    saveAuth(res.data?.token || '', res.data?.user || null);
    const me = await userApi.get('/me');
    setFavorites(Array.isArray(me.data?.favorites) ? me.data.favorites.map(String) : []);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfile');
    setUser(null);
    setFavorites([]);
  };

  const isFavorite = (id) => favorites.includes(String(id));
  const toggleFavorite = async (id) => {
    if (!user) throw new Error('Please login first');
    const next = isFavorite(id) ? favorites.filter((x) => x !== String(id)) : [...favorites, String(id)];
    setFavorites(next);
    await userApi.put('/favorites', { favorites: next });
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isLoggedIn: !!user,
      favorites,
      register,
      login,
      logout,
      isFavorite,
      toggleFavorite,
    }),
    [user, isLoading, favorites]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
