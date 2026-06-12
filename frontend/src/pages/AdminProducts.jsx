import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  RefreshCcw, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Tag, 
  Info,
  Layers,
  Palette,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import adminApi from '../utils/adminApi';
import AdminNav from '../components/AdminNav';

const parseList = (s) =>
  String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const AdminProducts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubtype, setSelectedSubtype] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const loginPath = isAdminHost ? '/login' : '/admin/login';
  const logoutToLogin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    navigate(loginPath, { replace: true });
  };

  // Check for edit param in URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editId);
      if (productToEdit) {
        startEdit(productToEdit);
        // Clear edit param
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('edit');
        setSearchParams(newParams, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [searchParams, products]);

  const emptyForm = useMemo(
    () => ({
      name: '',
      description: '',
      category: 'Bra',
      price: 0,
      originalPrice: 0,
      discount: '',
      colors: '',
      sizes: '',
      stock: 0,
      available: true,
      image: '',
      colorImages: {},
      variations: {}, // { "Variation Name": "val1, val2" }
      type: '',
    }),
    []
  );

  const [form, setForm] = useState(emptyForm);
  const [newVariationName, setNewVariationName] = useState('');

  const addVariationField = () => {
    if (!newVariationName.trim()) return;
    setForm(p => ({
      ...p,
      variations: { ...p.variations, [newVariationName.trim()]: '' }
    }));
    setNewVariationName('');
  };

  const removeVariationField = (name) => {
    setForm(p => {
      const next = { ...p.variations };
      delete next[name];
      return { ...p, variations: next };
    });
  };

  const handleImageFile = (file) => {
    if (!file) return;
    setError('');
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Please use an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((p) => ({ ...p, image: result }));
    };
    reader.onerror = () => setError('Failed to read image file');
    reader.readAsDataURL(file);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // Load products and categories sequentially for better error handling
      const prodRes = await adminApi.get('/products');
      setProducts(prodRes.data);

      try {
        const catRes = await adminApi.get('/categories');
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !editingId) {
          setForm(p => ({ ...p, category: catRes.data[0].displayName }));
        }
      } catch (catErr) {
        console.error('Failed to load categories:', catErr);
        // Don't fail the whole page if only categories fail, but set a default
        setCategories([]);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // After load completes, check again for editId
  useEffect(() => {
    if (!loading && products.length > 0) {
      const editId = searchParams.get('edit');
      if (editId) {
        const productToEdit = products.find(p => p.id === editId);
        if (productToEdit) {
          startEdit(productToEdit);
          // Clear edit param
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('edit');
          setSearchParams(newParams, { replace: true });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  }, [loading, products, searchParams]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (p) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(p.id);
    
    // Normalize colorImages to ensure every entry is an array
    const normalizedColorImages = {};
    if (p.colorImages && typeof p.colorImages === 'object') {
      Object.entries(p.colorImages).forEach(([color, val]) => {
        if (val) {
          normalizedColorImages[color] = Array.isArray(val) ? val : [val];
        }
      });
    }

    const formattedVariations = {};
    if (p.variations) {
      Object.entries(p.variations).forEach(([k, v]) => {
        formattedVariations[k] = Array.isArray(v) ? v.join(', ') : v;
      });
    }

    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'Bra',
      price: p.price || 0,
      originalPrice: p.originalPrice || 0,
      discount: p.discount || '',
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : (typeof p.colors === 'string' ? p.colors : ''),
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (typeof p.sizes === 'string' ? p.sizes : ''),
      stock: p.stock || 0,
      available: p.available !== false,
      image: p.image || '',
      colorImages: normalizedColorImages,
      variations: formattedVariations,
      type: p.type || '',
    });
  };

  const handleColorImageFile = (color, file) => {
    if (!file) return;
    setError('');
    if (file.size > 2 * 1024 * 1024) {
      setError(`Image for ${color} is too large. Max 2MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((p) => {
        // Use a consistent key by finding existing key case-insensitively or using the new one
        const existingKey = Object.keys(p.colorImages).find(k => k.trim().toLowerCase() === color.trim().toLowerCase());
        const keyToUse = existingKey || color;
        
        const currentImages = Array.isArray(p.colorImages[keyToUse]) ? p.colorImages[keyToUse] : (p.colorImages[keyToUse] ? [p.colorImages[keyToUse]] : []);
        return {
          ...p,
          colorImages: { 
            ...p.colorImages, 
            [keyToUse]: [...currentImages, result] 
          },
        };
      });
    };
    reader.onerror = () => setError(`Failed to read image for ${color}`);
    reader.readAsDataURL(file);
  };

  const removeColorImage = (color, index) => {
    setForm((p) => {
      const existingKey = Object.keys(p.colorImages).find(k => k.trim().toLowerCase() === color.trim().toLowerCase());
      const keyToUse = existingKey || color;
      
      const currentImages = Array.isArray(p.colorImages[keyToUse]) ? [...p.colorImages[keyToUse]] : [];
      currentImages.splice(index, 1);
      const nextColorImages = { ...p.colorImages };
      if (currentImages.length === 0) {
        delete nextColorImages[keyToUse];
      } else {
        nextColorImages[keyToUse] = currentImages;
      }
      return { ...p, colorImages: nextColorImages };
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const currentColors = parseList(form.colors).map(c => c.trim());
      // Clean up colorImages to only keep images for colors that still exist
      const cleanedColorImages = {};
      currentColors.forEach(c => {
        // Look for the color in a case-insensitive way
        const colorKey = Object.keys(form.colorImages).find(
          k => k.trim().toLowerCase() === c.toLowerCase()
        );
        
        if (colorKey && form.colorImages[colorKey]) {
          const val = form.colorImages[colorKey];
          cleanedColorImages[c] = Array.isArray(val) ? val : [val];
        }
      });

      const parsedVariations = {};
      Object.entries(form.variations).forEach(([k, v]) => {
        parsedVariations[k] = parseList(v);
      });

      const payload = {
        ...form,
        id: editingId, // Ensure ID is passed for updates
        price: Number(form.price || 0),
        originalPrice: Number(form.originalPrice || 0),
        stock: Number(form.stock || 0),
        colors: currentColors,
        sizes: parseList(form.sizes),
        available: !!form.available,
        colorImages: cleanedColorImages,
        variations: parsedVariations,
      };
      if (editingId) {
        await adminApi.put(`/products/${editingId}`, payload);
      } else {
        await adminApi.post('/products', payload);
      }
      await load();
      startCreate();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await adminApi.delete(`/products/${id}`);
      await load();
      if (editingId === id) startCreate();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  const toggleAvailability = async (p) => {
    setError('');
    try {
      await adminApi.put(`/products/${p.id}`, { available: !(p.available !== false) });
      await load();
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Update failed');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
      if (selectedSubtype !== 'All') {
        result = result.filter(p => p.type === selectedSubtype);
      }
    }
    return result;
  }, [products, selectedCategory, selectedSubtype]);

  const currentCategoryTypes = useMemo(() => {
    if (selectedCategory === 'All') return [];
    return categories.find(c => c.displayName === selectedCategory)?.types || [];
  }, [categories, selectedCategory]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      lowStock: products.filter(p => p.stock <= 5).length,
      hidden: products.filter(p => p.available === false).length,
      totalValue: products.reduce((acc, p) => acc + (p.price * p.stock), 0)
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <AdminNav />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Low Stock Items', value: stats.lowStock, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Hidden Products', value: stats.hidden, icon: EyeOff, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Inventory Value', value: `PKR ${stats.totalValue.toLocaleString()}`, icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#0b2a3d] p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-gold/20 p-2 rounded-xl">
                <Layers className="text-gold" size={24} />
              </div>
              <h1 className="text-3xl font-serif tracking-tight">Collection Master</h1>
            </div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Storefront Active • {stats.total} Products Managed
            </p>
          </div>

          <div className="relative z-10 flex gap-3">
            <button 
              onClick={load} 
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl border border-white/10 hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
            <button 
              onClick={startCreate} 
              className="flex items-center gap-2 px-8 py-3 bg-gold text-[#0b2a3d] rounded-2xl shadow-lg shadow-gold/20 hover:scale-105 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              <Plus size={18} />
              Create New
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-6 py-4 rounded-xl text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
            <XCircle size={20} />
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-4">
            <form onSubmit={save} className="bg-white border border-slate-200 p-8 space-y-8 rounded-[2.5rem] shadow-sm sticky top-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif text-slate-900">
                    {editingId ? 'Edit Product' : 'New Creation'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {editingId ? `Refining ID: ${editingId.slice(-6).toUpperCase()}` : 'Adding to collection'}
                  </p>
                </div>
                <div className="bg-gold/10 text-gold px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest">
                  {editingId ? 'Active Session' : 'New Entry'}
                </div>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {/* Basic Info Group */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Essential Details</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 ml-1">Title</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-slate-400"
                      placeholder="Product title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, type: '' }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl appearance-none"
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.displayName}>{cat.displayName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Subtype (Style)</label>
                      <input
                        list="subtype-suggestions"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-slate-400"
                        placeholder="e.g. Sports Bra"
                      />
                      <datalist id="subtype-suggestions">
                        {categories.find(c => c.displayName === form.category)?.types?.map((t, i) => (
                          <option key={i} value={t.name} />
                        ))}
                      </datalist>
                      <p className="text-[9px] text-slate-400 ml-1 italic">Type a new style or select from suggestions</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 ml-1">Narrative</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all min-h-[120px] rounded-2xl resize-none placeholder:text-slate-400"
                      placeholder="Product story and materials..."
                    />
                  </div>
                </div>

                {/* Pricing & Inventory Group */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Economics & Stock</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">List Price</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rs</span>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-5 py-3.5 text-sm tabular-nums focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Compare At</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rs</span>
                        <input
                          type="number"
                          value={form.originalPrice}
                          onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-5 py-3.5 text-sm tabular-nums focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Discount Text</label>
                      <input
                        value={form.discount}
                        onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl placeholder:text-slate-400"
                        placeholder="e.g. 15% OFF"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Stock Level</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm tabular-nums focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Variations Group */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette size={14} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Variation Matrix</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Available Colors</label>
                      <input
                        value={form.colors}
                        onChange={(e) => setForm((p) => ({ ...p, colors: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl"
                        placeholder="Black, White, Nude..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Available Sizes</label>
                      <input
                        value={form.sizes}
                        onChange={(e) => setForm((p) => ({ ...p, sizes: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-3.5 text-sm focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all rounded-2xl"
                        placeholder="32B, 34B, 36C..."
                      />
                    </div>

                    {/* Custom Variations Mapping */}
                    {Object.entries(form.variations).map(([name, values]) => (
                      <div key={name} className="flex gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group/var">
                        <button
                          type="button"
                          onClick={() => removeVariationField(name)}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-full shadow-sm opacity-0 group-hover/var:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{name}</p>
                          <input
                            value={values}
                            onChange={(e) => setForm(p => ({
                              ...p,
                              variations: { ...p.variations, [name]: e.target.value }
                            }))}
                            className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs"
                            placeholder="Comma separated values..."
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        value={newVariationName}
                        onChange={(e) => setNewVariationName(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs"
                        placeholder="Add property (e.g. Cup Size)"
                      />
                      <button
                        type="button"
                        onClick={addVariationField}
                        className="px-5 py-2.5 bg-[#0b2a3d] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media Group */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={14} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Media Library</span>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-700 ml-1">Cover Image</label>
                    <div className="group relative border-2 border-dashed border-slate-200 rounded-[2rem] p-6 hover:border-gold/30 hover:bg-gold/5 transition-all overflow-hidden bg-slate-50/50">
                      {form.image ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
                          <img src={form.image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => setForm((p) => ({ ...p, image: '' }))}
                              className="p-3 bg-white text-red-500 rounded-full shadow-xl hover:scale-110 transition-transform"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 text-center space-y-3">
                          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block text-slate-300 group-hover:text-gold transition-colors">
                            <ImageIcon size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drop product cover</p>
                            <p className="text-[9px] text-slate-400">PNG, JPG up to 2MB</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Color Specific Images */}
                  {parseList(form.colors).length > 0 && (
                    <div className="space-y-4 mt-6">
                      <label className="text-[11px] font-bold text-slate-700 ml-1">Color Palette Photos</label>
                      <div className="space-y-4">
                        {parseList(form.colors).map((color) => {
                          const colorKey = Object.keys(form.colorImages).find(k => k.trim().toLowerCase() === color.trim().toLowerCase()) || color;
                          const images = Array.isArray(form.colorImages[colorKey]) ? form.colorImages[colorKey] : (form.colorImages[colorKey] ? [form.colorImages[colorKey]] : []);
                          
                          return (
                            <div key={color} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color.toLowerCase() }} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">{color}</span>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-white border border-slate-100 rounded-lg text-slate-400">
                                  {images.length} Shots
                                </span>
                              </div>
                              
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, idx) => (
                                  <div key={idx} className="relative h-24 w-20 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0 group/img">
                                    <img src={img} alt="" className="h-full w-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeColorImage(color, idx)}
                                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                                <div className="relative h-24 w-20 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-gold hover:text-gold hover:bg-white transition-all cursor-pointer shrink-0 bg-white/50">
                                  <Plus size={20} />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleColorImageFile(color, e.target.files?.[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 space-y-4">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer group hover:bg-slate-100 transition-all">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={!!form.available}
                      onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-200 checked:bg-gold checked:border-gold transition-all"
                    />
                    <CheckCircle2 size={16} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Online Visibility</p>
                    <p className="text-[9px] text-slate-400">Show this product on the main storefront</p>
                  </div>
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0b2a3d] text-white py-4 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                  >
                    {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : editingId ? 'Update Piece' : 'Launch Product'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={startCreate} 
                      className="px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-[1.5rem] hover:bg-slate-50 transition-all font-bold uppercase tracking-widest text-[10px]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-8 space-y-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 p-3 rounded-3xl shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-hide font-serif">
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedSubtype('All'); }}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === 'All'
                      ? 'bg-[#0b2a3d] text-white shadow-lg shadow-[#0b2a3d]/20'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.displayName); setSelectedSubtype('All'); }}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedCategory === cat.displayName
                        ? 'bg-gold text-white shadow-lg shadow-gold/20'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {cat.displayName}
                  </button>
                ))}
              </div>

              {/* Subtype Filter - Only shows if category is selected and has types */}
              {selectedCategory !== 'All' && currentCategoryTypes.length > 0 && (
                <div className="bg-white/50 border border-slate-100 p-2 rounded-2xl flex items-center gap-2 overflow-x-auto scrollbar-hide animate-in slide-in-from-left-2 duration-300">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-3 mr-1">Styles:</span>
                  <button
                    onClick={() => setSelectedSubtype('All')}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                      selectedSubtype === 'All'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white'
                    }`}
                  >
                    All {selectedCategory}
                  </button>
                  {currentCategoryTypes.map((type, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubtype(type.name)}
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedSubtype === type.name
                          ? 'bg-gold/10 text-gold border border-gold/20'
                          : 'text-slate-500 hover:bg-white border border-transparent'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Product</th>
                      <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Category</th>
                      <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Price</th>
                      <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Stock</th>
                      <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold text-center">Status</th>
                      <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-8 py-6" colSpan={6}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                              <div className="space-y-2">
                                <div className="h-4 w-48 bg-slate-100 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td className="px-8 py-20 text-center" colSpan={6}>
                          <div className="flex flex-col items-center gap-4 text-slate-400">
                            <div className="bg-slate-50 p-6 rounded-full">
                              <Package size={48} className="text-slate-200" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-serif text-xl text-slate-900">No products found</p>
                              <p className="text-sm">Try changing your filters or add a new piece.</p>
                            </div>
                            <button onClick={startCreate} className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline mt-2">
                              Create your first product
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className="h-16 w-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                {p.image ? (
                                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <ImageIcon size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-gold transition-colors">{p.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">SKU: {p.id.slice(-6).toUpperCase()}</span>
                                  {p.type && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                                      <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{p.type}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">PKR {Number(p.price || 0).toLocaleString()}</span>
                              {p.originalPrice > p.price && (
                                <span className="text-[10px] text-red-400 line-through font-medium">PKR {Number(p.originalPrice).toLocaleString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-[11px] font-bold ${Number(p.stock || 0) <= 5 ? 'text-amber-600' : 'text-slate-600'}`}>
                                  {p.stock} <span className="text-[9px] font-medium text-slate-400 uppercase">Left</span>
                                </span>
                              </div>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${Number(p.stock || 0) <= 5 ? 'bg-amber-500' : 'bg-[#0b2a3d]'}`}
                                  style={{ width: `${Math.min(100, (Number(p.stock || 0) / 50) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <button
                                onClick={() => toggleAvailability(p)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                                  p.available !== false
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {p.available !== false ? (
                                  <><Eye size={12} /> Live</>
                                ) : (
                                  <><EyeOff size={12} /> Hidden</>
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEdit(p)}
                                className="p-2.5 text-slate-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
                                title="Edit Product"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => remove(p.id)}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete Product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
