import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  RefreshCcw, 
  ShoppingBag, 
  Mail, 
  MessageCircle, 
  ExternalLink,
  Filter,
  User,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CreditCard,
  PackageCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import AdminNav from '../components/AdminNav';
import adminApi from '../utils/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

const getStatusConfig = (status) => {
  const config = {
    PLACED: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    PAID: { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    CONFIRMED: { icon: PackageCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    SHIPPED: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    DELIVERED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    CANCELLED: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };
  return config[status] || { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
};

const AdminOrders = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [subject, setSubject] = useState('Order Update');
  const [message, setMessage] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [sendingId, setSendingId] = useState(null);

  const statusMessages = {
    CONFIRMED: {
      subject: 'Order Confirmed - LIBBAAS',
      message: 'Great news! Your order has been confirmed and is being processed. You can expect delivery within 2-3 working days.'
    },
    SHIPPED: {
      subject: 'Order Shipped - LIBBAAS',
      message: 'Your order is on its way! It has been handed over to our delivery partner.'
    },
    DELIVERED: {
      subject: 'Order Delivered - LIBBAAS',
      message: 'Your order has been successfully delivered. We hope you love your new items! Thank you for shopping with us.'
    },
    CANCELLED: {
      subject: 'Order Cancelled - LIBBAAS',
      message: 'We regret to inform you that your order has been cancelled.'
    }
  };

  const cancellationReasons = [
    'Incomplete information provided',
    'Out of stock',
    'Requested color/size not available',
    'Delivery area not covered',
    'Customer requested cancellation'
  ];
  const [previewUrl, setPreviewUrl] = useState('');
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const loginPath = isAdminHost ? '/login' : '/admin/login';
  const logoutToLogin = () => {
    logout();
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/orders');
      setOrders(res.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      const res = await adminApi.put(`/orders/${id}/status`, { status });
      
      // Show email preview if sent
      if (res.data?.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
      
      // Auto-populate message section
      const template = statusMessages[status];
      if (template) {
        setSubject(template.subject);
        setMessage(template.message);
        setActiveId(id);
        if (status === 'CANCELLED') {
          setSelectedReason(cancellationReasons[0]);
          setMessage(`${template.message} Reason: ${cancellationReasons[0]}`);
        }
      }

      await fetchOrders();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const resendEmail = async (id) => {
    setError('');
    setPreviewUrl('');
    setSendingId(id);
    try {
      const res = await adminApi.post(`/orders/${id}/resend-email`);
      if (res.data?.previewUrl) setPreviewUrl(res.data.previewUrl);
      await fetchOrders();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingId(null);
    }
  };

  const sendEmail = async (id) => {
    setError('');
    setPreviewUrl('');
    setSendingId(id);
    try {
      const res = await adminApi.post(`/orders/${id}/message/email`, { subject, message });
      if (res.data?.previewUrl) setPreviewUrl(res.data.previewUrl);
      await fetchOrders();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingId(null);
    }
  };

  const openWhatsApp = (phone, text) => {
    const cleaned = String(phone || '').replace(/[^\d+]/g, '');
    const number = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
    if (!number) return;
    const url = `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(text || '')}`;
    window.open(url, '_blank', 'noreferrer');
  };

  const statusCounts = useMemo(() => {
    const base = { ALL: orders.length, PLACED: 0, PAID: 0, CONFIRMED: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const o of orders) {
      const s = String(o.status || '').toUpperCase();
      if (Object.prototype.hasOwnProperty.call(base, s)) base[s] += 1;
    }
    return base;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const idNeedle = String(idFilter || '').trim().toLowerCase();
    const nameNeedle = String(nameFilter || '').trim().toLowerCase();
    const statusNeedle = String(statusFilter || 'ALL').toUpperCase();
    return orders.filter((o) => {
      const idOk = !idNeedle || String(o.id || '').toLowerCase().includes(idNeedle);
      const nameOk = !nameNeedle || String(o.customer?.fullName || '').toLowerCase().includes(nameNeedle);
      const statusOk = statusNeedle === 'ALL' || String(o.status || '').toUpperCase() === statusNeedle;
      return idOk && nameOk && statusOk;
    });
  }, [orders, idFilter, nameFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight text-slate-900 flex items-center gap-3">
              <ShoppingBag className="text-gold" size={32} />
              Order Management
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.1em]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCcw size={14} className="animate-spin" />
                  Syncing orders...
                </span>
              ) : (
                `Viewing ${filteredOrders.length} of ${orders.length} orders`
              )}
            </p>
          </div>
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all font-semibold text-sm"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>

        {error ? (
          <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-6 py-4 rounded-xl text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
            <XCircle size={20} />
            {error}
          </div>
        ) : null}

        {previewUrl && (
          <div className="flex items-center justify-between gap-3 border border-indigo-200 bg-indigo-50 px-6 py-4 rounded-xl text-sm text-indigo-800 animate-in fade-in">
            <div className="flex items-center gap-3">
              <Mail size={20} />
              <span>Email preview is ready to view</span>
            </div>
            <a 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all" 
              href={previewUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              Open Preview <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Status Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {['ALL', 'PLACED', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => {
            const isActive = statusFilter === s;
            const config = getStatusConfig(s);
            const Icon = config.icon || Filter;
            
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`flex flex-col gap-2 p-4 rounded-2xl border transition-all ${
                  isActive 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-gold/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon size={16} className={isActive ? 'text-gold' : 'text-slate-400'} />
                  <span className={`text-xs font-bold ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                    {statusCounts[s] || 0}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-left">{s}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all rounded-xl"
              placeholder="Search by Order ID..."
            />
          </div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all rounded-xl"
              placeholder="Search customer name..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all rounded-xl appearance-none"
            >
              <option value="ALL">Filter by Status</option>
              <option value="PLACED">PLACED</option>
              <option value="PAID">PAID</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Order Details</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Customer</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Items</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold text-center">Payment & Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-8" colSpan={5}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-slate-100 rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-slate-100 rounded" />
                            <div className="h-3 w-24 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td className="px-6 py-20 text-center" colSpan={5}>
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ShoppingBag size={48} className="text-slate-200" />
                        <p className="font-serif text-lg">No orders matching your filters</p>
                        <button onClick={() => { setIdFilter(''); setNameFilter(''); setStatusFilter('ALL'); }} className="text-gold text-sm font-bold uppercase tracking-widest hover:underline">
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const statusCfg = getStatusConfig(String(o.status).toUpperCase());
                    const StatusIcon = statusCfg.icon;
                    
                    return (
                      <React.Fragment key={o.id}>
                        <tr className={`hover:bg-slate-50/50 transition-colors group ${activeId === o.id ? 'bg-gold/5' : ''}`}>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-gold transition-colors">#{o.id.slice(-8).toUpperCase()}</span>
                              <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{o.customer?.fullName}</span>
                              <span className="text-xs text-slate-500">{o.customer?.phone}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{o.customer?.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-700">
                                {Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + Number(it?.quantity || 0), 0) : 0} Items
                              </span>
                              <div className="flex -space-x-2 overflow-hidden">
                                {(o.items || []).slice(0, 3).map((item, idx) => (
                                  <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden border border-slate-200">
                                    {item.image ? (
                                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-slate-400">
                                        {item.name?.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-slate-900">Rs {Number(o.total || 0).toLocaleString()}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{o.paymentMethod || 'COD'}</span>
                              </div>
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                                <StatusIcon size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{o.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openWhatsApp(o.customer?.phone, `Hi ${o.customer?.fullName}, your order #${o.id.slice(-8).toUpperCase()} from LIBBAAS is ${o.status}.`)}
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                title="WhatsApp Customer"
                              >
                                <MessageCircle size={18} />
                              </button>
                              <button
                                onClick={() => setActiveId(activeId === o.id ? null : o.id)}
                                className={`p-2 rounded-lg transition-all ${activeId === o.id ? 'bg-gold text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                                title="Manage Order"
                              >
                                <ChevronDown size={18} className={`transition-transform duration-300 ${activeId === o.id ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable Order Details */}
                        {activeId === o.id && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={5} className="px-8 py-8">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-300">
                                {/* Order Summary */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                  <h4 className="font-serif text-lg text-slate-900 border-b border-slate-100 pb-2">Order Summary</h4>
                                  <div className="space-y-3">
                                    {(o.items || []).map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3 flex-1">
                                          {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-100" />}
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => {
                                                  const productsPath = isAdminHost ? '/products' : '/admin/products';
                                                  navigate(`${productsPath}?edit=${encodeURIComponent(item.id)}`);
                                                }}
                                                className="text-slate-900 font-semibold hover:text-gold transition-colors flex items-center gap-1"
                                              >
                                                {item.name}
                                                <ExternalLink size={12} />
                                              </button>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                              <span className="text-slate-400 text-xs">x{item.quantity}</span>
                                              {item.selectedColor && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: item.selectedColor.toLowerCase().includes('black') ? '#1a1a1a' : item.selectedColor.toLowerCase().includes('blue') ? '#0b2a3d' : item.selectedColor.toLowerCase().includes('pink') ? '#fce7f3' : item.selectedColor.toLowerCase().includes('nude') ? '#f3e5d8' : item.selectedColor.toLowerCase().includes('white') ? '#ffffff' : item.selectedColor.toLowerCase().includes('red') ? '#991b1b' : item.selectedColor.toLowerCase().includes('green') ? '#064e3b' : item.selectedColor }}></span> {item.selectedColor}</span>}
                                              {item.selectedSize && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{item.selectedSize}</span>}
                                            </div>
                                          </div>
                                        </div>
                                        <span className="font-bold text-slate-900">Rs {(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                    ))}
                                    <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between font-bold text-slate-900">
                                      <span>Total Amount</span>
                                      <span className="text-gold text-lg">Rs {Number(o.total || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <div className="pt-4 space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shipping Details</p>
                                    <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl">
                                      <p><span className="font-bold">Email:</span> {o.customer?.email}</p>
                                      <p><span className="font-bold">Address:</span> {o.customer?.address}</p>
                                    </div>
                                    {o.signatureImage && (
                                      <div className="mt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Customer Signature</p>
                                        <img src={o.signatureImage} alt="Signature" className="h-20 w-auto bg-white border border-slate-200 rounded-lg p-2" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Status Update */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                  <h4 className="font-serif text-lg text-slate-900 border-b border-slate-100 pb-2">Update Status</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {['PLACED', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                                      <button
                                        key={s}
                                        onClick={() => updateStatus(o.id, s)}
                                        className={`px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                          o.status === s 
                                            ? 'bg-gold border-gold text-white shadow-md' 
                                            : 'border-slate-200 text-slate-600 hover:border-gold/50'
                                        }`}
                                      >
                                        {s}
                                      </button>
                                    ))}
                                  </div>
                                  {o.status === 'CANCELLED' && (
                                    <div className="space-y-2 pt-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cancellation Reason</label>
                                      <select
                                        value={selectedReason}
                                        onChange={(e) => {
                                          setSelectedReason(e.target.value);
                                          setMessage(`${statusMessages.CANCELLED.message} Reason: ${e.target.value}`);
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-gold"
                                      >
                                        {cancellationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => resendEmail(o.id)}
                                    disabled={sendingId === o.id}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                                  >
                                    {sendingId === o.id ? <RefreshCcw size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                                    Resend Order Email
                                  </button>
                                </div>

                                {/* Email/Communication */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                  <h4 className="font-serif text-lg text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <Mail size={18} className="text-gold" />
                                    Send Notification
                                  </h4>
                                  <div className="space-y-3">
                                    <input
                                      value={subject}
                                      onChange={(e) => setSubject(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-gold"
                                      placeholder="Email Subject"
                                    />
                                    <textarea
                                      value={message}
                                      onChange={(e) => setMessage(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-xs min-h-[80px] focus:outline-none focus:border-gold resize-none"
                                      placeholder="Custom message to customer..."
                                    />
                                    <button
                                      onClick={() => sendEmail(o.id)}
                                      disabled={sendingId === o.id}
                                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                                    >
                                      {sendingId === o.id ? <RefreshCcw size={14} className="animate-spin" /> : <Mail size={14} />}
                                      Send Custom Email
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
