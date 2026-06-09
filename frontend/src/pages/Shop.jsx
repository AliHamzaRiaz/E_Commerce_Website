import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, ShoppingCart, X, ChevronRight, Filter, ChevronDown, Package, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiUrl } from '../utils/apiUrl';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, cartItems, addToCart, toggleFavorite, isFavorite, selectingId, setSelectingId, tempColor, setTempColor, tempSize, setTempSize }) => {
  const defaultColor = (product.colors && product.colors[0]) || 'Default';
  const defaultSize = (product.sizes && product.sizes[0]) || 'One Size';
  const [activeColor, setActiveColor] = useState(defaultColor);
  
  const inCart = cartItems.some(
              (i) =>
                String(i.id) === String(product.id) &&
                String(i.selectedColor).toLowerCase() === String(activeColor).toLowerCase() &&
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
      
      if (pCat === sCat || sCat === 'all') {
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
    <div className="pb-24 bg-[#fcfcfc]">
      <div className="relative h-[30vh] overflow-hidden flex items-center justify-center bg-[#0b2a3d]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2a3d] to-[#0a1128] opacity-90" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-serif tracking-[0.2em] uppercase text-white">
            {selectedCategory === 'All' ? 'Collections' : selectedCategory}
          </h1>
          <p className="mt-2 text-gold/80 text-[10px] tracking-[0.4em] uppercase font-bold">
            {products.length} Items found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Filters and Sorting Bar */}
        <div className="flex flex-col space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-black/5">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[#0b2a3d] transition-all"
            >
              <Filter size={14} />
              Filters
            </button>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
            
            <div className="flex-grow" />

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              {['All', ...categories.map(c => c.displayName)].map((c) => {
                const categoryData = categories.find(cat => cat.displayName === c);
                const hasTypes = categoryData?.types?.length > 0;
                
                return (
                  <div 
                    key={c} 
                    className="relative group"
                    onMouseEnter={() => hasTypes && setHoveredCategory(c)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <button
                      onClick={() => setSearchParams(c === 'All' ? {} : { category: c })}
                      className={`flex items-center gap-1.5 px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedCategory === c 
                        ? 'bg-[#0b2a3d] text-white shadow-md' 
                        : 'bg-white text-gray-500 border border-neutral-100 hover:border-gold'
                      }`}
                    >
                      {c}
                      {hasTypes && <ChevronDown size={10} className={`transition-transform duration-300 ${hoveredCategory === c ? 'rotate-180' : ''}`} />}
                    </button>

                    {/* Dropdown for Categories with Types */}
                    {hasTypes && (
                      <div className={`absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-xl rounded-xl py-3 z-50 transition-all duration-300 transform origin-top ${hoveredCategory === c ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <div className="px-4 py-1 border-b border-neutral-50 mb-2">
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Select {c} Style</span>
                        </div>
                        <button
                          onClick={() => {
                            setSearchParams({ category: c });
                            setHoveredCategory(null);
                          }}
                          className="w-full text-left px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#0b2a3d] hover:bg-neutral-50 transition-colors"
                        >
                          All {c}
                        </button>
                        {categoryData.types.map((type, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSearchParams({ category: c, type: type.name });
                              setHoveredCategory(null);
                            }}
                            className="w-full text-left px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#0b2a3d] hover:bg-neutral-50 transition-colors flex items-center justify-between group/item"
                          >
                            {type.name}
                            <div className="w-1.5 h-1.5 rounded-full bg-gold opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtype (Style) Quick Filter Bar - Text Tags */}
          {selectedCategory !== 'All' && availableFilters.subtypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 py-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Quick Styles:</span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('type');
                  setSearchParams(params);
                }}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                  !selectedType 
                    ? 'bg-gold text-white shadow-md' 
                    : 'bg-white text-gray-400 border border-neutral-100 hover:border-gold/30'
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
                  className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                    selectedType === typeName 
                      ? 'bg-gold text-white shadow-md' 
                      : 'bg-white text-gray-500 border border-neutral-100 hover:border-gold'
                  }`}
                >
                  {typeName}
                </button>
              ))}
            </div>
          )}

          {/* Subcategory (Type) Visual Selector */}
          {selectedCategory !== 'All' && categories.find(c => c.displayName === selectedCategory)?.types?.length > 0 && (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/10 rounded-lg">
                    <Tag className="text-gold" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-[#0b2a3d] leading-none">Shop by {selectedCategory} Style</h2>
                    <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-bold">Select a style to refine your search</p>
                  </div>
                </div>
                {selectedType && (
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('type');
                      setSearchParams(params);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-gold hover:text-[#0b2a3d] transition-colors flex items-center gap-1 bg-gold/5 px-3 py-1.5 rounded-full"
                  >
                    <XCircle size={12} />
                    Clear Style
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide px-1">
                {/* Show All Card */}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('type');
                    setSearchParams(params);
                  }}
                  className={`flex-shrink-0 group relative w-28 sm:w-36 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${!selectedType ? 'border-gold shadow-lg -translate-y-1' : 'border-transparent hover:border-neutral-200'}`}
                >
                  <div className="absolute inset-0 bg-neutral-50 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Package className="text-neutral-400" size={20} />
                    </div>
                    <span className="text-[#0b2a3d] font-bold text-[9px] uppercase tracking-widest leading-tight">All<br/>{selectedCategory}</span>
                  </div>
                  {!selectedType && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 size={16} className="text-gold fill-white" />
                    </div>
                  )}
                </button>

                {/* Specific Type Cards */}
                {categories.find(c => c.displayName === selectedCategory).types.map((type, idx) => {
                  const isActive = selectedType === type.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('type', type.name);
                        setSearchParams(params);
                      }}
                      className={`flex-shrink-0 group relative w-28 sm:w-36 aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${isActive ? 'border-gold shadow-lg -translate-y-1' : 'border-transparent hover:border-neutral-200'}`}
                    >
                      <img 
                        src={type.image || '/imags/placeholder.jpg'} 
                        alt={type.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'bg-black/20' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90'}`} />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                        <span className="text-white text-[9px] font-bold uppercase tracking-widest drop-shadow-md block leading-tight mb-1">{type.name}</span>
                        {isActive && (
                          <div className="w-4 h-0.5 bg-white mx-auto rounded-full" />
                        )}
                      </div>

                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 size={16} className="text-gold fill-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 p-8 bg-white border border-neutral-100 rounded-2xl shadow-sm animate-in slide-in-from-top-4 duration-300">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 sm:gap-y-16">
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
      </div>
    </div>
  );
};

export default Shop;
