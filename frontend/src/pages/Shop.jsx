import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../utils/apiUrl';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, X, ChevronRight, Filter, ChevronDown, Package, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fallbackProducts, fallbackCategories } from '../data/fallbackData';

const ProductCard = ({ product, cartItems, addToCart, toggleFavorite, isFavorite, selectingId, setSelectingId, tempColor, setTempColor, tempSize, setTempSize }) => {
  const defaultColor = (product.colors && product.colors[0]) || 'Default';
  const defaultSize = (product.sizes && product.sizes[0]) || 'One Size';
  const [activeColor, setActiveColor] = useState(defaultColor);
  
  const inCart = (cartItems || []).some(
              (i) =>
                String(i.id) === String(product.id) &&
                String(i.selectedColor || '').toLowerCase() === String(activeColor || '').toLowerCase() &&
                String(i.selectedSize) === String(defaultSize)
            );

  const isSelecting = selectingId === product.id;
  const discountText = String(product.discount || '').trim();
  const discountPercent = discountText.includes('%') ? discountText : `-${discountText}`;

  // Get display image for the active color
  const getDisplayImage = () => {
    const colorKey = product.colorImages ? Object.keys(product.colorImages).find(
      k => k.trim().toLowerCase() === String(activeColor || '').trim().toLowerCase()
    ) : null;

    if (colorKey && product.colorImages[colorKey]) {
      const imgs = product.colorImages[colorKey];
      return Array.isArray(imgs) ? imgs[0] : imgs;
    }
    return product.image;
  };

  return (
    <div className="group flex flex-col space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-white rounded-sm border border-gray-50 flex items-center justify-center p-2">
        <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center">
          <img
            src={getDisplayImage()}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-all duration-700"
          />
        </Link>
        
        {/* Discount Badge */}
        {discountText && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-[#e41e31] text-white px-2 py-1 rounded-sm text-[11px] font-bold">
              {discountPercent}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-3 right-3 z-20 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={20} fill={isFavorite(product.id) ? "currentColor" : "none"} className={isFavorite(product.id) ? 'text-red-500' : ''} />
        </button>

        {/* Quick Add Button */}
        <button 
          onClick={() => {
            setSelectingId(product.id);
            setTempColor(activeColor);
          }}
          className="absolute bottom-3 right-3 z-20 p-2 bg-white rounded-full shadow-md text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ShoppingCart size={18} />
        </button>

        {/* Quick Add Overlay */}
        <div className={`absolute inset-0 bg-white/98 z-30 transition-all duration-300 flex flex-col items-center justify-center p-6 space-y-6 ${isSelecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <button 
            onClick={() => {
              setSelectingId(null);
              setTempColor('');
              setTempSize('');
            }} 
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 rounded-lg overflow-hidden shadow-sm">
                      <img 
                        src={(() => {
                          const colorKey = product.colorImages ? Object.keys(product.colorImages).find(
                            k => k.trim().toLowerCase() === String(tempColor || '').trim().toLowerCase()
                          ) : null;

                          if (colorKey && product.colorImages[colorKey]) {
                            const imgs = product.colorImages[colorKey];
                            return Array.isArray(imgs) ? imgs[0] : imgs;
                          }
                          return product.image;
                        })()} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>

          <div className="w-full space-y-4">
            <div className="space-y-2 text-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Color</span>
              <div className="flex flex-wrap justify-center gap-2">
                {(product.colors || []).map(c => (
                  <button
                    key={c}
                    onClick={() => setTempColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${String(tempColor || '').toLowerCase() === String(c || '').toLowerCase() ? 'border-black' : 'border-transparent'}`}
                  >
                    <div 
                      className="w-full h-full rounded-full border border-gray-200"
                      style={{ backgroundColor: c.toLowerCase().includes('black') ? '#1a1a1a' : 
                                             c.toLowerCase().includes('blue') ? '#0b2a3d' : 
                                             c.toLowerCase().includes('pink') ? '#fce7f3' : 
                                             c.toLowerCase().includes('nude') ? '#f3e5d8' : 
                                             c.toLowerCase().includes('white') ? '#ffffff' : 
                                             c.toLowerCase().includes('red') ? '#991b1b' : 
                                             c.toLowerCase().includes('green') ? '#064e3b' : c }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Size</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {(product.sizes || []).map(s => (
                  <button
                    key={s}
                    onClick={() => setTempSize(s)}
                    className={`px-3 py-1.5 text-[9px] border font-bold rounded-md transition-all ${tempSize === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-black'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (!tempColor || !tempSize) return;
                const displayImg = (() => {
                  const colorKey = product.colorImages ? Object.keys(product.colorImages).find(
                    k => k.trim().toLowerCase() === String(tempColor || '').trim().toLowerCase()
                  ) : null;
                  if (colorKey && product.colorImages[colorKey]) {
                    const imgs = product.colorImages[colorKey];
                    return Array.isArray(imgs) ? imgs[0] : imgs;
                  }
                  return product.image;
                })();
                addToCart(product, tempColor, tempSize, 1, displayImg);
                setSelectingId(null);
              }}
              disabled={!tempColor || !tempSize}
              className="w-full bg-black text-white py-3 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-all disabled:opacity-20 shadow-sm"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-left">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-bold text-[#e41e31]">PKR {product.price?.toLocaleString()}</span>
          </div>
          {discountText && (
            <span className="text-[12px] text-gray-400 line-through">PKR {(product.price * 1.25).toLocaleString()}</span>
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 font-medium">LIBBAAS • {product.name}</span>
          
          {/* Color Swatches in Grid */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex gap-1.5 mt-2">
              {product.colors.map(c => (
                <button
                  key={c}
                  onMouseEnter={() => setActiveColor(c)}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveColor(c);
                  }}
                  className={`w-3 h-3 rounded-full border transition-all ${String(activeColor || '').toLowerCase() === String(c || '').toLowerCase() ? 'ring-1 ring-black ring-offset-1' : 'border-gray-200'}`}
                  style={{ backgroundColor: String(c || '').toLowerCase().includes('black') ? '#1a1a1a' : 
                                       String(c || '').toLowerCase().includes('blue') ? '#0b2a3d' : 
                                       String(c || '').toLowerCase().includes('pink') ? '#fce7f3' : 
                                       String(c || '').toLowerCase().includes('nude') ? '#f3e5d8' : 
                                       String(c || '').toLowerCase().includes('white') ? '#ffffff' : 
                                       String(c || '').toLowerCase().includes('red') ? '#991b1b' : 
                                       String(c || '').toLowerCase().includes('green') ? '#064e3b' : c }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-[#2563eb] px-1.5 py-0.5 rounded-sm">
              <span className="text-[10px] font-bold text-white italic tracking-tighter">⚡ Express</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-400">★</span>
              <span className="text-[10px] font-bold text-gray-500">5.0 (2)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Shop = () => {
  const svgDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  const headerImage = svgDataUri(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="900" viewBox="0 0 2000 900">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b2a3d"/>
      <stop offset="45%" stop-color="#0a1128"/>
      <stop offset="100%" stop-color="#0b2a3d"/>
    </linearGradient>
    <radialGradient id="r" cx="70%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#c5a059" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#c5a059" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="2000" height="900" fill="url(#g)"/>
  <rect width="2000" height="900" fill="url(#r)"/>
  <g fill="none" stroke="#c5a059" opacity="0.45">
    <path d="M380,420 C520,270 720,210 1000,210 C1280,210 1480,270 1620,420" stroke-width="12"/>
    <path d="M500,560 C650,680 850,740 1000,740 C1150,740 1350,680 1500,560" stroke-width="10"/>
  </g>
</svg>`);
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isLoggedIn, isFavorite, toggleFavorite } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryTick, setRetryTick] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({}); // { "Cup Size": ["B", "C"] }
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // State for quick-add selection
  const [selectingId, setSelectingId] = useState(null);
  const [tempColor, setTempColor] = useState('');
  const [tempSize, setTempSize] = useState('');

  const selectedCategory = useMemo(() => {
    const c = String(searchParams.get('category') || '').trim();
    if (!c || c.toLowerCase() === 'all') return 'All';
    // Find the category in our list to ensure we use the correct case (e.g., 'Bra' vs 'BRA')
    const match = categories.find(cat => cat.displayName.toLowerCase() === c.toLowerCase());
    return match ? match.displayName : c;
  }, [searchParams, categories]);

  const searchQuery = useMemo(() => {
    return String(searchParams.get('search') || '').trim();
  }, [searchParams]);

  const selectedType = useMemo(() => {
    const t = String(searchParams.get('type') || '').trim();
    if (!t) return '';
    // If we have a category selected, try to find the official type name
    const catData = categories.find(c => c.displayName === selectedCategory);
    if (catData?.types) {
      const match = catData.types.find(type => type.name.toLowerCase() === t.toLowerCase());
      return match ? match.name : t;
    }
    return t;
  }, [searchParams, categories, selectedCategory]);

  // Extract unique colors, sizes, and custom variations from current products
  const availableFilters = useMemo(() => {
    const colors = new Set();
    const sizes = new Set();
    const subtypes = new Set();
    const variations = {}; // { "Cup Size": Set }

    products.forEach(p => {
      const pCat = String(p.category || '').toLowerCase();
      const sCat = String(selectedCategory || '').toLowerCase();
      
      // If we have a search query, we don't strictly filter by category for the filter options, 
      // or we do it based on the current filtered results. Let's stick to current logic but handle search.
      if ((pCat === sCat || sCat === 'all')) {
        (p.colors || []).forEach(c => colors.add(c));
        (p.sizes || []).forEach(s => sizes.add(s));
        if (p.type) subtypes.add(p.type);
        
        if (p.variations) {
          Object.entries(p.variations).forEach(([key, vals]) => {
            if (!variations[key]) variations[key] = new Set();
            (Array.isArray(vals) ? vals : []).forEach(v => variations[key].add(v));
          });
        }
      }
    });

    const finalVariations = {};
    Object.entries(variations).forEach(([key, set]) => {
      finalVariations[key] = Array.from(set).sort();
    });

    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      subtypes: Array.from(subtypes).sort(),
      variations: finalVariations
    };
  }, [products, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query) ||
        (p.type || '').toLowerCase().includes(query)
      );
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => String(p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Type (Subcategory) Filter
    if (selectedType) {
      result = result.filter(p => String(p.type || '').toLowerCase() === selectedType.toLowerCase());
    }

    // Color Filter
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        (p.colors || []).some(c => selectedColors.includes(c))
      );
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        (p.sizes || []).some(s => selectedSizes.includes(s))
      );
    }

    // Custom Variations Filter
    Object.entries(selectedVariations).forEach(([key, selectedVals]) => {
      if (selectedVals.length > 0) {
        result = result.filter(p => {
          const productVals = p.variations?.[key] || [];
          return (Array.isArray(productVals) ? productVals : []).some(v => selectedVals.includes(v));
        });
      }
    });

    // Price Filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, selectedCategory, selectedType, selectedColors, selectedSizes, selectedVariations, priceRange, sortBy]);

  const toggleColorFilter = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSizeFilter = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleVariationFilter = (key, value) => {
    setSelectedVariations(prev => {
      const current = prev[key] || [];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(apiUrl('/api/products'), {
            params: selectedCategory === 'All' ? {} : { category: selectedCategory },
          }),
          axios.get(apiUrl('/api/categories'))
        ]);
        
        if (!cancelled) {
          setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
          setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        }
      } catch (error) {
        console.error('Error fetching data', error);
        if (!cancelled) {
          setProducts([]);
          setCategories([]);
          const data = error?.response?.data;
          const detail =
            (data && typeof data === 'object' && (data.detail || data.message)) ||
            (typeof data === 'string' && data) ||
            error?.message;
          setFetchError(
            detail ||
              'Could not load products.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, retryTick]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
    </div>
  );

  return (
    <div className="pb-32 bg-white">
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-[#0b2a3d]">
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0b2a3d]/90 z-10" />
          <img 
            src="/imags/collection-images.jpg" 
            alt="Shop Header"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000";
            }}
          />
        </motion.div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <span className="text-gold tracking-[0.8em] uppercase text-[10px] font-bold block mb-4">
              {searchQuery ? 'Search Results' : 'The Collections'}
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight uppercase text-white leading-none">
              {searchQuery ? `"${searchQuery}"` : (selectedCategory === 'All' ? 'Art of Lingerie' : selectedCategory)}
            </h1>
            <div className="h-px w-24 bg-gold/50 mx-auto mt-10" />
            <p className="mt-10 text-white/60 text-[10px] tracking-[0.5em] uppercase font-bold">
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'Masterpiece' : 'Curated Masterpieces'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => {
                  searchParams.delete('search');
                  setSearchParams(searchParams);
                }}
                className="mt-8 text-white/40 hover:text-gold text-[9px] uppercase tracking-[0.3em] font-bold border-b border-white/10 hover:border-gold transition-all pb-1"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 mt-24">
        {/* Filters and Sorting Bar - High Profile Design */}
        <div className="flex flex-col space-y-16 mb-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 pb-12 border-b border-[#0b2a3d]/5">
            <div className="flex flex-wrap items-center gap-10">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-[#0b2a3d] hover:text-gold transition-all duration-700"
              >
                <div className={`p-2 rounded-full border transition-all duration-700 ${showFilters ? 'bg-gold border-gold text-white' : 'border-neutral-200 group-hover:border-gold'}`}>
                  <Filter size={12} strokeWidth={1.5} />
                </div>
                <span>{showFilters ? 'Close Filters' : 'Refine Selection'}</span>
              </button>

              <div className="hidden sm:block h-6 w-px bg-neutral-100" />

              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.4em]">Sort By</span>
                <div className="relative group">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-[11px] font-bold uppercase tracking-[0.3em] focus:outline-none cursor-pointer text-[#0b2a3d] pr-8 appearance-none"
                  >
                    <option value="default">Curation</option>
                    <option value="newest">New Arrivals</option>
                    <option value="price-low">Price Ascending</option>
                    <option value="price-high">Price Descending</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gold pointer-events-none group-hover:translate-y-0 transition-transform duration-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide no-scrollbar py-3 sm:py-4">
              {['All', ...categories.map(c => c.displayName)].map((c) => (
                <button
                  key={c}
                  onClick={() => setSearchParams(c === 'All' ? {} : { category: c })}
                  className={`relative flex-shrink-0 px-4 sm:px-8 lg:px-10 py-2.5 sm:py-3.5 lg:py-4 text-[8px] sm:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.35em] sm:tracking-[0.4em] transition-all duration-700 rounded-full overflow-hidden ${
                    selectedCategory === c 
                    ? 'text-white bg-[#0b2a3d] shadow-lg shadow-[#0b2a3d]/20 scale-105' 
                    : 'text-[#0b2a3d]/40 hover:text-[#0b2a3d] bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtype (Style) Quick Filter Bar - Luxury Style Edit */}
          {selectedCategory !== 'All' && availableFilters.subtypes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-gold/30" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.6em]">The Style Edit</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 scrollbar-hide">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('type');
                    setSearchParams(params);
                  }}
                  className={`group relative px-10 py-3 text-[9px] font-bold uppercase tracking-[0.3em] transition-all duration-700 rounded-xl border ${
                    !selectedType 
                      ? 'bg-[#0b2a3d] text-white border-[#0b2a3d] shadow-xl' 
                      : 'bg-white text-[#0b2a3d]/40 border-neutral-100 hover:border-gold/30 hover:text-[#0b2a3d]'
                  }`}
                >
                  All {selectedCategory}
                </button>
                {availableFilters.subtypes.map(typeName => (
                  <button
                    key={typeName}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      if (selectedType === typeName) {
                        params.delete('type');
                      } else {
                        params.set('type', typeName);
                      }
                      setSearchParams(params);
                    }}
                    className={`group relative px-10 py-3 text-[9px] font-bold uppercase tracking-[0.3em] transition-all duration-700 rounded-xl border ${
                      selectedType === typeName 
                        ? 'bg-gold text-white border-gold shadow-xl shadow-gold/20' 
                        : 'bg-white text-[#0b2a3d]/40 border-neutral-100 hover:border-gold/50 hover:text-[#0b2a3d]'
                    }`}
                  >
                    {typeName}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-12 p-12 bg-white border border-neutral-100 rounded-[2.5rem] luxury-shadow animate-in slide-in-from-top-6 duration-700">
              {/* Price Range */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price Range</span>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'All Prices', value: 'all' },
                    { label: 'Under Rs 1,000', value: '0-1000' },
                    { label: 'Rs 1,000 - 2,000', value: '1000-2000' },
                    { label: 'Over Rs 2,000', value: '2000-10000' }
                  ].map(range => (
                    <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="price" 
                        checked={priceRange === range.value}
                        onChange={() => setPriceRange(range.value)}
                        className="w-4 h-4 border-neutral-300 text-gold focus:ring-gold"
                      />
                      <span className={`text-xs ${priceRange === range.value ? 'text-[#0b2a3d] font-bold' : 'text-gray-500 group-hover:text-[#0b2a3d]'}`}>
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              {availableFilters.colors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Colors</span>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => toggleColorFilter(color)}
                        className={`group relative flex items-center justify-center p-0.5 rounded-full border-2 transition-all ${selectedColors.includes(color) ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                        title={color}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-100 shadow-sm"
                          style={{ backgroundColor: color.toLowerCase().includes('black') ? '#1a1a1a' : 
                                                 color.toLowerCase().includes('blue') ? '#0b2a3d' : 
                                                 color.toLowerCase().includes('pink') ? '#fce7f3' : 
                                                 color.toLowerCase().includes('nude') ? '#f3e5d8' : 
                                                 color.toLowerCase().includes('white') ? '#ffffff' : 
                                                 color.toLowerCase().includes('red') ? '#991b1b' : 
                                                 color.toLowerCase().includes('green') ? '#064e3b' : color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Filter */}
              {availableFilters.sizes.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sizes</span>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSizeFilter(size)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Variations Filters */}
              {Object.entries(availableFilters.variations).map(([key, values]) => (
                <div key={key} className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{key}</span>
                  <div className="flex flex-wrap gap-2">
                    {values.map(val => (
                      <button
                        key={val}
                        onClick={() => toggleVariationFilter(key, val)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          (selectedVariations[key] || []).includes(val) 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-black'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Clear Filters */}
              <div className="flex items-end pb-1">
                <button
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedSizes([]);
                    setSelectedVariations({});
                    setPriceRange('all');
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-16 lg:gap-y-24">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                cartItems={cartItems}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                selectingId={selectingId}
                setSelectingId={setSelectingId}
                tempColor={tempColor}
                setTempColor={setTempColor}
                tempSize={tempSize}
                setTempSize={setTempSize}
              />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <Package size={32} className="text-neutral-200" strokeWidth={1} />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-[#0b2a3d]">No Curations Found</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 max-w-xs mx-auto leading-relaxed">
                We couldn't find any pieces matching your request. Try refining your search or exploring our signatures.
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchParams({});
                setPriceRange('all');
                setSelectedColors([]);
                setSelectedSizes([]);
                setSelectedVariations({});
              }}
              className="px-10 py-4 bg-[#0b2a3d] text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm hover:bg-gold transition-colors duration-500"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
