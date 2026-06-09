import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  RefreshCcw, 
  Edit2, 
  Trash2, 
  LayoutDashboard,
  Tag,
  ImageIcon,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import adminApi from '../utils/adminApi';
import AdminNav from '../components/AdminNav';

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isAdminHost = window.location.hostname.startsWith('admin.');
  const loginPath = isAdminHost ? '/login' : '/admin/login';

  const emptyForm = {
    name: '',
    displayName: '',
    image: '',
    types: [], // Array of { name: '', image: '' }
  };

  const [form, setForm] = useState(emptyForm);

  const addType = () => {
    setForm(p => ({
      ...p,
      types: [...p.types, { name: '', image: '' }]
    }));
  };

  const removeType = (index) => {
    setForm(p => ({
      ...p,
      types: p.types.filter((_, i) => i !== index)
    }));
  };

  const updateType = (index, field, value) => {
    setForm(p => {
      const next = [...p.types];
      next[index] = { ...next[index], [field]: value };
      return { ...p, types: next };
    });
  };

  const handleTypeImage = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateType(index, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const logoutToLogin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    navigate(loginPath, { replace: true });
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/categories');
      setCategories(res.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutToLogin();
        return;
      }
      setError(err?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleImageFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Max 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const startEdit = (cat) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      displayName: cat.displayName,
      image: cat.image || '',
      types: Array.isArray(cat.types) ? cat.types : [],
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminApi.put(`/categories/${editingId}`, form);
      } else {
        await adminApi.post('/categories', form);
      }
      await load();
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Are you sure? This will not delete products in this category but they might not show up correctly.')) return;
    try {
      await adminApi.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif tracking-tight text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-gold" size={32} />
              Category Management
            </h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.1em]">
              {loading ? 'Loading...' : `Managing ${categories.length} categories`}
            </p>
          </div>
          <button 
            onClick={() => { setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0b2a3d] text-white rounded-xl shadow-lg hover:bg-black transition-all font-semibold text-sm"
          >
            <Plus size={18} />
            New Category
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 border border-red-200 bg-red-50 px-6 py-4 rounded-xl text-sm text-red-800">
            <XCircle size={20} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <form onSubmit={save} className="bg-white border border-slate-200 p-8 space-y-6 rounded-2xl shadow-sm sticky top-28">
              <h2 className="text-xl font-serif text-slate-900 border-b pb-4">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Category Name (ID)</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    disabled={!!editingId}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm disabled:opacity-50"
                    placeholder="e.g. bra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Display Name</label>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm"
                    placeholder="e.g. Bra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Category Image</label>
                  <div className="flex flex-col gap-4">
                    {form.image && (
                      <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl border" />
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-gold transition-colors">
                      <ImageIcon size={18} className="text-slate-400" />
                      <span className="text-sm text-slate-500 font-medium">Upload Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageFile(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Subcategories (Types)</label>
                    <button type="button" onClick={addType} className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline">
                      + Add Type
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {form.types.map((type, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative group/type">
                        <button 
                          type="button" 
                          onClick={() => removeType(idx)}
                          className="absolute -top-2 -right-2 p-1 bg-white border border-red-100 text-red-500 rounded-full shadow-sm opacity-0 group-hover/type:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                        <input
                          value={type.name}
                          onChange={(e) => updateType(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs"
                          placeholder="Type Name (e.g. Sports Bra)"
                        />
                        <div className="flex items-center gap-3">
                          {type.image ? (
                            <img src={type.image} className="w-10 h-10 rounded object-cover border" />
                          ) : (
                            <div className="w-10 h-10 bg-white border rounded flex items-center justify-center text-slate-300">
                              <ImageIcon size={14} />
                            </div>
                          )}
                          <label className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 text-center cursor-pointer hover:border-gold transition-colors uppercase tracking-widest">
                            Upload Type Image
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleTypeImage(idx, e.target.files[0])} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-4 bg-gold text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold/90 transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (editingId ? 'Update Category' : 'Create Category')}
              </button>
            </form>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between group hover:border-gold transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.displayName} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Tag size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900">{cat.displayName}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-tighter">{cat.name} • {cat.types?.length || 0} types</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(cat)} className="p-2 text-slate-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => remove(cat.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
