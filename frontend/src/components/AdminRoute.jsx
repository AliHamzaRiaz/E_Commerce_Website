import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const adminToken = localStorage.getItem('adminToken');
  const loginPath = isAdminHost ? '/login' : '/admin/login';
  if (!adminToken) return <Navigate to={loginPath} replace />;
  return children;
};

export default AdminRoute;
