import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminLogin from './pages/AdminLogin';
import Cart from './components/Cart';
import AdminRoute from './components/AdminRoute';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from './context/AdminAuthContext';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdminHost = window.location.hostname.startsWith('admin.');
  const isAdminPath = location.pathname.startsWith('/admin');
  const showAdmin = isAdminHost || isAdminPath;

  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col bg-white text-black">
        <Toaster position="top-center" reverseOrder={false} />
        {!showAdmin ? <Navbar onCartClick={() => setIsCartOpen(true)} /> : null}
        {!showAdmin ? <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} /> : null}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Routes location={location}>
                {isAdminHost ? (
                  <>
                    <Route path="/" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                    <Route path="/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                    <Route path="/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/orders" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                    <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                  </>
                )}
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        {!showAdmin ? <Footer /> : null}
      </div>
    </AdminAuthProvider>
  );
}

export default App;
