import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Package, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const base = isAdminHost ? '' : '/admin';
  const ordersPath = `${base}/orders`;
  const productsPath = `${base}/products`;
  const categoriesPath = `${base}/categories`;
  const loginPath = `${base}/login`;

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2 uppercase text-[11px] tracking-[0.2em] font-semibold transition-all duration-300 px-4 py-2 rounded-full ${
      isActive(path) 
        ? 'bg-gold text-white shadow-lg shadow-gold/20' 
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-[#0b2a3d] border-b border-white/5 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link
              to={ordersPath}
              className="flex items-center gap-4 group"
            >
              <img 
                src="/imags/logo.png" 
                alt="Admin" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <LayoutDashboard size={20} className="text-gold" />
              <div className="flex flex-col">
                <span className="font-serif text-white tracking-[0.15em] uppercase text-lg font-bold leading-tight">
                  Admin <span className="text-gold font-light">Panel</span>
                </span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-white/40 font-bold">Secure Access</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-2">
              <Link to={ordersPath} className={linkClass(ordersPath)}>
                <ShoppingBag size={14} />
                Orders
              </Link>
              <Link to={productsPath} className={linkClass(productsPath)}>
                <Package size={14} />
                Products
              </Link>
              <Link to={categoriesPath} className={linkClass(categoriesPath)}>
                <LayoutDashboard size={14} />
                Categories
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('adminKey');
                localStorage.removeItem('adminToken');
                navigate(loginPath);
              }}
              className="flex items-center gap-2 text-white/70 hover:text-white text-[11px] uppercase tracking-widest transition-colors font-medium group"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle admin menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0b2a3d] border-t border-white/5 p-4 space-y-2 animate-in slide-in-from-top duration-300">
          <Link 
            to={ordersPath} 
            className={`flex items-center gap-3 p-4 rounded-xl ${isActive(ordersPath) ? 'bg-gold text-white' : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setOpen(false)}
          >
            <ShoppingBag size={18} />
            <span className="uppercase text-xs tracking-widest font-semibold">Orders</span>
          </Link>
          <Link 
            to={productsPath} 
            className={`flex items-center gap-3 p-4 rounded-xl ${isActive(productsPath) ? 'bg-gold text-white' : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setOpen(false)}
          >
            <Package size={18} />
            <span className="uppercase text-xs tracking-widest font-semibold">Products</span>
          </Link>
          <Link 
            to={categoriesPath} 
            className={`flex items-center gap-3 p-4 rounded-xl ${isActive(categoriesPath) ? 'bg-gold text-white' : 'text-white/70 hover:bg-white/5'}`}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span className="uppercase text-xs tracking-widest font-semibold">Categories</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default AdminNav;
